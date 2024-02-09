const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const baseUrl = 'https://raw.githubusercontent.com/TheThingsNetwork/lorawan-devices/master/vendor';

// Function to extract data from device.yaml and create a CSV line
const extractData = (filePath, vendor) => {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = yaml.load(fileContents);
        if (data && data.name && data.description) {
            // Format sensors as a string
            const name = `"${data.name}"`;
            const description = data.description.replace(/"/g, "'");
            const sensors = Array.isArray(data.sensors) ? `"${data.sensors.join(', ')}"` : '';
            const imageUrl = data.photos && data.photos.main ? `"${baseUrl}/${vendor}/${data.photos.main}"` : '';
            const additionalRadios = Array.isArray(data.additionalRadios) ? `"${data.additionalRadios.join(', ')}"` : '';
            const height = data.dimensions?.height || '';
            const width = data.dimensions?.width || '';
            const length = data.dimensions?.length || '';
            const weight = data.weight || '';
            const ipCode = data.ipCode || '';
            const battery_replace = data.battery && data.battery.replaceable || '';
            const battery_type = data.battery && data.battery.type || '';
            const productURL = data.productURL || '';
            const dataSheetURL = data.dataSheetURL || '';
            let highestMacVersion = '0.0.0'; // Start with a default low version number
            let regionalParametersVersion = '';
            let supportsClassB = false;
            let supportsClassC = false;

            if (data.firmwareVersions) {
                data.firmwareVersions.forEach(firmwareVersion => {
                    if (firmwareVersion.profiles) {
                        Object.values(firmwareVersion.profiles).forEach(profile => {
                            if (profile.id) {
                                const relatedFilePath = path.join(path.dirname(filePath), `${profile.id}.yaml`);
                                try {
                                    const profileContents = fs.readFileSync(relatedFilePath, 'utf8');
                                    const profileData = yaml.load(profileContents);
                                    const macVersion = profileData.macVersion || '';
                                    // Update if this version is higher
                                    if (macVersion.localeCompare(highestMacVersion, undefined, { numeric: true, sensitivity: 'base' }) > 0) {
                                        highestMacVersion = macVersion;
                                        // Update additional fields from the same profile with the highest macVersion
                                        regionalParametersVersion = profileData.regionalParametersVersion || '';
                                        supportsClassB = profileData.supportsClassB || false;
                                        supportsClassC = profileData.supportsClassC || false;
                                    }
                                } catch (e) {
                                    console.error(`Failed to extract data from ${relatedFilePath}: ${e}`);
                                }
                            }
                        });
                    }
                });
            }

            // Prepare values for CSV
            supportsClassB = supportsClassB ? 'Yes' : 'No';
            supportsClassC = supportsClassC ? 'Yes' : 'No';
            highestMacVersion = highestMacVersion === '0.0.0' ? '' : highestMacVersion; // Check if highestMacVersion was updated; otherwise, leave it as an empty string

            return `${name},${vendor},"${description}",${imageUrl},${sensors},${additionalRadios},${height},${width},${length},${weight},"${ipCode}","${battery_replace}","${battery_type}","${productURL}","${dataSheetURL}","${highestMacVersion}",${regionalParametersVersion},${supportsClassB},${supportsClassC}\n`;
        }
    } catch (e) {
        console.error(`Failed to process ${filePath}: ${e}`);
    }
    return '';
};

const walkSync = (dir, vendor = '', csvContent = '') => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            const newVendor = path.basename(filePath);
            // Recurse into vendor directories
            csvContent += walkSync(filePath, newVendor);
        } else if (filePath.endsWith('.yaml')) { // Process any YAML file
            csvContent += extractData(filePath, vendor);
        }
    });
    return csvContent;
};

// Start directory (update this path to your actual directory structure)
const startPath = './vendor';

// Start the directory walk
let csvHeader = 'Name,Vendor,Description,Image,Sensor,Radios,Height,Width,Length,Weight,IP Rating,Battery Replaceable?,Battery Type,Product URL,Datasheet URL,MAC Version,Regional Parameter Version,Supports Class B?, Supports Class C?\n';
let csvData = walkSync(startPath);

// Save to CSV file
fs.writeFileSync('devices.csv', csvHeader + csvData);
