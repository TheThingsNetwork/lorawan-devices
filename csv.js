const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const baseUrl = 'https://raw.githubusercontent.com/TheThingsNetwork/lorawan-devices/master/vendor';

// Function to extract data from device.yaml and create a CSV line
const extractData = (filePath, vendor) => {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = yaml.load(fileContents);
        if (data.name && data.description) {
            // Format sensors as a string
            const name = `"${data.name}"`;
            const description = `"${data.description}"`;
            const sensors = Array.isArray(data.sensors) ? `"${data.sensors.join(', ')}"` : '';
            const imageUrl = data.photos && data.photos.main ? `"${baseUrl}/${vendor}/${data.photos.main}"` : '';
            const additionalRadios = Array.isArray(data.additionalRadios) ? `"${data.additionalRadios.join(', ')}"` : '';
            const height = data.dimensions?.height || '';
            const width = data.dimensions?.width || '';
            const length = data.dimensions?.length || '';
            const weight = data.weight || '';
            const ipCode = data.ipCode || '';
            const productURL = data.productURL || '';
            const dataSheetURL = data.dataSheetURL || '';

            return `${name},${vendor},${description},${imageUrl},${sensors},${height},${width},${length},${weight},"${ipCode}","${productURL}","${dataSheetURL}"\n`;
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
let csvHeader = 'Name,Vendor,Description,Image,Sensor,Radios,Height,Width,Length,Weight,IP Rating,Product URL,Datasheet URL\n';
let csvData = walkSync(startPath);

// Save to CSV file
fs.writeFileSync('devices.csv', csvHeader + csvData);
