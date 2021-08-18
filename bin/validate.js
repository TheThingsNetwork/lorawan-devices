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

const ajv = new Ajv({ schemas: [require('../lib/draft/schema.json'), require('../schema.json')] });

const options = yargs.usage('Usage: --vendor <file>').option('v', {
  alias: 'vendor',
  describe: 'Path to vendor index file',
  type: 'string',
  demandOption: true,
  default: './vendor/index.yaml',
}).argv;

let validateVendors = ajv.compile({
  $ref: 'https://schema.thethings.network/devicerepository/1/schema#/definitions/vendors',
});
let validateVendor = ajv.compile({
  $ref: 'https://schema.thethings.network/devicerepository/1/schema#/definitions/vendor',
});
let validateEndDevice = ajv.compile({
  $ref: 'https://lorawan-schema.org/draft/devices/1/schema#/definitions/endDevice',
});
let validateEndDeviceProfile = ajv.compile({
  $ref: 'https://lorawan-schema.org/draft/devices/1/schema#/definitions/endDeviceProfile',
});
let validateEndDevicePayloadCodec = ajv.compile({
  $ref: 'https://lorawan-schema.org/draft/devices/1/schema#/definitions/endDevicePayloadCodec',
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

function requireDimensions(path) {
  return requireFile(path).then(
    () =>
      new Promise((resolve, reject) => {
        sizeOf(path, (err, dimensions) => {
          if (err) {
            reject(new Error(`load image ${path}: ${err}`));
          } else if (dimensions.width > 2000 || dimensions.height > 2000) {
            reject(
              new Error(
                `image ${path} too large: maximum is 2000x2000 but loaded ${dimensions.width}x${dimensions.height}`
              )
            );
          } else {
            resolve();
          }
        });
      })
  );
}

function validatePayloadCodecs(vendorId, payloadEncoding) {
  var runs = [];
  var promises = [];

  [
    { def: payloadEncoding.uplinkDecoder, routine: 'decodeUplink' },
    { def: payloadEncoding.downlinkEncoder, routine: 'encodeDownlink' },
    { def: payloadEncoding.downlinkDecoder, routine: 'decodeDownlink' },
  ].forEach((d) => {
    if (d.def) {
      let fileName = `${vendorId}/${d.def.fileName}`;
      promises.push(requireFile(fileName));
      if (d.def.examples) {
        d.def.examples.forEach((e) => {
          runs.push({
            fileName: fileName,
            routine: d.routine,
            ...e,
          });
        });
      }
    }
  });

  runs.forEach((r) => {
    promises.push(
      new Promise((resolve, reject) => {
        exec(
          `bin/runscript -codec-path "${r.fileName}" -routine ${r.routine} -input '${JSON.stringify(r.input)}'`,
          (err, stdout, stderr) => {
            if (err) {
              reject(err);
            } else if (stderr) {
              reject(stderr);
            } else {
              const expected = r.output;
              const actual = JSON.parse(stdout);
              if (isEqual(expected, actual)) {
                console.debug(`${r.fileName}:${r.routine}: ${r.description} has correct output`);
                resolve();
              } else {
                reject(
                  `${r.fileName}:${r.routine}: output ${JSON.stringify(actual)} does not match ${JSON.stringify(
                    expected
                  )}`
                );
              }
            }
          }
        );
      })
    );
  });
  return Promise.all(promises);
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

const vendors = yaml.load(fs.readFileSync(options.vendor));

if (!validateVendors(vendors)) {
  console.error(`${options.vendor} is invalid: ${formatValidationErrors(validateVendors.errors)}`);
  process.exit(1);
}
console.log(`vendor index: valid`);

const vendorProfiles = {};

vendors.vendors.forEach((v) => {
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
    if (!validateVendor(vendor)) {
      console.error(`${key}: invalid index: ${formatValidationErrors(validateVendor.errors)}`);
      process.exit(1);
    }
    console.log(`${v.id}: valid index`);

    const codecs = {};

    vendor.endDevices.forEach((d) => {
      const key = `${v.id}: ${d}`;

      const endDevice = yaml.load(fs.readFileSync(`${folder}/${d}.yaml`));
      if (!validateEndDevice(endDevice)) {
        console.error(`${key}: invalid: ${formatValidationErrors(validateEndDevice.errors)}`);
        process.exit(1);
      }
      console.log(`${key}: valid`);

      endDevice.firmwareVersions.forEach((version) => {
        const key = `${v.id}: ${d}: ${version.version}`;

        if (Boolean(version.hardwareVersions) != Boolean(endDevice.hardwareVersions)) {
          console.error(
            `${key}: hardware versions are inconsistent: when used in end device, use in firmware versions (and vice-versa)`
          );
          process.exit(1);
        }
        if (version.hardwareVersions) {
          version.hardwareVersions.forEach((hardwareVersion) => {
            if (!endDevice.hardwareVersions.find((v) => v.version === hardwareVersion)) {
              console.error(`${key}: hardware version ${hardwareVersion} not found in supported hardware versions`);
              process.exit(1);
            }
          });
        }

        Object.keys(version.profiles).forEach((region) => {
          const regionProfile = version.profiles[region];
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

          if (regionProfile.codec && !codecs[regionProfile.codec]) {
            const codec = yaml.load(fs.readFileSync(`${folder}/${regionProfile.codec}.yaml`));
            if (!validateEndDevicePayloadCodec(codec)) {
              console.error(
                `${key}: codec ${regionProfile.codec} invalid: ${formatValidationErrors(
                  validateEndDevicePayloadCodec.errors
                )}`
              );
              process.exit(1);
            }
            codecs[regionProfile.codec] = true;
            validatePayloadCodecs(folder, codec)
              .then(() => console.log(`${key}: payload codec ${regionProfile.codec} valid`))
              .catch((err) => {
                console.error(`${key}: payload codec ${regionProfile.codec} invalid`);
                console.error(err);
                process.exit(1);
              });
          }
        });
      });

      if (endDevice.photos) {
        validateImageExtension(`${folder}/${endDevice.photos.main}`)
          .then(() => console.log(`${key}: ${endDevice.photos.main} image has correct extension`))
          .catch((err) => {
            console.error(err);
            process.exit(1);
          });
        requireImageDecode(`${folder}/${endDevice.photos.main}`)
          .then(() => console.log(`${key}: ${endDevice.photos.main} is valid`))
          .catch((err) => {
            console.error(err);
            process.exit(1);
          });
        requireDimensions(`${folder}/${endDevice.photos.main}`)
          .then(() => console.log(`${key}: ${endDevice.photos.main} has the right dimensions`))
          .catch((err) => {
            console.error(`${key}: ${err}`);
            process.exit(1);
          });
        if (endDevice.photos.other) {
          endDevice.photos.other.forEach((p) => {
            validateImageExtension(`${folder}/${p}`)
              .then(() => console.log(`${key}: ${p} image has correct extension`))
              .catch((err) => {
                console.error(err);
                process.exit(1);
              });
            requireImageDecode(`${folder}/${p}`)
              .then(() => console.log(`${key}: ${p} is valid`))
              .catch((err) => {
                console.error(err);
                process.exit(1);
              });
            requireDimensions(`${folder}/${p}`)
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
