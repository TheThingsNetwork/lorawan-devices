# Contributing

You can contribute to this repository by adding vendors, end devices, end device profiles and payload codecs.

## Prerequisites

- Node.js version 14.x
- npm version 6.x

To check your Node.js and npm versions:

```bash
$ node -v
$ npm -v
```

[Download and install Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Then, install the dependencies:

```bash
$ make deps
```

## Validation

The device repository contains tooling to validate all data against a schema. This is necessary for all data to be loaded automatically in The Things Stack and other services.

You can use command-line to validate the data:

```bash
$ make validate
```

[Visual Studio Code](https://code.visualstudio.com/) is a great editor for editing the device repository. You can validate your data automatically using the [YAML plugin](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml).

The YAML plugin supports you with filling out the document. When hitting Ctrl + Space, all fields are shown. The Debug Console of Visual Studio provides feedback by highlighting the incorrect fields.

![Validation in Visual Studio Code](./doc/vs-code-validation.png)

## Directory Structure

```
lorawan-devices
├── vendor
│   ├── index.yaml
│   ├── vendor-1
│   │   ├── device-a.jpg
│   │   ├── device-a.yaml
│   │   ├── device-b.jpg
│   │   ├── device-b.yaml
│   │   ├── index.yaml
│   │   ├── logo.svg
│   │   ├── profile1-decoder.js
│   │   ├── profile1-encoder.js
│   │   ├── profile1.yaml
│   │   └── profile2.yaml
│   ├── vendor-2
```

## File Format

There are four file types: the vendor index, the vendor's device index, and the device and profile definitions.

### Device Vendor Index

First, make sure that your company is listed in the LoRaWAN vendor index in `vendor/index.yaml` and that the information is complete.

If your company is not listed or if you want to add additional information, follow this structure:

```yaml
vendors:
  - # Unique identifier of the vendor (lowercase, alphanumeric with dashes, max 36 characters)
    id: company-x
    # Vendor company name
    name: Company X
    # Vendor website (optional)
    website: https://www.company-x.com
    # Vendor logo filename (optional)
    logo: logo.svg
    # Organization Unique Identifiers (OUIs, optional): http://standards-oui.ieee.org/oui.txt
    # The OUI is typically the first 3 bytes of the DevEUI
    ouis: [FCD6BD]
    # Private Enterprise Number (optional): https://www.iana.org/assignments/enterprise-numbers/enterprise-numbers
    pen: 42
```

The vendor data will be in the `vendor/<vendor-id>` folder (e.g. `vendor/company-x`). Create the folder if it does not exist yet.

### Vendor Device Index

All vendor data is referenced from the vendor device index YAML file: `vendor/<vendor-id>/index.yaml`:

```yaml
endDevices:
  - device-a
  - device-b
```

### End Device

For each end device, create an end device YAML file with the same identifier as in the index: `vendor/<vendor-id>/<device-id>.yaml`:

```yaml
id: device-a
name: Device A
partNumber: PR-X-01
description: My first LoRaWAN device

# Hardware versions (optional, use when you have revisions)
hardwareVersions:
  - version: '1.0'
    numeric: 1
  - version: '1.0-rev-A'
    numeric: 2

# Firmware versions (at least one is mandatory)
firmwareVersions:
  - # Firmware version
    version: '1.0'
    numeric: 1
    # Corresponding hardware versions (optional)
    hardwareVersions:
      - '1.0'

    # LoRaWAN Device Profiles per region
    # Supported regions are EU863-870, US902-928, AU915-928, AS923, CN779-787, EU433, CN470-510, KR920-923, IN865-867, RU864-870
    profiles:
      EU863-870:
        id: profile-1
        lorawanCertified: true
      US902-928:
        id: profile-1
        lorawanCertified: true

  - # You can add more firmware versions and use different profiles per version
    version: '2.0'
    numeric: 2
    hardwareVersions:
      - '1.0-rev-A'
    profiles:
      EU863-870:
        id: profile-2
        lorawanCertified: true
      US902-928:
        id: profile-2
        lorawanCertified: true
      AS923:
        id: profile-2

# Sensors that this device features (optional)
# Valid values are: temperature, humidity, pir, light, accelerometer, gyroscope, magnetometer, gps, button, auxiliary,
# battery, rssi, snr, link, sound, co2, tvoc, proximity, water, ph, barometer, moisture, distance, dust and vibration.
sensors:
  - temperature
  - humidity
  - barometer

# Dimensions in mm (optional)
# Use width, height, length and/or diameter
dimensions:
  diameter: 50
  height: 30

# Weight in grams (optional)
weight: 150

# Battery information (optional)
battery:
  replaceable: false
  type: Lithium

# Operating conditions (optional)
operatingConditions:
  # Temperature (Celcius)
  temperature:
    min: -30
    max: 65
  # Relative humidity (fraction of 1)
  relativeHumidity:
    min: 0
    max: 0.97

# IP rating (optional)
ipCode: IP64

# Key provisioning (optional)
# Valid values are: custom (user can configure keys), join server and manifest.
keyProvisioning:
  - custom
  - join server
# Key security (optional)
# Valid values are: none, read protected and secure element.
keySecurity: none

# Product and data sheet URLs (optional)
productURL: https://www.bosch-connectivity.com/products/connected-mobility/parking-lot-sensor/
dataSheetURL: https://www.bosch-connectivity.com/media/product_detail_pls/parking-lot-sensor-datasheet.pdf

# Photos (optional)
photos:
  main: main.jpg
  other:
    - other1.jpg
    - other2.jpg

# Regulatory compliances (optional)
compliances:
  safety:
    - body: IEC
      norm: EN
      standard: 62368-1
  radioEquipment:
    - body: ETSI
      norm: EN
      standard: 301 489-1
      version: 2.2.0
    - body: ETSI
      norm: EN
      standard: 301 489-3
      version: 2.1.0
```

Each reference profile in the firmware version needs to be defined in a YAML file: `vendor/<vendor-id>/<profile-id>.yaml`:

```yaml
id: profile-1
# Vendor profile ID issued by the vendor
# This vendor profile ID is also used on the QR code for LoRaWAN devices, see
# https://lora-alliance.org/sites/default/files/2020-10/TR005_LoRaWAN_Device_Identification_QR_Codes.pdf
vendorProfileID: 42
# Whether the end device supports class B
supportsClassB: false
# Whether the end device supports class C
supportsClassC: false
# LoRaWAN MAC version: 1.0, 1.0.1, 1.0.2, 1.0.3, 1.0.4 or 1.1
macVersion: 1.0.2
# LoRaWAN Regional Parameters version. Values depend on the LoRaWAN version:
#   1.0:   TS001-1.0
#   1.0.1: TS001-1.0.1
#   1.0.2: RP001-1.0.2 or RP001-1.0.2-RevB
#   1.0.3: RP001-1.0.3-RevA
#   1.0.4: RP002-1.0.0 or RP002-1.0.1
#   1.1:   RP001-1.1-RevA or RP001-1.1-RevB
regionalParametersVersion: RP001-1.0.2-RevB
# Whether the end device supports join (OTAA) or not (ABP)
supportsJoin: true
# Maximum EIRP
maxEIRP: 16
# Whether the end device supports 32-bit frame counters
supports32bitFCnt: true
```

For more information and for fields for ABP, see [LoRaWAN Schema: Devices Draft 1](https://lorawan-schema.org/draft/devices/1/).

## Submitting Devices

If you want to submit your devices to this Device Repository, fork this repository and open a pull request. [Learn how to fork and create pull requests](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

When you open a pull request, it will be validated automatically. If there are any validation or formatting errors, the pull request will not be merged until those errors are resolved. Therefore, before creating a pull request, run the following action to validate and format your data:

```bash
$ make validate fmt
```
