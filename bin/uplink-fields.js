#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');
const yaml = require('js-yaml');

const options = yargs.usage('Usage: --vendor <file>').option('v', {
  alias: 'vendor',
  describe: 'Path to vendor index file',
  type: 'string',
  demandOption: true,
  default: './vendor/index.yaml',
}).argv;

const vendors = yaml.load(fs.readFileSync(options.vendor));

function flatten(obj, prefix) {
  if (!obj) {
    return [];
  }
  const keys = [];
  Object.keys(obj).forEach((key) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object') {
      if (Array.isArray(obj[key])) {
        obj[key].forEach((item) => {
          keys.push(...flatten(item, `${newPrefix}[]`));
        });
      } else {
        keys.push(...flatten(obj[key], newPrefix));
      }
    } else {
      keys.push(newPrefix);
    }
  });
  return keys;
}

const fields = vendors.vendors.map((v) => {
  const folder = `./vendor/${v.id}`;
  const vendorIndexPath = `${folder}/index.yaml`;

  try {
    fs.statSync(vendorIndexPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const vendor = yaml.load(fs.readFileSync(vendorIndexPath));
  const codecs = {};

  return vendor.endDevices.map((d) => {
    const endDevice = yaml.load(fs.readFileSync(`${folder}/${d}.yaml`));
    return endDevice.firmwareVersions.map((version) => {
      return Object.keys(version.profiles).map((region) => {
        const regionProfile = version.profiles[region];
        if (regionProfile.codec && !codecs[regionProfile.codec]) {
          const codec = yaml.load(fs.readFileSync(`${folder}/${regionProfile.codec}.yaml`));
          codecs[regionProfile.codec] = true;
          if (codec.uplinkDecoder && codec.uplinkDecoder.examples) {
            return codec.uplinkDecoder.examples.flatMap((e) => {
              return e.output.data ? flatten(e.output.data) : [];
            });
          }
        }
        return [];
      });
    });
  });
});

fields.flat(100).forEach((f) => console.log(f.toLowerCase()));
