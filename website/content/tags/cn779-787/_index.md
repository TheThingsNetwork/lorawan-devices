---
title: "LoRaWAN CN779-787 Frequency Plan"
linkTitle: "CN779-787"
description: "LoRaWAN CN779-787 frequency plan: the 779-787 MHz sub-GHz band defined by the LoRaWAN Regional Parameters for China."
lede: "CN779-787 is the LoRaWAN regional frequency plan covering the 779-787 MHz sub-GHz band, defined in the LoRaWAN Regional Parameters for use in China."
category: "frequency"
related: ["cn470-510", "eu433", "eu863-870", "as923", "in865-867"]
faq:
  - q: "Where is the CN779-787 frequency plan used?"
    a: "CN779-787 is specified in the LoRaWAN Regional Parameters for deployments in China that operate in the 779-787 MHz band. It falls within ITU Region 3. Always confirm current local spectrum rules with your regulator before deploying."
  - q: "What frequency range does CN779-787 cover?"
    a: "As the name suggests, the plan operates in the sub-GHz range of roughly 779 to 787 MHz. The exact default channels, data rates, and duty-cycle limits are defined in the LoRaWAN Regional Parameters specification."
  - q: "Can a device built for another band work on CN779-787?"
    a: "Only if its radio hardware and firmware support the 779-787 MHz channels. A device must implement the frequency plan used where it is deployed; a unit certified solely for EU863-870 or CN470-510, for example, will not operate correctly on CN779-787."
---
CN779-787 is one of the regional frequency plans defined in the LoRaWAN Regional Parameters. It describes how LoRaWAN end devices and gateways communicate in the sub-GHz band of roughly 779 to 787 MHz, a range used in China and falling within ITU Region 3.

The specification fixes the channel plan, allowed data rates, transmit power, and duty-cycle or dwell-time constraints for this band. Every device listed here implements CN779-787 so it can join and exchange traffic on a network operating in that spectrum.

A LoRaWAN device must support the frequency plan used where it is deployed. Radios are tuned to specific frequency ranges, so a device built for one band cannot simply be reused in another. When sourcing hardware, check that the product explicitly lists CN779-787 support and that your deployment region permits operation in this band.

If your installation site uses a different plan, browse the other regional frequency plans in this catalog, such as CN470-510 or EU863-870, to find compatible devices.
