---
title: "LoRaWAN EU863-870 Frequency Plan"
linkTitle: "EU863-870"
description: "Browse LoRaWAN devices supporting the EU863-870 frequency plan, the 868 MHz sub-GHz band used across Europe (ITU Region 1)."
lede: "EU863-870 is the LoRaWAN regional parameters set for the 863-870 MHz sub-GHz band used throughout Europe."
category: "frequency"
related: ["ru864-870", "in865-867", "as923", "us902-928", "au915-928", "kr920-923"]
faq:
  - q: "Where is the EU863-870 frequency plan used?"
    a: "EU863-870 is the LoRaWAN regional parameters set for ITU Region 1, covering Europe and adjacent territories that adopt the 863-870 MHz license-exempt SRD band, commonly referred to as the 868 MHz band."
  - q: "What frequency range does EU863-870 cover?"
    a: "As the name indicates, the plan operates in the sub-GHz spectrum between roughly 863 and 870 MHz. Many networks center default join and uplink channels near 868 MHz within this range."
  - q: "Why must a device support the right regional frequency plan?"
    a: "LoRaWAN radios and duty-cycle rules are region-specific. A device built for another plan will not transmit on the channels your network uses, so it must support EU863-870 to operate legally and connect in Europe."
---
EU863-870 is one of the LoRaWAN regional parameters sets defined by the LoRa Alliance. It governs how end devices use the license-exempt sub-GHz spectrum in ITU Region 1, the area that includes Europe and many neighbouring territories that share the same 863-870 MHz Short Range Device band. This range is widely known simply as the "868 MHz" band.

The plan specifies the channel frequencies, data rates, transmit-power limits and duty-cycle constraints that devices and networks must honour in this band. Following it keeps a device compliant with European radio regulations and interoperable with the gateways deployed there.

Choosing the correct regional plan matters because LoRaWAN is not a single global setting:

- Radio hardware and channel definitions differ between regions.
- A device configured for another band will not align with local network channels.
- Regulatory duty-cycle and power rules vary by region.

Devices listed here declare support for EU863-870, making them suitable for deployment on networks operating in the European 868 MHz band.
