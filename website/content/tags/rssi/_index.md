---
title: "LoRaWAN RSSI Sensors and Devices"
linkTitle: "RSSI"
description: "Browse LoRaWAN devices that report RSSI to measure received signal strength, gauge link quality, and diagnose coverage."
lede: "LoRaWAN devices that report RSSI let you measure received signal strength and assess coverage and link quality across your network."
category: "sensor"
related: ["snr", "link", "gps", "wifi-ssid", "battery", "distance"]
faq:
  - q: "What is RSSI in LoRaWAN?"
    a: "RSSI (Received Signal Strength Indicator) is the power level, in dBm, of a received radio signal. In LoRaWAN the gateway measures RSSI for every uplink, and some end devices report the RSSI of the downlinks or beacons they receive, helping you judge link quality and proximity to coverage limits."
  - q: "How is RSSI different from SNR?"
    a: "RSSI measures absolute received power in dBm, while SNR (Signal-to-Noise Ratio) compares signal strength to background noise in dB. LoRa can decode signals below the noise floor, so SNR often matters as much as RSSI for assessing usable link margin."
  - q: "What should I compare when choosing an RSSI-reporting device?"
    a: "Check the supported frequency plans, antenna and receiver sensitivity, how RSSI is exposed in the payload codec, battery life, enclosure rating for the deployment site, and whether the device also reports SNR for a fuller link-quality picture."
---
RSSI (Received Signal Strength Indicator) expresses the power of a received radio signal, typically in dBm, where values closer to zero indicate a stronger signal. In LoRaWAN networks, gateways record RSSI for every uplink as part of the radio metadata, and some end devices report the RSSI of the downlinks or beacons they receive, letting you monitor the radio environment from the node side.

A device that reports RSSI encodes the value in its uplink payload like any other measurement, decoded by your network or application server's codec. RSSI is commonly used for coverage surveys, gateway placement, link-budget validation, asset-tracking confidence checks, and ongoing network diagnostics across smart-city, industrial, and utility deployments.

When comparing RSSI-capable devices, weigh these factors:

- Supported frequency plans and regional bands
- Antenna design and receiver sensitivity
- How RSSI (and ideally SNR) appears in the payload codec
- Battery life, power draw, and enclosure/IP rating

Pair RSSI with SNR for a more complete view of link margin and reliability.
