#!/usr/bin/env node

const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const yargs = require('yargs');
const fs = require('fs');
const yaml = require('js-yaml');
const sizeOf = require('image-size');
const { spawn } = require('child_process');
const isEqual = require('lodash.isequal');
const readChunk = require('read-chunk');
const imageType = require('image-type');

const ajv = new Ajv({ schemas: [require('../lib/payload.json'), require('../schema.json')] });
addFormats(ajv);

const options = yargs
  .usage('Usage: --vendor <file> [--vendor-id <id>]')
  .option('v', {
    alias: 'vendor',
    describe: 'Path to vendor index file',
    type: 'string',
    demandOption: true,
    default: './vendor/index.yaml',
  })
  .option('vendor-id', {
    describe: 'Specific vendor ID to validate',
    type: 'string',
  }).argv;

const schemaId = 'https://schema.thethings.network/devicerepository/1/schema';
const validateVendorsIndex = ajv.getSchema(`${schemaId}#/$defs/vendorsIndex`);
const validateVendorIndex = ajv.getSchema(`${schemaId}#/$defs/vendorIndex`);
const validateEndDevice = ajv.getSchema(`${schemaId}#/$defs/endDevice`);
const validateEndDeviceProfile = ajv.getSchema(`${schemaId}#/$defs/endDeviceProfile`);
const validateEndDevicePayloadCodec = ajv.getSchema(`${schemaId}#/$defs/endDevicePayloadCodec`);

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

async function validatePayloadCodecs(vendorId, payloadEncoding) {
  const runs = [];

  [
    { def: payloadEncoding.uplinkDecoder, routine: 'decodeUplink' },
    { def: payloadEncoding.downlinkEncoder, routine: 'encodeDownlink' },
    { def: payloadEncoding.downlinkDecoder, routine: 'decodeDownlink' },
  ].forEach((d) => {
    if (d.def) {
      const { routine } = d;
      const fileName = `${vendorId}/${d.def.fileName}`;
      if (d.def.examples) {
        d.def.examples.forEach((e) => {
          const { input, output, description, normalizedOutput } = e;
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
              input: output,
              output: normalizedOutput,
              transformOutput: (output) => {
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

  for (const r of runs) {
    try {
      const childProcess = spawn('bin/runscript', [
        '-codec-path',
        r.fileName,
        '-routine',
        r.routine,
        '-input',
        JSON.stringify(r.input),
      ]);

      let stdout = '';
      let stderr = '';

      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      await new Promise((resolve, reject) => {
        childProcess.on('error', (error) => {
          reject(error);
        });

        childProcess.on('close', (code) => {
          if (code !== 0) {
            reject(`Process exited with code ${code}\n${stderr}`);
          } else {
            const expected = r.output;
            let actual = JSON.parse(stdout);
            if (r.transformOutput) {
              actual = r.transformOutput(actual);
            }
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
        });
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
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
      } else {
        reject(`${filename} extension is incorrect, it should be ${type.ext}`);
      }
    } else {
      resolve();
    }
  });
}

function requireImageDecode(fileName) {
  // Test https://golang.org/pkg/image/png/#Decode and https://golang.org/pkg/image/jpeg/#Decode are possible
  return new Promise((resolve, reject) => {
    const childProcess = spawn('bin/validate-image', [fileName]);
    childProcess.on('error', (error) => {
      reject(error);
    });
    childProcess.on('close', (code) => {
      if (code !== 0) {
        reject(`Process exited with code ${code}`);
      } else {
        resolve();
      }
    });
  });
}

function formatValidationErrors(errors) {
  return errors.map((e) => `${e.instancePath} ${e.message}`);
}

const vendors = yaml.load(fs.readFileSync(options.vendor));

// Get the list of vendor IDs from the vendor/index.yaml
const vendorIds = vendors.vendors.map((vendor) => vendor.id);

// Get the list of vendor folders in the vendor directory
const vendorFolders = fs
  .readdirSync('./vendor', { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// Check for vendor folders that are not listed in the vendor/index.yaml
const vendorsNotInIndex = vendorFolders.filter((folderName) => !vendorIds.includes(folderName));

if (vendorsNotInIndex.length > 0) {
  console.error(
    `Vendors found in the 'vendor' folder that are not listed in ${options.vendor} index:\n${vendorsNotInIndex.join(
      ', '
    )}`
  );
  process.exit(1);
} else {
  console.log(`All vendors in the 'vendor' folder are listed in ${options.vendor} index.`);
}

// Validate vendors index
if (!validateVendorsIndex(vendors)) {
  console.error(`${options.vendor} index is invalid: ${formatValidationErrors(validateVendorsIndex.errors)}`);
  process.exit(1);
}
console.log(`vendor index: valid`);

const vendorProfiles = {};

const vendorIDToValidate = options['vendor-id'];

if (vendorIDToValidate && !vendors.vendors.some((v) => v.id === vendorIDToValidate)) {
  console.error(`Specified vendor ID '${vendorIDToValidate}' does not exist in the repository.`);
  process.exit(1);
}

vendors.vendors.forEach((v) => {
  if (vendorIDToValidate && v.id !== vendorIDToValidate) {
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

    const codecs = {};
    const deviceNames = {};

    vendor.endDevices.forEach(async (d) => {
      const key = `${v.id}: ${d}`;
      const endDevicePath = `${folder}/${d}.yaml`;
      const endDevice = yaml.load(fs.readFileSync(endDevicePath));

      if (!validateEndDevice(endDevice)) {
        console.error(`${key}: invalid: ${formatValidationErrors(validateEndDevice.errors)}`);
        process.exit(1);
      }

      console.log(`${key}: valid`);

      // Create a regex to check if the vendor's name is a standalone word in the device name
      const regex = new RegExp(`\\b${v.id}\\b`, 'i'); // The 'i' flag makes it case-insensitive

      if (regex.test(endDevice.name)) {
        console.error(`Device name "${endDevice.name}" incorrectly contains the vendor's name.`);
        process.exit(1);
      }

      if (deviceNames[endDevice.name] && deviceNames[endDevice.name] !== endDevicePath) {
        console.error(
          `Duplicate name "${endDevice.name}" in files: "${deviceNames[endDevice.name]}" and "${endDevicePath}".`
        );
        process.exit(1);
      }

      deviceNames[endDevice.name] = endDevicePath;

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

        Object.keys(version.profiles).forEach(async (region) => {
          const regionProfile = version.profiles[region];
          const key = `${v.id}: ${d}: ${version.version}: ${region}`;
          const vendorID = regionProfile.vendorID ?? v.id;

          if (!vendorProfiles[vendorID]) {
            vendorProfiles[vendorID] = {};
          }

          if (!vendorProfiles[vendorID][regionProfile.id]) {
            const profile = yaml.load(fs.readFileSync(`./vendor/${vendorID}/${regionProfile.id}.yaml`));
            if ('vendorProfileID' in profile) {
              console.log(`\n${key}: vendorProfileID exists. This method has been replaced with VendorIDs, see:`);
              console.log(`https://github.com/TheThingsNetwork/lorawan-devices?tab=readme-ov-file#vendor-device-index`);
              process.exit(1);
            }
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
            await validatePayloadCodecs(folder, codec)
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
      } else {
        console.error(`${key}: image is missing.`);
        process.exit(1);
      }
    });
  });
});
