---
title: "LoRaWAN AU915-928 Frequency Plan"
linkTitle: "AU915-928"
description: "Browse LoRaWAN devices supporting the AU915-928 frequency plan, the 915-928 MHz band used in Australia, New Zealand and nearby markets."
lede: "AU915-928 is the LoRaWAN regional frequency plan covering the 915-928 MHz band used in Australia, New Zealand and several neighbouring markets."
category: "frequency"
related: ["as923", "as923-2", "us902-928", "kr920-923", "in865-867", "eu863-870"]
faq:
  - q: "Where is the AU915-928 frequency plan used?"
    a: "AU915-928 is used in Australia, which sits in ITU Region 3, as well as New Zealand and some other markets that license the 915-928 MHz sub-band, including parts of Latin America. Always confirm the plan permitted by your local regulator before deploying."
  - q: "What frequency range does AU915-928 cover?"
    a: "As the name indicates, the uplink channels span roughly 915 to 928 MHz in the sub-GHz ISM range. The plan defines 64 125 kHz uplink channels plus 8 500 kHz uplink channels, organised into sub-bands, with 8 downlink channels in the 923-928 MHz range."
  - q: "Can a US902-928 device run on AU915-928?"
    a: "They share overlapping hardware in the 900 MHz band, but the channel plans and regulatory limits differ, so a device must be configured for and certified to operate on AU915-928 where it is deployed."
---
AU915-928 is one of the LoRaWAN regional parameter sets defined by the LoRa Alliance. It governs how end devices and gateways communicate across the 915-928 MHz portion of the sub-GHz ISM spectrum, specifying channel frequencies, data rates, duty-cycle and transmit-power constraints, and the join procedure for that region.

The plan is associated primarily with Australia, which falls in ITU Region 3, and is also used in New Zealand and several other markets whose regulators allocate this part of the 900 MHz band. The uplink portion defines 64 narrow 125 kHz channels alongside 8 wider 500 kHz channels, grouped into sub-bands that networks can select.

A LoRaWAN device only works where its radio and firmware match the locally permitted frequency plan. Deploying hardware built for a different band can mean it never joins the network or breaches local spectrum rules. When choosing equipment, check that:

- the device explicitly lists AU915-928 support;
- it is approved for the country where it will operate.

The devices below are catalogued as supporting AU915-928.
