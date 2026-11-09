---
title: "LoRaWAN AS923-3 Frequency Plan"
linkTitle: "AS923-3"
description: "Browse LoRaWAN devices supporting the AS923-3 frequency plan, an AS923 variant in the ~915-928 MHz band."
lede: "AS923-3 is a variant of the LoRaWAN AS923 plan, shifting the default channels within the 915-928 MHz sub-GHz band."
category: "frequency"
related: ["as923", "as923-2", "as923-4", "au915-928", "kr920-923", "us902-928"]
faq:
  - q: "How does AS923-3 differ from AS923-1 and AS923-2?"
    a: "All are part of the AS923 family defined in the LoRaWAN Regional Parameters and share the same channel plan structure and 125 kHz bandwidth. They differ by a frequency offset applied to the default join channels, letting operators fit AS923 operation into different slices of the regional spectrum allocation. AS923-3 applies its own offset, so a device must be configured for the specific variant in use on the network it joins."
  - q: "Which frequency plan should my device use?"
    a: "Match the plan to the country and network where the device is deployed. A device configured for the wrong AS923 variant will use the wrong default channels and may fail to join. Confirm the exact variant (AS923-1, -2, -3, or -4) with your network operator before provisioning."
---
AS923-3 is one of the regional parameter sets defined for LoRaWAN in the AS923 family. AS923 covers much of the Asia-Pacific region and operates in the sub-GHz spectrum around 915-928 MHz, using 125 kHz channels. The "-3" suffix denotes a specific variant: it shares the AS923 channel plan but applies a defined frequency offset to the default channels, fitting the plan within a particular slice of locally allocated spectrum.

The AS923 group exists because different countries permit slightly different sub-bands within the broader allocation. Rather than define a separate plan per market, the LoRaWAN Regional Parameters specify AS923-1 through AS923-4 as offset variants of the same base scheme.

A LoRaWAN end device must support the exact frequency plan used by its network. Key points:

- AS923-3 uses the AS923 channel structure with its own frequency offset.
- A mismatched variant can prevent a device from joining or transmitting.
- Always confirm the required variant with your operator before provisioning.
