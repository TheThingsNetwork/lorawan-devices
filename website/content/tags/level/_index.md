---
title: "LoRaWAN Level Sensors"
linkTitle: "Level"
description: "Browse LoRaWAN level sensors that monitor liquid, fuel, and bulk-solid fill levels and report depth or volume wirelessly over long range."
lede: "LoRaWAN level sensors track liquid, fuel, and bulk-solid fill levels remotely, reporting depth or percentage full over kilometers on years of battery."
category: "sensor"
related: ["distance", "water", "pressure", "radar", "weight", "temperature"]
faq:
  - q: "How do LoRaWAN level sensors measure level?"
    a: "Most use non-contact methods like ultrasonic or radar to time a signal's reflection off the surface, or hydrostatic pressure to infer depth. The reading is converted to distance, percentage full, or volume."
  - q: "What battery life can I expect from a LoRaWAN level sensor?"
    a: "Because devices sleep between readings and transmit small payloads, battery life commonly spans several years. Reporting interval, range to gateway, and frequency plan all affect longevity."
  - q: "Can LoRaWAN level sensors be used outdoors or in tanks?"
    a: "Yes. Many are rated IP67 or higher for submersion and harsh environments. Check the enclosure rating, operating temperature, and whether the probe suits your medium."
---
Level sensing measures how full a container or body of liquid is — typically the height of a liquid, slurry, or bulk solid inside a tank, well, or channel. Readings are reported as a distance to the surface, a depth, a percentage full, or a calculated volume.

LoRaWAN level devices sample on a fixed schedule, then sleep to conserve power and transmit a compact payload to a nearby gateway. Common sensing approaches include ultrasonic and radar time-of-flight, hydrostatic pressure, and submersible probes. They suit water tanks, fuel and chemical storage, wells and boreholes, silos, sumps, and stormwater or flood monitoring.

When comparing devices, check:

- Measurement range, accuracy, and sensing technology versus your medium
- Enclosure and probe rating (IP/submersion) and operating temperature
- Battery life at your reporting interval and supported frequency plans
- The payload codec, so readings map cleanly into your application

Match the technology to the medium — foaming, vapor, or condensation can affect ultrasonic and radar readings differently.
