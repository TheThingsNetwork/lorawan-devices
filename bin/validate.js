#!/usr/bin/env node

const Ajv = require('ajv');
const yargs = require('yargs');
const fs = require('fs');
const yaml = require('js-yaml');
const sizeOf = require('image-size');
const { exec } = require('child_process');
const isEqual = require('lodash.isequal');
const readChunk = require('read-chunk');
const imageType = require('image-type');

const ajv = new Ajv({ schemas: [require('../lib/payload.json'), require('../schema.json')] });

const options = yargs.usage('Usage: --vendor <id>').option('v', {
  alias: 'vendor',
  describe: 'Vendor ID',
  type: 'string',
  demandOption: true,
  default: '',
}).argv;

let validateVendorsIndex = ajv.compile({
  $ref: 'https://schema.thethings.network/devicerepository/1/schema#/definitions/vendorsIndex',
});
let validateVendorIndex = ajv.compile({
  $ref: 'https://schema.thethings.network/devicerepository/1/schema#/definitions/vendorIndex',
});
let validateEndDevice = ajv.compile({
  $ref: 'https://schema.thethings.network/devicerepository/1/schema#/definitions/endDevice',
});
let validateEndDeviceProfile = ajv.compile({
  $ref: 'https://schema.thethings.network/devicerepository/1/schema#/definitions/endDeviceProfile',
});
let validateEndDevicePayloadCodec = ajv.compile({
  $ref: 'https://schema.thethings.network/devicerepository/1/schema#/definitions/endDevicePayloadCodec',
});

function requireFile(path) {
  if (path.toLowerCase() !== path) {
    return Promise.reject(new Error(`${path} is not lowercase`));
  }
  return new Promise((resolve, reject) => {
    fs.stat(path, (err) => {
      if (err) {
        reject(new Error(`stat ${path}: ${err.code}`));
      } else {
        resolve();
      }
    });
  });
}

async function requireDimensions(path) {
  await requireFile(path);
  return await new Promise((resolve, reject) => {
    sizeOf(path, (err, dimensions) => {
      if (err) {
        reject(new Error(`load image ${path}: ${err}`));
      } else if (dimensions.width > 2000 || dimensions.height > 2000) {
        reject(
          new Error(`image ${path} too large: maximum is 2000x2000 but loaded ${dimensions.width}x${dimensions.height}`)
        );
      } else {
        resolve();
      }
    });
  });
}

async function validatePayloadCodecs(vendorId, endDeviceId, hardwareVersion, firmwareVersion, region, payloadEncoding) {
  var runs = [];
  var promises = [];

  [
    { def: payloadEncoding.uplinkDecoder, routine: 'decodeUplink' },
    { def: payloadEncoding.downlinkEncoder, routine: 'encodeDownlink' },
    { def: payloadEncoding.downlinkDecoder, routine: 'decodeDownlink' },
  ].forEach((d) => {
    if (d.def) {
      const { routine } = d;
      const fileName = `${vendorId}/${d.def.fileName}`;
      promises.push(requireFile(fileName));
      if (d.def.examples) {
        d.def.examples.forEach((e) => {
          const { hardwareVersions, input, output, description, normalizedOutput } = e;
          if (hardwareVersions && hardwareVersions.indexOf(hardwareVersion) === -1) {
            return;
          }
          runs.push({
            fileName,
            routine,
            description,
            input,
            output,
          });
          if (normalizedOutput && d.routine === 'decodeUplink') {
            runs.push({
              fileName,
              routine: 'normalizeUplink',
              description: `${description} (normalized)`,
              input: {
                version: {
                  vendorID: vendorId,
                  endDeviceID: endDeviceId,
                  hardwareVersion,
                  firmwareVersion,
                  region,
                },
                data: output.data,
              },
              output: normalizedOutput,
              transformOutput: (output) => {
                // The normalizer can return an object or an array of objects.
                // If it's an object, convert it to an array with a single item.
                if (output.data && !Array.isArray(output.data)) {
                  output.data = [output.data];
                }
                return output;
              },
            });
          }
        });
      }
    }
  });

  const concurrency = 8;
  for (var i = 0; i < runs.length; i += concurrency) {
    const batch = runs.slice(i, i + concurrency);
    await Promise.all(
      batch.map((r) => {
        new Promise((resolve, reject) => {
          exec(
            `bin/runscript -codec-path "${r.fileName}" -routine ${r.routine} -input '${JSON.stringify(r.input)}'`,
            (err, stdout, stderr) => {
              if (err) {
                reject(err);
              } else if (stderr) {
                reject(stderr);
              } else {
                const key = `${r.fileName}: ${r.routine}: HW ${hardwareVersion}: FW ${firmwareVersion}: ${region}`;
                const expected = r.output;
                let actual = JSON.parse(stdout);
                if (r.transformOutput) {
                  actual = r.transformOutput(actual);
                }
                if (isEqual(expected, actual)) {
                  console.debug(`${key}: ${r.description} has correct output`);
                  resolve();
                } else {
                  reject(`${key}: output ${JSON.stringify(actual)} does not match ${JSON.stringify(expected)}`);
                }
              }
            }
          );
        });
      })
    );
  }
}

function validateImageExtension(filename) {
  return new Promise((resolve, reject) => {
    const buffer = readChunk.sync(filename, 0, 12);
    const type = imageType(buffer);
    const ext = filename.split('.').pop();
    if (ext !== type.ext) {
      if (ext === 'jpeg' && type.ext === 'jpg') {
        resolve();
      }
      reject(`${filename} extension is incorrect, it should be ${type.ext}`);
    } else {
      resolve();
    }
  });
}

function requireImageDecode(fileName) {
  // Test https://golang.org/pkg/image/png/#Decode and https://golang.org/pkg/image/jpeg/#Decode are possible
  return new Promise((resolve, reject) => {
    exec(`bin/validate-image ${fileName}`, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

function formatValidationErrors(errors) {
  return errors.map((e) => `${e.dataPath} ${e.message}`);
}

const vendors = yaml.load(fs.readFileSync('./vendor/index.yaml'));

if (!validateVendorsIndex(vendors)) {
  console.error(`${options.vendor} index is invalid: ${formatValidationErrors(validateVendorsIndex.errors)}`);
  process.exit(1);
}
console.log(`vendor index: valid`);

const vendorProfiles = {};

vendors.vendors.forEach((v) => {
  if (options.vendor && v.id !== options.vendor) {
    return;
  }

  const key = v.id;
  const folder = `./vendor/${v.id}`;
  if (v.logo) {
    requireFile(`${folder}/${v.logo}`).catch((err) => {
      console.error(`${key}: ${err}`);
      process.exit(1);
    });
  }

  const vendorIndexPath = `${folder}/index.yaml`;
  fs.stat(vendorIndexPath, (err) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        console.error(`${key}: index file: ${err.code}`);
        process.exit(1);
      }
      return;
    }

    const vendor = yaml.load(fs.readFileSync(vendorIndexPath));
    if (!validateVendorIndex(vendor)) {
      console.error(`${key}: invalid index: ${formatValidationErrors(validateVendorIndex.errors)}`);
      process.exit(1);
    }
    console.log(`${v.id}: valid index`);

    for (let d of vendor.endDevices) {
      const key = `${v.id}: ${d}`;

      const endDevice = yaml.load(fs.readFileSync(`${folder}/${d}.yaml`));
      if (!validateEndDevice(endDevice)) {
        console.error(`${key}: invalid: ${formatValidationErrors(validateEndDevice.errors)}`);
        process.exit(1);
      }
      console.log(`${key}: valid`);

      await Promise.all(
        endDevice.firmwareVersions.map(async (firmwareVersion) => {
          const key = `${v.id}: ${d}: ${firmwareVersion.version}`;

          if (Boolean(firmwareVersion.hardwareVersions) != Boolean(endDevice.hardwareVersions)) {
            console.error(
              `${key}: hardware versions are inconsistent: when used in end device, use in firmware versions (and vice-versa)`
            );
            process.exit(1);
          }
          if (firmwareVersion.hardwareVersions) {
            firmwareVersion.hardwareVersions.forEach((hardwareVersion) => {
              if (!endDevice.hardwareVersions.find((v) => v.version === hardwareVersion)) {
                console.error(`${key}: hardware version ${hardwareVersion} not found in supported hardware versions`);
                process.exit(1);
              }
            });
          }

          await Promise.all(
            Object.keys(firmwareVersion.profiles).map(async (region) => {
              const regionProfile = firmwareVersion.profiles[region];
              const key = `${v.id}: ${d}: ${region}`;
              const vendorID = regionProfile.vendorID ?? v.id;
              if (!vendorProfiles[vendorID]) {
                vendorProfiles[vendorID] = {};
              }
              if (!vendorProfiles[vendorID][regionProfile.id]) {
                const profile = yaml.load(fs.readFileSync(`./vendor/${vendorID}/${regionProfile.id}.yaml`));
                if (!validateEndDeviceProfile(profile)) {
                  console.error(
                    `${key}: profile ${vendorID}/${regionProfile.id} invalid: ${formatValidationErrors(
                      validateEndDeviceProfile.errors
                    )}`
                  );
                  process.exit(1);
                }
              }
              vendorProfiles[vendorID][regionProfile.id] = true;
              console.log(`${key}: profile ${vendorID}/${regionProfile.id} valid`);

              if (regionProfile.codec) {
                const codec = yaml.load(fs.readFileSync(`${folder}/${regionProfile.codec}.yaml`));
                if (!validateEndDevicePayloadCodec(codec)) {
                  console.error(
                    `${key}: codec ${regionProfile.codec} invalid: ${formatValidationErrors(
                      validateEndDevicePayloadCodec.errors
                    )}`
                  );
                  process.exit(1);
                }

                const hardwareVersions = firmwareVersion.hardwareVersions || [''];
                await Promise.all(
                  hardwareVersions.map(async (hardwareVersion) => {
                    const key = `${v.id}: ${d}: HW ${hardwareVersion}: FW ${firmwareVersion.version}: ${region}`;
                    await validatePayloadCodecs(folder, d, hardwareVersion, firmwareVersion.version, region, codec)
                      .then(() => console.log(`${key}: payload codec ${regionProfile.codec} valid`))
                      .catch((err) => {
                        console.error(`${key}: payload codec ${regionProfile.codec} invalid`);
                        console.error(err);
                        process.exit(1);
                      });
                  })
                );
              }
            })
          );
        })
      );

      if (endDevice.photos) {
        await validateImageExtension(`${folder}/${endDevice.photos.main}`)
          .then(() => console.log(`${key}: ${endDevice.photos.main} image has correct extension`))
          .catch((err) => {
            console.error(err);
            process.exit(1);
          });
        await requireImageDecode(`${folder}/${endDevice.photos.main}`)
          .then(() => console.log(`${key}: ${endDevice.photos.main} is valid`))
          .catch((err) => {
            console.error(err);
            process.exit(1);
          });
        await requireDimensions(`${folder}/${endDevice.photos.main}`)
          .then(() => console.log(`${key}: ${endDevice.photos.main} has the right dimensions`))
          .catch((err) => {
            console.error(`${key}: ${err}`);
            process.exit(1);
          });
        if (endDevice.photos.other) {
          endDevice.photos.other.forEach(async (p) => {
            await validateImageExtension(`${folder}/${p}`)
              .then(() => console.log(`${key}: ${p} image has correct extension`))
              .catch((err) => {
                console.error(err);
                process.exit(1);
              });
            await requireImageDecode(`${folder}/${p}`)
              .then(() => console.log(`${key}: ${p} is valid`))
              .catch((err) => {
                console.error(err);
                process.exit(1);
              });
            await requireDimensions(`${folder}/${p}`)
              .then(() => console.log(`${key}: ${p} has the right dimensions`))
              .catch((err) => {
                console.error(`${key}: ${err}`);
                process.exit(1);
              });
          });
        }
      }
    });
  });
});
