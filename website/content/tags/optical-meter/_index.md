---
title: "LoRaWAN Optical Meter Sensors"
linkTitle: "Optical Meter"
description: "Browse LoRaWAN optical meter devices that read utility meters via optical ports or LED pulse, then report consumption wirelessly."
lede: "LoRaWAN optical meter sensors read existing utility meters through their optical interface or blinking LED and report consumption over long-range wireless."
category: "sensor"
related: ["pulse-count", "pulse-frequency", "energy", "power", "current", "water"]
faq:
  - q: "How does a LoRaWAN optical meter sensor read a meter?"
    a: "It clips over the meter's optical interface or blinking consumption LED and counts pulses or reads the standardized optical protocol, then converts the value to a consumption reading transmitted over LoRaWAN. No rewiring of the meter is required."
  - q: "What kinds of meters work with optical reading?"
    a: "Many electricity, gas, water, and heat meters expose an optical port (such as IEC 62056-21) or a metrology LED. Compatibility depends on the meter model, pulse rate, and whether the optical head is correctly aligned and fixed."
  - q: "How long does the battery last?"
    a: "Battery life varies with reporting interval and how often the optical head must stay active to capture pulses. Less frequent uplinks and event-based counting extend life; check the vendor's rated cycle and replaceability."
---
Optical meter sensing reads an existing utility meter through its optical interface rather than by replacing the meter. A reading head is fixed over the meter's optical port or its metrology LED, counting flashes or decoding the standardized optical protocol. The device translates this into a consumption value and sends it over LoRaWAN, letting you retrofit legacy electricity, gas, water, and heat meters with remote reading.

Typical uplinks carry an accumulated index or interval consumption, often with timestamps and device status. Common deployments include building sub-metering, tenant billing, energy-efficiency monitoring, and municipal utility networks where running cables is impractical.

When comparing devices, check:

- Meter compatibility (optical protocol, LED type, pulse weight) and mounting method
- Battery life at your reporting interval, plus enclosure/IP rating for the site
- Supported frequency plans (EU868, US915, AS923) and the payload codec provided

Confirm the optical head physically fits and locks onto your specific meter before committing to a rollout.
