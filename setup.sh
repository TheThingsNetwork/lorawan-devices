#!/bin/sh

if [ -n "$NO_COLOR" ]; then
    # The variable is set, so disable color output
    RED=''
    GREEN=''
    BLUE=''
    YELLOW=''
    NC=''
else
    # The variable is not set, so enable color output
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    BLUE='\033[0;94m'
    YELLOW='\033[0;33m'
    NC='\033[0m'
fi

highestVendorProfileID=0

# Function to get the highest vendorProfileID in the directory
get_highest_vendor_profile_id() {
    for file in *-profile.yaml; do
        if [ -f "$file" ]; then
            current_id=$(grep 'vendorProfileID:' "$file" | awk '{print $2}')
            if [ "$current_id" -gt "$highestVendorProfileID" ]; then
                highestVendorProfileID=$current_id
            fi
        fi
    done
}

add_devices () {
get_highest_vendor_profile_id

while true; do
    echo "\n${BLUE}How many devices do you want to add?${NC}"
    read device_count
    if [[ $device_count =~ ^[0-9]+$ ]] && [[ "$device_count" -ge 0 && 
    "$device_count" -le 10 ]]; then
        break
    else
        echo "${RED}Invalid input. Please enter a number between 0 and 10.\n${NC}"
    fi
done

while true; do
    if [ -e "index.yaml" ]; then
        break
    else
        echo "endDevices:
  # Unique identifier of the end device (lowercase, alphanumeric with dashes, max 36 characters)" > index.yaml
    fi
done

# Loop to get device info and create files
for ((i=1;i<=device_count;i++));
do
  highestVendorProfileID=$((highestVendorProfileID + 1))
  while true; do
    echo "\n${BLUE}What is the name of device $i? 
(lowercase, alphanumeric with dashes, max 36 characters) (${RED}required${BLUE}):${NC}"
    read devicename
    if [[ $devicename =~ ^[a-z0-9\-]{1,36}$ ]]; then
        break
    else
        echo "${RED}Invalid input. Please enter a lowercase alphanumeric string 
with dashes and a maximum of 36 characters.\n${NC}"
    fi
  done

  while true; do
    echo "${BLUE}What is the description of device $i? (${RED}required${BLUE}):${NC}"
    read devicedescription
    if [[ $devicedescription =~ .+ ]]; then
      break
    else
        echo "${RED}Invalid input. Please enter at least one character.\n${NC}"
    fi
  done

  echo "  - $devicename" >> index.yaml

  echo "name: $devicename
description: $devicedescription

# Hardware versions (optional)
hardwareVersions:
  - version: '1.0'
    numeric: 1

# Firmware versions (at least one is mandatory)
firmwareVersions:
  - # Firmware version
    version: '1.0'
    numeric: 1
    # Supported hardware versions (optional)
    hardwareVersions:
      - '1.0' # Must refer to hardwareVersions declared above
    # LoRaWAN Device Profiles per region
    # Supported regions: EU863-870, US902-928, AU915-928, AS923, CN779-787, EU433, CN470-510, KR920-923, IN865-867, RU864-870
    profiles:
      EU863-870:
        # Unique identifier of the profile (lowercase, alphanumeric with dashes, max 36 characters).
        # This is the file name of the profile and must have the .yaml extension.
        id: $devicename-profile
        # Specify whether the device is LoRa Alliance certified.
        lorawanCertified: true
        # This is the file name of the codec definition and must have the .yaml extension.
        codec: $devicename-codec
      US902-928:
        # This is the file name of the profile and must have the .yaml extension.
        id: $devicename-profile
        # Specify whether the device is LoRa Alliance certified.
        lorawanCertified: true
        # This is the file name of the codec definition and must have the .yaml extension.
        codec: $devicename-codec

# Sensors that this device features (optional)
# Valid values are:
# 4-20 ma, accelerometer, altitude, analog input, auxiliary, barometer, battery, button, bvoc, co, co2, conductivity,
# current, digital input, dissolved oxygen, distance, dust, energy, gps, gyroscope, h2s, humidity, iaq, level, light,
# lightning, link, magnetometer, moisture, motion, no, no2, o3, particulate matter, ph, pir, pm2.5, pm10, potentiometer,
# power, precipitation, pressure, proximity, pulse count, pulse frequency, radar, rainfall, rssi, smart valve, snr, so2,
# solar radiation, sound, strain, surface temperature, temperature, tilt, time, tvoc, uv, vapor pressure, velocity,
# vibration, voltage, water potential, water, weight, wifi ssid, wind direction, wind speed.
sensors:
  - 

# Additional radios that this device has (optional)
# Valid values are: ble, nfc, wifi, cellular.
additionalRadios:
  - 

# Bridge interfaces (optional)
# Valid values are: modbus, m-bus, can bus, rs-485, sdi-12, analog.
bridgeInterfaces:
  - 

# Dimensions in mm (optional)
# Use width, height, length and/or diameter
dimensions:
  width: 
  length: 
  height: 

# Weight in grams (optional)
weight: 

# Battery information (optional)
battery:
  replaceable:
  type:

# Operating conditions (optional)
operatingConditions:
  # Temperature (Celsius)
  temperature:
    min: 
    max: 
  # Relative humidity (fraction of 1)
  relativeHumidity:
    min:
    max:

# IP rating (optional)
ipCode: 

# Key provisioning (optional)
# Valid values are: custom (user can configure keys), join server and manifest.
keyProvisioning:
  - 

# Key programming (optional)
# Valid values are: bluetooth, nfc, wifi, serial (when the user has a serial interface to set the keys)
# and firmware (when the user should change the firmware to set the keys).
keyProgramming:
  - 

# Key security (optional)
# Valid values are: none, read protected and secure element.
keySecurity:

# Firmware programming (optional)
# Valid values are: serial (when the user has a serial interface to update the firmware), fuota lorawan (when the device
# supports LoRaWAN FUOTA via standard interfaces) and fuota other (other wireless update mechanism).
firmwareProgramming:
  - 

# Product and data sheet URLs (optional)
productURL: 
dataSheetURL: 

# Photos (MAKE SURE THE IMAGE HAS A TRANSPARENT BACKGROUND)
photos:
  main: 

# Youtube or Vimeo Video (optional)
videos:
  main: 

# Regulatory compliances (optional)
compliances:
  safety:
    - body: 
      norm: 
      standard: 
  radioEquipment:
    - body: 
      norm: 
      standard: 
      version: 
    - body: 
      norm: 
      standard: 
      version: "> $devicename.yaml

echo "# Vendor profile ID, can be freely issued by the vendor. NOTE: The vendor profile ID is different from the vendorID. 
# The vendor Profile ID should be an incremental counter for every unique device listed in the vendor's folder.
# This vendor profile ID is also used on the QR code for LoRaWAN devices, see
# https://lora-alliance.org/wp-content/uploads/2020/11/TR005_LoRaWAN_Device_Identification_QR_Codes.pdf
vendorProfileID: $highestVendorProfileID

# LoRaWAN MAC version: 1.0, 1.0.1, 1.0.2, 1.0.3, 1.0.4 or 1.1
macVersion: ''
# LoRaWAN Regional Parameters version. Values depend on the LoRaWAN version:
#   1.0:   TS001-1.0
#   1.0.1: TS001-1.0.1
#   1.0.2: RP001-1.0.2 or RP001-1.0.2-RevB
#   1.0.3: RP001-1.0.3-RevA
#   1.0.4: RP002-1.0.0, RP002-1.0.1, RP002-1.0.2, RP002-1.0.3 or RP002-1.0.4
#   1.1:   RP001-1.1-RevA or RP001-1.1-RevB
regionalParametersVersion: 'RP001-1.0.3-RevA'

# Whether the end device supports join (OTAA) or not (ABP)
supportsJoin: true
# If your device is an ABP device (supportsJoin is false), uncomment the following fields:
# RX1 delay
#rx1Delay: 5
# RX1 data rate offset
#rx1DataRateOffset: 0
# RX2 data rate index
#rx2DataRateIndex: 0
# RX2 frequency (MHz)
#rx2Frequency: 869.525
# Factory preset frequencies (MHz)
#factoryPresetFrequencies: [868.1, 868.3, 868.5, 867.1, 867.3, 867.5, 867.7, 867.9]

# Maximum EIRP
maxEIRP: 16
# Whether the end device supports 32-bit frame counters
supports32bitFCnt: true

# Whether the end device supports class B
supportsClassB: false
# If your device supports class B, uncomment the following fields:
# Maximum delay for the end device to answer a MAC request or confirmed downlink frame (seconds)
#classBTimeout: 60
# Ping slot period (seconds)
#pingSlotPeriod: 128
# Ping slot data rate index
#pingSlotDataRateIndex: 0
# Ping slot frequency (MHz). Set to 0 if the band supports ping slot frequency hopping.
#pingSlotFrequency: 869.525

# Whether the end device supports class C
supportsClassC: false
# If your device supports class C, uncomment the following fields:
# Maximum delay for the end device to answer a MAC request or confirmed downlink frame (seconds)
#classCTimeout: 60" > $devicename-profile.yaml

echo "# Uplink decoder decodes binary data uplink into a JSON object (optional)
# For documentation on writing encoders and decoders, see: https://thethingsstack.io/integrations/payload-formatters/javascript/
uplinkDecoder:
  fileName: $devicename.js" > $devicename-codec.yaml

echo " // Please read here on how to implement the proper codec: https://www.thethingsindustries.com/docs/integrations/payload-formatters/javascript/" > $devicename.js
done

echo "\n${GREEN}All the necessary files have now been created containing templates, 
so you can start adding missing information and extras. 
Please do go through it and check if everything is correct. 
This tool is only for helping you add the boilerplate code quicker.
Some details are still blank, like the codec still requires code to be added or
extras like images for example. 
The more you add, the more is known about your device.
For more information look on the github page: 
https://github.com/TheThingsNetwork/lorawan-devices#files-and-directories \n${NC}"

exit 0
}

add_company () {
while true; do
  echo "\n${BLUE}What is the unique id of your company?
(lowercase, alphanumeric with dashes, max 36 characters) (${RED}required${BLUE}):${NC}"
  read companyid
  if [[ $companyid =~ ^[a-z0-9\-]{1,36}$ ]]; then
      break
  else
      echo "${RED}Invalid input. Please enter a lowercase alphanumeric string 
with dashes and a maximum of 36 characters.\n${NC}"
  fi
done
          
while true; do
    echo "${BLUE}What is the name of your company? (${RED}required${BLUE}):${NC}"
    read companyname
    if [[ -z "$companyname" ]]; then
        echo "${RED}Invalid input. Please enter at least 1 character.\n${NC}"
    else
        break
    fi
done

while true; do
    echo "${BLUE}What is the LoRa Alliance issued Vendor ID? (${YELLOW}optional${BLUE}):${NC}"
    read vendorid
    if [ -z "$vendorid" ]; then
        break
    fi
    if [[ $vendorid =~ ^[0-9]+$ ]] && [[ $vendorid -ge 0 && 
    $vendorid -le 1000 ]]; then
        if grep -q -w "vendorID: $vendorid" ./index.yaml; then
            echo "${RED}This Vendor ID is already in use.\n${NC}"
        else
            break
        fi
    else
        echo "${RED}Invalid input. Please enter a number between 0 and 1000.\n${NC}"
    fi
done

printf "\n \n  - id: $companyid
    name: $companyname
    vendorID: $vendorid">> index.yaml

while true; do
    echo "${BLUE}What is the address of the company's website? (${YELLOW}optional${BLUE}):${NC}"
    read website
    if [[ -z "$website" ]]; then
        break
    else
        printf "\n    website: $website">> index.yaml
        break
    fi
done

mkdir "$companyid"

cd "$companyid"

sleep 1

add_devices
}

echo "${BLUE}Hello! The Device Repository is where we store characteristics and capabilities 
LoRaWAN devices. To add a new vendor or devices, some files need to be created. 
To help you along, we've created this setup tool that will create a few
template files with the basic information needed. 
Please fill in the upcoming questions.\n${NC}"

cd vendor

echo "${BLUE}Do you want to add new devices to an existing entry or add a new company?${NC}"

options=("Add new devices" "Add a new company" "Quit")

select opt in "${options[@]}"; do
    case $opt in
        "Add new devices")
            while true; do
              echo "\n${BLUE}What is the unique id of your company? 
(lowercase, alphanumeric with dashes, max 36 characters) (${RED}required${BLUE}):${NC}"
              read companyid
              if [[ $companyid =~ ^[a-z0-9\-]{1,36}$ ]]; then
                  if [ -d "$companyid" ]; then
                      cd "$companyid"
                      add_devices
                      break
                  else 
                      echo "${RED}id not found. Make sure that you entered it correctly or go back and 
add a new company.${NC}\n"
                  fi
              else
                  echo "${RED}Invalid input. Please enter a lowercase alphanumeric string with dashes and a 
maximum of 36 characters.\n${NC}"
              fi
            done
            ;;
        "Add a new company")
            add_company
            break
            ;;
        "Quit")
            echo "${BLUE}Exiting.${NC}"
            exit 0
            ;;
        *) echo "Invalid option";;
    esac
done