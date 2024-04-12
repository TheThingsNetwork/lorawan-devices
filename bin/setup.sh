#!/bin/bash

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

add_devices () {

while true; do
    echo -e "\n${BLUE}How many devices do you want to add? (number between 0 and 10)${NC}"
    read device_count
    if [[ $device_count =~ ^[0-9]+$ ]] && [[ "$device_count" -ge 0 && 
    "$device_count" -le 10 ]]; then
        break
    else
        echo -e "${RED}Invalid input. Please enter a number between 0 and 10.\n${NC}"
    fi
done

# Check if index exists
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
  while true; do
    echo -e "\n${BLUE}What is the name of device $i? 
(lowercase, alphanumeric with dashes, max 36 characters) (${RED}required${BLUE}):${NC}"
    read devicename
    if [[ $devicename =~ ^[a-z0-9\-]{3,36}$ ]]; then
        if grep -q -E "\b$devicename\b" index.yaml; then
            echo -e "${RED}This device name already exists. Please enter a unique name.\n${NC}"
        else
            break
        fi
    else
        echo -e "${RED}Invalid input. Please enter a lowercase alphanumeric string 
with dashes and between 3 and 36 characters.\n${NC}"
    fi
  done

  awk "/endDevices:/{print;print \"  - $devicename\";next}1" index.yaml > temp_index.yaml && mv temp_index.yaml index.yaml

  while true; do
    echo -e "${BLUE}What is the description of device $i? (${RED}required${BLUE}):${NC}"
    read devicedescription
    if [[ $devicedescription =~ .+ ]]; then
      break
    else
        echo -e "${RED}Invalid input. Please enter at least one character.\n${NC}"
    fi
  done

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
    profiles:" > $devicename.yaml

while true; do
  echo -e "${BLUE}How many profiles do you want to add for device $i?${NC}"
  read profile_count
  if [[ ! $profile_count =~ ^[0-9]+$ ]]; then
    echo -e "${RED}Invalid input. Please enter a number.\n${NC}"
  else
    break
  fi
done

profile_names=("EU863-870" "US902-928" "AU915-928" "AS923" "CN779-787" "EU433" "CN470-510" "KR920-923" "IN865-867" "RU864-870")
profile_base_freqs=("eu868" "us915" "au915" "as923" "cn779" "eu433" "cn470" "kr920" "in865" "ru864")
selected_indexes=() # Track selected profile indexes to avoid duplicates

for ((j=1; j<=profile_count; j++)); do
    echo -e "${BLUE}\nAvailable profiles:${NC}"
    for k in "${!profile_names[@]}"; do
        if [[ ! " ${selected_indexes[@]} " =~ " ${k} " ]]; then
            echo "$((k+1))) ${profile_names[$k]}"
        fi
    done

    echo -e "${BLUE}Which profile do you want to add for profile $j? (Enter the number)${NC}"
    read profile_selection
    profile_index=$((profile_selection-1))

    if [[ " ${selected_indexes[@]} " =~ " ${profile_index} " ]]; then
        echo -e "${RED}This profile has already been selected. Please choose a different profile.${NC}"
        ((j--)) # Decrement to ask for profile again
    elif [[ $profile_index -ge 0 && $profile_index -lt ${#profile_names[@]} ]]; then
        selected_indexes+=("$profile_index") # Add index to selected
    else
        echo -e "${RED}Invalid selection. Please select a valid profile number.\n${NC}"
        ((j--)) # Decrement to ask for profile again
    fi
done

# When all profiles are selected, iterate over all of them to add profile.
for index in "${selected_indexes[@]}"; do
  profile="${profile_names[$index]}"
  base_freq="${profile_base_freqs[$index]}"
  echo "       $profile:
        id: $devicename-profile-$base_freq
        lorawanCertified:
        codec: $devicename-codec" >> $devicename.yaml
  echo "# LoRaWAN MAC version: 1.0, 1.0.1, 1.0.2, 1.0.3, 1.0.4 or 1.1
macVersion: ''
# LoRaWAN Regional Parameters version. Values depend on the LoRaWAN version:
#   1.0:   TS001-1.0
#   1.0.1: TS001-1.0.1
#   1.0.2: RP001-1.0.2 or RP001-1.0.2-RevB
#   1.0.3: RP001-1.0.3-RevA
#   1.0.4: RP002-1.0.0, RP002-1.0.1, RP002-1.0.2, RP002-1.0.3 or RP002-1.0.4
#   1.1:   RP001-1.1-RevA or RP001-1.1-RevB
regionalParametersVersion: ''

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
maxEIRP:
# Whether the end device supports 32-bit frame counters
supports32bitFCnt: 

# Whether the end device supports class B
supportsClassB: 
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
supportsClassC: 
# If your device supports class C, uncomment the following fields:
# Maximum delay for the end device to answer a MAC request or confirmed downlink frame (seconds)
#classCTimeout: 60" > $devicename-profile-$base_freq.yaml
done

echo "# Sensors that this device features (optional)
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
      version: ">> $devicename.yaml

echo "# Uplink decoder decodes binary data uplink into a JSON object (optional)
# For documentation on writing encoders and decoders, see: https://thethingsstack.io/integrations/payload-formatters/javascript/
uplinkDecoder:
  fileName: $devicename.js" > $devicename-codec.yaml

echo " // Please read here on how to implement the proper codec: https://www.thethingsindustries.com/docs/integrations/payload-formatters/javascript/" > $devicename.js
done

echo -e "\n${GREEN}All the necessary files have now been created containing templates, 
so you can start adding missing information and extras. 
Please do go through the files and check if everything is correct. 
This tool is only for helping you add the boilerplate files quicker.
Some details are still blank, like the codec still requires code to be added or
extras like images for example. 
The more you add, the more is known about your device.
For more information look on the github page: 
https://github.com/TheThingsNetwork/lorawan-devices#files-and-directories \n${NC}"

exit 0
}

add_company () {
while true; do
    echo -e "\n${BLUE}What is the unique id of your company? (a.k.a. the name of the vendor folder)
(${YELLOW}lowercase, alphanumeric with dashes, max 36 characters${BLUE}) (${RED}required${BLUE}):${NC}"
    read companyid

    if [[ $companyid =~ ^[a-z0-9\-]{1,36}$ ]]; then
        # Check if the company ID already exists in index.yaml
        if grep -q "id: $companyid" index.yaml; then
            echo -e "${RED}This company ID is already in use. Please enter a different one.\n${NC}"
        else
            break
        fi
    else
        echo -e "${RED}Invalid input. Please enter a lowercase alphanumeric string 
with dashes and a maximum of 36 characters.\n${NC}"
    fi
done
          
while true; do
    echo -e "${BLUE}What is the name of your company? (${RED}required${BLUE}):${NC}"
    read companyname
    if [[ -z "$companyname" ]]; then
        echo -e "${RED}Invalid input. Please enter at least 1 character.\n${NC}"
    else
        break
    fi
done

echo -e "\n  - id: $companyid
    name: $companyname">> index.yaml

while true; do
    echo -e "${BLUE}What is the LoRa Alliance issued Vendor ID? (${YELLOW}optional${BLUE}):${NC}"
    read vendorid
    if [ -z "$vendorid" ]; then
        break
    fi
    if [[ $vendorid =~ ^[0-9]+$ ]] && [[ $vendorid -ge 0 && 
    $vendorid -le 1000 ]]; then
        if grep -q -w "vendorID: $vendorid" ./index.yaml; then
            echo -e "${RED}This Vendor ID is already in use.\n${NC}"
        else
            echo -e "    vendorID: $vendorid">> index.yaml
            break
        fi
    else
        echo -e "${RED}Invalid input. Please enter a number between 0 and 1000.\n${NC}"
    fi
done

while true; do
    echo -e "${BLUE}What is the address of the company's website? (${YELLOW}optional${BLUE}):${NC}"
    read website
    if [[ -z "$website" ]]; then
        break
    else
        printf "    website: $website">> index.yaml
        break
    fi
done

mkdir "$companyid"

cd "$companyid"

sleep 1

add_devices
}

echo -e "${BLUE}Hello! The Device Repository is where we store the characteristics 
and capabilities of LoRaWAN devices. To add a new vendor or devices, some files 
need to be created with specific information.
To help you along, we've created this setup tool that will create a few of the
necessary template files and apply the basic information needed. 
Please fill in the upcoming questions.\n${NC}"

cd vendor

echo -e "${BLUE}What would you like to do?${NC}"

PS3="Type a number: "

options=("Add new devices to an existing entry" "Add a new company")

select opt in "${options[@]}"; do
    case $opt in
        "Add new devices to an existing entry")
            while true; do
              echo -e "\n${BLUE}What is the unique id of your company? (a.k.a. the name of the vendor folder)
(${YELLOW}lowercase, alphanumeric with dashes, max 36 characters${BLUE}) (${RED}required${BLUE}):${NC}"
              read companyid
              if [[ $companyid =~ ^[a-z0-9\-]{1,36}$ ]]; then
                  if [ -d "$companyid" ]; then
                      cd "$companyid"
                      add_devices
                      break
                  else 
                      echo -e "${RED}id not found. Make sure that you entered it 
correctly or go back and add a new company.${NC}\n"
                  fi
              else
                  echo -e "${RED}Invalid input. Please enter a lowercase 
alphanumeric string with dashes and a maximum of 36 characters.\n${NC}"
              fi
            done
            ;;
        "Add a new company")
            add_company
            break
            ;;
        *) echo "Invalid option";;
    esac
done