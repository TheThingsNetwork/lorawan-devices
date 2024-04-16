const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const baseUrl = 'https://raw.githubusercontent.com/TheThingsNetwork/lorawan-devices/master/vendor';

// Start directory
const startPath = path.join(__dirname, '..', 'vendor');

// Function to load vendor names from the vendor/index.yaml file
const loadVendorNames = (vendorIndexPath) => {
  try {
    const indexContents = fs.readFileSync(vendorIndexPath, 'utf8');
    const indexData = yaml.load(indexContents);
    const vendorMap = new Map();
    indexData.vendors.forEach((vendor) => {
      vendorMap.set(vendor.id, vendor.name);
    });
    return vendorMap;
  } catch (e) {
    console.error(`Failed to load vendor names from ${vendorIndexPath}: ${e}`);
    return new Map(); // Return an empty map if there's an error
  }
};

// Load the vendor names into a map
const vendorNamesMap = loadVendorNames(path.join(startPath, 'index.yaml'));

// Function to extract data from device.yaml and create a CSV line
const extractData = (filePath, vendor) => {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContents);
    if (data && data.name && data.description) {
      //only read files with these in its content
      const id = data.name.replace(/\s/g, '').toLowerCase() + '_' + vendor;
      const name = data.name;
      const vendorname = vendorNamesMap.get(vendor) || vendor; // Fallback to the vendor ID if no name is found
      const description = data.description.replace(/"/g, "'");
      const devicetype = data.devicetype || '';
      const sensors = Array.isArray(data.sensors) ? `"${data.sensors.join(', ')}"` : '';
      const imageUrl = data.photos?.main ? `"${baseUrl}/${vendor}/${data.photos.main}"` : '';
      const additionalRadios = Array.isArray(data.additionalRadios) ? `"${data.additionalRadios.join(', ')}"` : '';
      const height = data.dimensions?.height || '';
      const width = data.dimensions?.width || '';
      const length = data.dimensions?.length || '';
      const weight = data.weight || '';
      const ipCode = data.ipCode || '';
      const battery_replace = data.battery?.replaceable || '';
      const battery_type = data.battery?.type || '';
      const productURL = data.productURL || '';
      const dataSheetURL = data.dataSheetURL || '';
      let highestMacVersion = '';
      let regionalParametersVersion = '';
      let supportsClassB = '';
      let supportsClassC = '';

      data.firmwareVersions.forEach((firmwareVersion) => {
        Object.values(firmwareVersion.profiles).forEach((profile) => {
          const relatedFilePath = path.join(path.dirname(filePath), `${profile.id}.yaml`);
          try {
            const profileContents = fs.readFileSync(relatedFilePath, 'utf8');
            const profileData = yaml.load(profileContents);
            const macVersion = profileData.macVersion || '';

            // Compare and update the highest macVersion found
            if (macVersion.localeCompare(highestMacVersion, undefined, { numeric: true, sensitivity: 'base' }) > 0) {
              // Update the fields
              highestMacVersion = macVersion;
              regionalParametersVersion = profileData.regionalParametersVersion;
              supportsClassB = profileData.supportsClassB;
              supportsClassC = profileData.supportsClassC;
            }
          } catch (e) {
            console.error(`Failed to extract data from ${relatedFilePath}: ${e}`);
          }
        });
      });

      return `"${id}","${name}","${vendorname}","${description}",${imageUrl},${sensors},${devicetype},${additionalRadios},${height},${width},${length},${weight},"${ipCode}","${battery_replace}","${battery_type}","${productURL}","${dataSheetURL}","${highestMacVersion}",${regionalParametersVersion},${supportsClassB},${supportsClassC}\n`;
    }
  } catch (e) {
    console.error(`Failed to process ${filePath}: ${e}`);
  }
  return '';
};

const walkSync = (dir, vendor = '', csvContent = '') => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const newVendor = path.basename(filePath);
      // Recurse into vendor directories
      csvContent += walkSync(filePath, newVendor);
    } else if (filePath.endsWith('.yaml')) {
      // Process any YAML file
      csvContent += extractData(filePath, vendor);
    }
  });
  return csvContent;
};

// Initialize CSV data
let csvHeader =
  'ID,Name,Vendor,Description,Image,Sensor,Device Type,Radios,Height,Width,Length,Weight,IP Rating,Battery Replaceable?,Battery Type,Product URL,Datasheet URL,MAC Version,Regional Parameter Version,Supports Class B?, Supports Class C?\n';
let csvData = walkSync(startPath);

// Save to CSV file
fs.writeFileSync(__dirname + '/devices.csv', csvHeader + csvData);
