---
title: "LoRaWAN IN865-867 Frequency Plan"
linkTitle: "IN865-867"
description: "Browse LoRaWAN devices supporting the IN865-867 frequency plan, the sub-GHz regional parameters used in India."
lede: "IN865-867 is the LoRaWAN regional frequency plan for India, operating in the 865 to 867 MHz sub-GHz band."
category: "frequency"
related: ["as923", "as923-2", "au915-928", "eu863-870", "ru864-870", "kr920-923"]
faq:
  - q: "Where is the IN865-867 frequency plan used?"
    a: "IN865-867 is the LoRaWAN regional plan for India, which sits in ITU Region 3. It covers the unlicensed sub-GHz spectrum allocated for low-power devices in that country."
  - q: "What frequency range does IN865-867 cover?"
    a: "As the name indicates, the plan operates in the sub-GHz range of roughly 865 to 867 MHz. Devices use channels within this band for uplink and downlink communication."
  - q: "Why must my device support the right frequency plan?"
    a: "A LoRaWAN device can only join and communicate with a network that uses the same regional parameters. Hardware sold for India should support IN865-867 to operate legally and reliably there."
---
IN865-867 is the LoRaWAN regional frequency plan defined for **India**, which falls within ITU Region 3. As its name suggests, it operates in the sub-GHz spectrum of approximately **865 to 867 MHz**, the band allocated locally for low-power, license-exempt radio devices.

Like every LoRaWAN regional plan, IN865-867 specifies the channels, data rates, duty-cycle rules, and power limits that devices and gateways must follow. A LoRaWAN end device can only join and exchange data with a network using the same regional parameters, so hardware intended for India needs this plan to operate correctly and within local regulations.

When selecting equipment for an Indian deployment, confirm that:

- The device firmware lists IN865-867 among its supported regions.
- The gateway serving the area is also configured for IN865-867.

The devices below in this catalog are tagged as supporting the IN865-867 frequency plan. Always verify a vendor's datasheet for the exact regional and channel-plan support before integration.
