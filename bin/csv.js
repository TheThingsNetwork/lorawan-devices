const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { createObjectCsvStringifier } = require('csv-writer');

const baseUrl = 'https://raw.githubusercontent.com/TheThingsNetwork/lorawan-devices/master/vendor';

// Start directory
const startPath = path.join(__dirname, '..', 'vendor');

// CSV Writer setup
const csvWriter = createObjectCsvStringifier({
  header: [
    { id: 'id', title: 'ID' },
    { id: 'name', title: 'Name' },
    { id: 'vendorname', title: 'Vendor' },
    { id: 'description', title: 'Description' },
    { id: 'imageUrl', title: 'Image' },
    { id: 'sensors', title: 'Sensor' },
    { id: 'deviceType', title: 'Device Type' },
    { id: 'additionalRadios', title: 'Radios' },
    { id: 'height', title: 'Height' },
    { id: 'width', title: 'Width' },
    { id: 'length', title: 'Length' },
    { id: 'weight', title: 'Weight' },
    { id: 'ipCode', title: 'IP Rating' },
    { id: 'battery_replace', title: 'Battery Replaceable?' },
    { id: 'battery_type', title: 'Battery Type' },
    { id: 'productURL', title: 'Product URL' },
    { id: 'dataSheetURL', title: 'Datasheet URL' },
    { id: 'highestMacVersion', title: 'MAC Version' },
    { id: 'regionalParametersVersion', title: 'Regional Parameter Version' },
    { id: 'supportsClassB', title: 'Supports Class B?' },
    { id: 'supportsClassC', title: 'Supports Class C?' },
  ],
});

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
      const imageUrl = data.photos?.main ? `${baseUrl}/${vendor}/${data.photos.main}` : undefined;
      const sensors = data.sensors ? data.sensors.join(', ') : undefined;
      const deviceType = data.deviceType;
      const additionalRadios = data.additionalRadios ? data.additionalRadios.join(', ') : undefined;
      const height = data.dimensions?.height;
      const width = data.dimensions?.width;
      const length = data.dimensions?.length;
      const weight = data.weight;
      const ipCode = data.ipCode;
      const battery_replace = data.battery?.replaceable;
      const battery_type = data.battery?.type;
      const productURL = data.productURL;
      const dataSheetURL = data.dataSheetURL;
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

      return {
        id,
        name,
        vendorname,
        description,
        imageUrl,
        sensors,
        deviceType,
        additionalRadios,
        height,
        width,
        length,
        weight,
        ipCode,
        battery_replace,
        battery_type,
        productURL,
        dataSheetURL,
        highestMacVersion,
        regionalParametersVersion,
        supportsClassB,
        supportsClassC,
      };
    }
  } catch (e) {
    console.error(`Failed to process ${filePath}: ${e}`);
  }
  return null;
};

const walkSync = (dir, vendor = '', records = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const newVendor = path.basename(filePath);
      // Recurse into vendor directories
      walkSync(filePath, newVendor, records);
    } else if (filePath.endsWith('.yaml')) {
      // Process any YAML file
      const record = extractData(filePath, vendor);
      if (record) {
        records.push(record);
      }
    }
  });
  return records;
};

let records = walkSync(startPath);
const csvString = csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);

// Save to CSV file
fs.writeFileSync(__dirname + '/devices.csv', csvString);
