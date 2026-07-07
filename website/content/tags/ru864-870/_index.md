---
title: "LoRaWAN RU864-870 Frequency Plan"
linkTitle: "RU864-870"
description: "Browse LoRaWAN devices supporting the RU864-870 frequency plan, the regional parameters used for networks in the Russian Federation."
lede: "RU864-870 is the LoRaWAN regional frequency plan for networks deployed in the Russian Federation, operating in the sub-GHz band."
category: "frequency"
related: ["eu863-870", "as923", "in865-867", "kr920-923", "cn470-510", "us902-928"]
faq:
  - q: "Where is the RU864-870 frequency plan used?"
    a: "RU864-870 is the LoRaWAN regional parameters set for the Russian Federation, in ITU Region 1. It uses channels in the sub-GHz 864 to 870 MHz range."
  - q: "Can I use a device from another region on RU864-870?"
    a: "Only if its radio and firmware support the RU864-870 channels and parameters. Hardware tuned for a different region's frequencies will not join a network operating on this plan."
  - q: "What does the RU864-870 plan define?"
    a: "It defines the channel plan, default channels, data rates, transmit power, and duty-cycle limits that end devices and gateways must follow on this band in Russia."
---
**RU864-870** is the LoRaWAN regional frequency plan defined for the Russian Federation. It sits in ITU Region 1 and operates in the sub-GHz spectrum, with channels in the 864 to 870 MHz range as the plan name indicates.

Like other regional parameters, RU864-870 specifies the channel plan, default channels, data rates, and duty-cycle and power limits that gateways and end devices must follow to communicate legally and reliably on this band. A device deployed in Russia must be configured for RU864-870; hardware tuned for a different region's frequencies will not join the network or exchange data correctly.

When sourcing hardware for a deployment in this territory, confirm the band before you buy:

- The device radio must cover the RU864-870 channels.
- The firmware must advertise support for the RU864-870 regional parameters.

Devices in this catalog tagged RU864-870 declare compatibility with this plan, helping integrators match end devices to the network where they will operate.
