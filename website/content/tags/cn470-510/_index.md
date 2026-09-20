---
title: "LoRaWAN CN470-510 Frequency Plan"
linkTitle: "CN470-510"
description: "LoRaWAN CN470-510 is the regional frequency plan for China, using the 470-510 MHz sub-GHz band. Browse devices that support it."
lede: "CN470-510 is the LoRaWAN regional parameters set used in mainland China, operating across the 470-510 MHz sub-GHz band."
category: "frequency"
related: ["cn779-787", "as923", "au915-928", "kr920-923", "eu863-870", "us902-928"]
faq:
  - q: "Where is the CN470-510 frequency plan used?"
    a: "CN470-510 is the LoRaWAN regional plan defined for mainland China, which falls within ITU Region 3. It uses the 470 to 510 MHz portion of the sub-GHz spectrum allocated for this kind of low-power wireless use in China."
  - q: "What frequency range does CN470-510 cover?"
    a: "As the name indicates, the plan operates between roughly 470 MHz and 510 MHz. The LoRaWAN Regional Parameters specification defines the exact uplink and downlink channels, data rates, and spectrum-access rules within this band."
  - q: "Can I use a CN470-510 device in Europe or the US?"
    a: "No. Each region mandates a specific frequency plan, so a CN470-510 device is intended for deployment in China. For Europe use EU863-870 and for North America use US902-928, on hardware certified for that band."
---
CN470-510 is the LoRaWAN regional parameters set, or frequency plan, defined for mainland China. China sits in ITU Region 3, and this plan uses the sub-GHz spectrum between roughly 470 MHz and 510 MHz, as its name suggests.

A LoRaWAN frequency plan specifies which channels a device transmits and receives on, the available data rates, and the spectrum-access rules such as duty cycle or dwell time. The LoRaWAN Regional Parameters specification defines these details for CN470-510 so that end devices, gateways, and the network server agree on how to communicate.

A device must support the frequency plan used where it is deployed. Hardware tuned for one band will not reliably join or exchange traffic on another, and operating outside the locally permitted spectrum can breach radio regulations.

When sourcing hardware for a Chinese deployment, confirm that the device explicitly lists CN470-510 support and is certified for use on this band in China.

The devices on this page are catalogued as supporting CN470-510.
