---
title: "LoRaWAN AS923-4 Frequency Plan"
linkTitle: "AS923-4"
description: "LoRaWAN AS923-4 regional frequency plan: an AS923 variant defined by a frequency offset in the ~915-928 MHz band. Browse compatible devices."
lede: "AS923-4 is a LoRaWAN regional parameter set in the AS923 family, defined by a frequency offset applied to the shared AS923 channel plan."
category: "frequency"
related: ["as923", "as923-2", "as923-3", "kr920-923", "au915-928", "eu863-870"]
faq:
  - q: "What is the AS923-4 frequency plan?"
    a: "AS923-4 is one of the AS923 regional variants. It applies a defined frequency offset to the shared AS923 channel plan so that operation falls within a country's allocated portion of the AS923 spectrum."
  - q: "How does AS923-4 differ from the base AS923 plan?"
    a: "AS923-4 shares the AS923 channel structure, data rates, and parameters but applies a fixed frequency offset relative to the base AS923-1 plan, shifting its channels to suit local spectrum allocations."
  - q: "Why must my device support the right AS923 variant?"
    a: "A device transmits and receives only on the channels its frequency plan defines. To join a network and stay compliant with local spectrum rules, it must use the AS923 variant deployed in that country."
---
AS923-4 is a regional parameter set in the LoRaWAN specification, part of the AS923 family of plans for the Asia-Pacific (ITU Region 3) and adjacent markets. Like all AS923 variants, it builds on the same shared channel plan and data-rate structure but applies a defined frequency offset relative to the base AS923-1 plan, shifting channels to match local spectrum allocations.

The AS923 group exists because countries in and around the region allocate slightly different slices of the sub-GHz spectrum. Rather than one rigid plan, the LoRaWAN specification defines several offsets:

- AS923-1 (the base plan)
- AS923-2, AS923-3, and AS923-4, each shifted by a different defined offset

A LoRaWAN end device transmits and receives only on the channels its configured frequency plan permits. Selecting AS923-4 ensures a device operates on the correct frequencies for its deployment area, can join the local network, and stays within applicable spectrum regulations. Always confirm the plan matches the target country before deploying hardware.
