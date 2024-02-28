#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');
const yaml = require('js-yaml');

const options = yargs.usage('Usage: --vendor <file> [--vendor-id <id>]').option('v', {
  alias: 'vendor',
  describe: 'Path to vendor index file',
  type: 'string',
  demandOption: true,
  default: './vendor/index.yaml',
}).argv;

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

const vendorProfiles = {};

const vendors = yaml.load(fs.readFileSync(options.vendor));

vendors.vendors.forEach((v) => {
  const key = v.id;
  const folder = `./vendor/${v.id}`;
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

    const codecs = {};

    vendor.endDevices.forEach(async (d) => {
      const deviceFilePath = `${folder}/${d}.yaml`;
      const endDevice = yaml.load(fs.readFileSync(deviceFilePath));

      // Assuming firmwareVersion and hardwareVersion are correctly extracted
      // Iterate through firmware versions to access profiles
      endDevice.firmwareVersions.forEach((version) => {
        Object.keys(version.profiles).forEach(async (region) => {
          const profilePath = `./vendor/${v.id}/${version.profiles[region].id}.yaml`;
          const profile = yaml.load(fs.readFileSync(profilePath));

          // Use '0' as a fallback but decide not to proceed if it is '0'
          let profileID = profile.vendorProfileID || '0';

          // Only proceed if profileID is not '0'
          if (profileID !== '0') {
            // Initialize hardwareVersionString with an empty string as default
            let hardwareVersionString = ''; // Default to empty string if hardwareVersion is missing

            // Check if hardwareVersions exists, is an array, and has at least one element
            if (
              Array.isArray(endDevice.hardwareVersions) &&
              endDevice.hardwareVersions.length > 0 &&
              endDevice.hardwareVersions[0].version
            ) {
              hardwareVersionString = endDevice.hardwareVersions[0].version;
            }

            // Ensure the profileIDs object exists
            if (!vendor.profileIDs) {
              vendor.profileIDs = {};
            }

            // Assign the profile information, including hardwareVersion even if it's an empty string
            vendor.profileIDs[profileID] = {
              endDeviceID: d,
              firmwareVersion: version.version,
              hardwareVersion: hardwareVersionString, // This will be an empty string if hardwareVersion is missing
              region: region,
            };
          } else {
            // Explicitly do nothing when profileID is '0', to avoid adding it to profileIDs
          }

          // Note: The newYamlStr assignment and fs.writeFileSync call will be outside this forEach loop
        });
      });

      // Serialize and write back to the vendor index file, done outside the forEach loop to avoid repetitive writes
      const newYamlStr = yaml.dump(vendor);
      fs.writeFileSync(vendorIndexPath, newYamlStr, 'utf8');
    });
  });
});
