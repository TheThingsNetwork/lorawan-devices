---
title: "LoRaWAN NFC Sensors and Devices"
linkTitle: "NFC"
description: "Browse LoRaWAN devices with NFC, used for tap-to-configure setup, secure provisioning, and short-range data exchange in the field."
lede: "LoRaWAN devices with NFC let you tap a phone to configure, provision, and read out hardware without opening the enclosure or pairing a cable."
category: "sensor"
related: ["proximity", "button", "reed-switch", "hall-effect", "gps", "switch"]
faq:
  - q: "What is NFC used for on a LoRaWAN device?"
    a: "NFC is mainly a short-range configuration and provisioning interface. By tapping a phone or reader to the device you can write keys and frequency-plan settings, adjust reporting intervals, or read diagnostics without opening a sealed enclosure or connecting a cable."
  - q: "Can I configure a LoRaWAN device over NFC with my phone?"
    a: "Many NFC-equipped LoRaWAN devices ship with a mobile app or use standard NDEF tags so a compatible smartphone can read and write settings. Check the vendor's documentation for the specific app, NFC tag type, and which parameters are editable."
  - q: "Does NFC replace the LoRaWAN radio for sending data?"
    a: "No. NFC only works over a few centimetres and is used for local setup, commissioning, or short reads. The LoRaWAN radio still handles all long-range uplinks and downlinks to the network."
---
Near Field Communication (NFC) on a LoRaWAN device adds a short-range (typically a few centimetres) wireless interface alongside the long-range LoRa radio. Rather than measuring an environmental quantity, NFC is most often used for **tap-to-configure provisioning**: a technician holds a smartphone or reader against the device to set the frequency plan, write keys (DevEUI, AppKey), adjust reporting intervals, or read diagnostics.

This is valuable for sealed, battery-powered hardware in the field, where opening the housing or attaching a USB cable is impractical. Common scenarios include onboarding fleets of trackers and meters, in-warehouse commissioning, and asset tagging.

When comparing NFC-equipped LoRaWAN devices, check:

- NFC standard and tag type, and whether it supports read, write, or both
- Mobile app or NDEF tooling for configuration
- Supported frequency plans (EU868, US915, AS923) and class
- Battery life, enclosure/IP rating, and the payload codec

NFC simplifies bulk commissioning while LoRaWAN handles the long-range uplinks.
