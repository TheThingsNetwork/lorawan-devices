---
title: "LoRaWAN Devices Reporting SNR (Signal-to-Noise Ratio)"
linkTitle: "SNR"
description: "Browse LoRaWAN devices that report SNR (signal-to-noise ratio), a link-quality metric for diagnosing coverage and gateway placement."
lede: "SNR (signal-to-noise ratio) is a LoRaWAN link-quality metric that shows how cleanly a device's transmission rises above background radio noise."
category: "sensor"
related: ["rssi", "link", "wifi-ssid", "gps"]
faq:
  - q: "What is SNR in LoRaWAN?"
    a: "SNR (signal-to-noise ratio) measures how far a received LoRa signal sits above background noise, expressed in dB. Because LoRa demodulates signals below the noise floor, negative SNR values are normal and still decodable. It is reported per uplink by the receiving gateway, alongside RSSI."
  - q: "What is the difference between SNR and RSSI?"
    a: "RSSI measures absolute received signal strength in dBm, while SNR measures signal clarity relative to noise in dB. RSSI tells you how strong the signal is; SNR tells you how clean it is. Both are used together to judge link quality and choose spreading factors."
  - q: "Is SNR set by the device or the gateway?"
    a: "SNR is a radio metric calculated by the receiving gateway for each uplink, not a value the end device measures itself. It appears in network-server metadata, so any LoRaWAN device produces SNR readings once an uplink is received."
---
SNR (signal-to-noise ratio) describes how cleanly a LoRaWAN uplink rises above the radio noise floor, expressed in decibels. Because LoRa modulation can decode transmissions buried beneath the noise, healthy SNR values are often negative yet still valid. It is a core link-quality indicator operators watch when assessing coverage.

Unlike most sensor readings, SNR is computed by the receiving gateway for each uplink and surfaced in network-server metadata, rather than sampled by the end device. Every LoRaWAN device therefore generates SNR data once its packets are received, making it useful for diagnostics regardless of the device's primary function.

Common uses include:

- Verifying coverage and validating gateway placement
- Diagnosing marginal links and adaptive data-rate behaviour
- Comparing antenna or enclosure options during deployment

When evaluating devices here, consider supported frequency plans, antenna design and transmit power, mounting and enclosure rating, and how the network server exposes SNR alongside RSSI in its payload metadata.
