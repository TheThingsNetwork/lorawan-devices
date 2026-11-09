---
title: "LoRaWAN Size Sensors"
linkTitle: "Size"
description: "Browse LoRaWAN size sensors that measure object dimensions and report them wirelessly over long-range, low-power networks for monitoring and automation."
lede: "LoRaWAN size sensors gauge the dimensions or extent of objects and report readings wirelessly over long ranges on low power."
category: "sensor"
related: ["distance", "level", "weight", "proximity", "radar", "altitude"]
faq:
  - q: "What does a LoRaWAN size sensor measure?"
    a: "A size sensor reports a dimensional value, such as the length, height, or extent of an object or fill, often derived from distance or level measurements. It transmits the reading over LoRaWAN so you can monitor changes remotely without local wiring."
  - q: "How do LoRaWAN size sensors send their data?"
    a: "The device samples its measurement at a set interval, encodes it into a compact payload, and uplinks it over LoRaWAN to a network server. A payload codec on the platform decodes the bytes into a usable size value."
  - q: "What should I compare when choosing a size sensor?"
    a: "Look at measurement range and accuracy, reporting interval and battery life, enclosure rating for the deployment environment, supported regional frequency plans, and whether a ready-made payload codec is provided."
---
Size sensing covers devices that report a dimensional measurement, capturing how large an object is or how far a material extends within a space. Many derive this value from underlying distance or level readings, then express it as a usable size figure for monitoring and automation.

A LoRaWAN size sensor wakes on a schedule, takes a measurement, and encodes it into a small payload that travels over long-range, low-power radio to a network server. A payload codec on your platform decodes the bytes, so battery-powered units can run for years while reporting changes from hard-to-reach locations.

Typical deployments include logistics and warehousing, manufacturing lines, bin and container fill monitoring, and asset management where dimensions drive decisions.

When comparing devices, weigh:

- Measurement range and accuracy
- Reporting interval and battery life
- Enclosure (IP) rating for the environment
- Supported regional frequency plans and codec availability

Match these to your application before committing to a specific model.
