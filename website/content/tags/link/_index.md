---
title: "LoRaWAN Link Quality Devices"
linkTitle: "Link Quality"
description: "Browse LoRaWAN devices that report link quality, RSSI, SNR, data rate and link margin, for coverage testing and network diagnostics."
lede: "LoRaWAN devices that surface radio link quality so you can verify coverage, gauge signal margin, and troubleshoot connectivity in the field."
category: "sensor"
related: ["rssi", "snr", "gps", "battery", "altitude", "wifi-ssid"]
faq:
  - q: "What does \"link\" mean for a LoRaWAN device?"
    a: "It refers to radio link quality, the metrics describing the connection between an end device and the network, such as received signal strength (RSSI), signal-to-noise ratio (SNR), data rate, and link margin. These are diagnostics, not an environmental measurement."
  - q: "How does a LoRaWAN device report link quality?"
    a: "Devices can request a Link Check via LoRaWAN MAC commands, where the network responds with the demodulation margin and number of receiving gateways. Many devices also expose RSSI, SNR, and current data rate in their uplink payload or device-status reports."
  - q: "What are link quality readings used for?"
    a: "They help validate gateway coverage, perform site surveys before a deployment, tune antenna placement and spreading factor, and remotely diagnose why a device is dropping packets or draining its battery."
---
In LoRaWAN, "link" describes the quality of the radio connection between an end device and the network rather than an environmental quantity. Devices that report link data expose metrics such as received signal strength (RSSI), signal-to-noise ratio (SNR), the active data rate or spreading factor, and link margin returned by the network.

These figures are gathered using LoRaWAN MAC commands like Link Check and Device Status, or embedded directly in an uplink payload. Field-test trackers and coverage testers are the most common form factor, often pairing link data with location so you can map signal quality as you walk or drive a site.

Typical uses include pre-deployment site surveys, validating gateway placement, antenna and orientation tuning, and remote troubleshooting of intermittent connectivity.

When comparing devices, weigh these factors:

- Supported frequency plans (EU868, US915, AS923, and others)
- Battery life versus how frequently it reports
- Enclosure rating for outdoor or harsh sites
- Whether the payload codec decodes RSSI, SNR, and data rate cleanly
