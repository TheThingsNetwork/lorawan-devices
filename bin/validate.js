#!/usr/bin/env node

const Ajv = require('ajv');
const yargs = require('yargs');
const fs = require('fs');
const yaml = require('js-yaml');
const sizeOf = require('image-size');
const { exec } = require('child_process');
const isEqual = require('lodash.isequal');

let validate = new Ajv().addSchema([require('../lib/draft/schema.json'), require('../schema.json')]);

const options = yargs.usage('Usage: --vendor <file>').option('v', {
  alias: 'vendor',
  describe: 'Path to vendor index file',
  type: 'string',
  demandOption: true,
  default: './vendor/index.yaml',
}).argv;

let validateVendors = validate.compile({
  $ref: 'https://schema.thethings.network/devicerepository/1/schema#/definitions/vendors',
});
let validateVendor = validate.compile({
  $ref: 'https://schema.thethings.network/devicerepository/1/schema#/definitions/vendor',
});
let validateEndDevice = validate.compile({
  $ref: 'https://lorawan-schema.org/draft/devices/1/schema#/definitions/endDevice',
});
let validateEndDeviceProfile = validate.compile({
  $ref: 'https://lorawan-schema.org/draft/devices/1/schema#/definitions/endDeviceProfile',
});
let validateEndDevicePayloadCodec = validate.compile({
  $ref: 'https://lorawan-schema.org/draft/devices/1/schema#/definitions/endDevicePayloadCodec',
});

function requireFile(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err) => {
      if (err) {
        reject(`stat ${path}: ${err.code}`);
      } else {
        resolve();
      }
    });
  });
}

function requireDimensions(path) {
  return new Promise((resolve, reject) => {
    sizeOf(path, (err, dimensions) => {
      if (err) {
        reject(`load image ${path}: ${err}`);
      }
      if (dimensions.width > 2000 || dimensions.height > 2000) {
        reject(`image ${path} too large: maximum is 2000x2000 but loaded ${dimensions.width}x${dimensions.height}`);
      }
      resolve();
    });
  });
}

function validatePayloadCodecs(vendorId, payloadEncoding) {
  var runs = [];
  [
    { def: payloadEncoding.uplinkDecoder, routine: 'decodeUplink' },
    { def: payloadEncoding.downlinkEncoder, routine: 'encodeDownlink' },
    { def: payloadEncoding.downlinkDecoder, routine: 'decodeDownlink' },
  ].forEach((d) => {
    if (d.def && d.def.examples) {
      d.def.examples.forEach((e) => {
        runs.push({
          fileName: `${vendorId}/${d.def.fileName}`,
          routine: d.routine,
          ...e,
        });
      });
    }
  });
  var promises = [];
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

function formatValidationErrors(errors) {
  return errors.map((e) => `${e.dataPath} ${e.message}`);
}

const vendors = yaml.safeLoad(fs.readFileSync(options.vendor));

if (!validateVendors(vendors)) {
  console.error(`${options.vendor} is invalid: ${formatValidationErrors(validateVendors.errors)}`);
  process.exit(1);
}
console.log(`vendor index: valid`);

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

    const vendor = yaml.safeLoad(fs.readFileSync(vendorIndexPath));
    if (!validateVendor(vendor)) {
      console.error(`${key}: invalid index: ${formatValidationErrors(validateVendor.errors)}`);
      return;
    }
    console.log(`${v.id}: valid index`);

    const profiles = {};
    const codecs = {};

    vendor.endDevices.forEach((d) => {
      const key = `${v.id}: ${d}`;

      const endDevice = yaml.safeLoad(fs.readFileSync(`${folder}/${d}.yaml`));
      if (!validateEndDevice(endDevice)) {
        console.error(`${key}: invalid: ${formatValidationErrors(validateEndDevice.errors)}`);
        process.exit(1);
      }
      console.log(`${key}: valid`);

      endDevice.firmwareVersions.forEach((version) => {
        Object.keys(version.profiles).forEach((region) => {
          const regionProfile = version.profiles[region];
          const key = `${v.id}: ${d}: ${region}`;
          if (!profiles[regionProfile.id]) {
            const profile = yaml.safeLoad(fs.readFileSync(`${folder}/${regionProfile.id}.yaml`));
            if (!validateEndDeviceProfile(profile)) {
              console.error(
                `${key}: profile ${regionProfile.id} invalid: ${formatValidationErrors(
                  validateEndDeviceProfile.errors
                )}`
              );
              process.exit(1);
            }
            profiles[regionProfile.id] = true;
          }
          console.log(`${key}: profile ${regionProfile.id} valid`);

          if (regionProfile.codec && !codecs[regionProfile.codec]) {
            const codec = yaml.safeLoad(fs.readFileSync(`${folder}/${regionProfile.codec}.yaml`));
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
        requireDimensions(`${folder}/${endDevice.photos.main}`)
          .then(() => console.log(`${key}: ${endDevice.photos.main} has the right dimensions`))
          .catch((err) => {
            console.error(`${key}: ${err}`);
            process.exit(1);
          });
        if (endDevice.photos.other) {
          endDevice.photos.other.forEach((p) => {
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
