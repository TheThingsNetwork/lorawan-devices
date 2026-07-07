---
title: "LoRaWAN KR920-923 Frequency Plan"
linkTitle: "KR920-923"
description: "LoRaWAN KR920-923 frequency plan: the South Korea regional parameters using the 920-923 MHz sub-GHz band in ITU Region 3."
lede: "KR920-923 is the LoRaWAN regional frequency plan for South Korea, operating in the sub-GHz 920-923 MHz band."
category: "frequency"
related: ["as923", "as923-2", "as923-3", "au915-928", "cn470-510", "in865-867"]
faq:
  - q: "Where is the KR920-923 frequency plan used?"
    a: "KR920-923 is the LoRaWAN regional plan for the Republic of Korea (South Korea), which falls within ITU Region 3. It is the band reserved for license-free LoRaWAN operation in that country."
  - q: "What frequency range does KR920-923 cover?"
    a: "As the name implies, KR920-923 uses the sub-GHz spectrum from roughly 920 MHz to 923 MHz. Channels and data rates are defined by the LoRaWAN Regional Parameters specification published by the LoRa Alliance."
  - q: "Can I use a device built for a different plan in Korea?"
    a: "No. A device must transmit on the frequencies and respect the regulatory limits where it operates. To be deployed in South Korea, an end device must support KR920-923 and be certified for local use."
---
The **KR920-923** frequency plan is the LoRaWAN regional parameter set defined for the Republic of Korea (South Korea). Korea sits within ITU Region 3, and this plan governs how end devices and gateways communicate over the country's license-free sub-GHz spectrum.

As its name indicates, KR920-923 operates in the band spanning approximately **920 MHz to 923 MHz**. The exact channel layout, default data rates, dwell-time rules, and transmit power limits are set by the LoRaWAN Regional Parameters specification from the LoRa Alliance, aligned with local Korean radio regulations.

Frequency plans matter because radio spectrum allocations differ from country to country. A device certified for one region cannot simply be moved to another:

- Hardware must include a radio front-end tuned for the 920-923 MHz range.
- Firmware must implement the KR920-923 channel and data-rate definitions.

Devices listed under this tag declare support for KR920-923, making them suitable candidates for LoRaWAN deployments in South Korea.
