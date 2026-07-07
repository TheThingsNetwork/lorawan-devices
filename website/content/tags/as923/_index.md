---
title: "LoRaWAN AS923 Frequency Plan"
linkTitle: "AS923"
description: "Browse LoRaWAN devices supporting the AS923 frequency plan, the 915–928 MHz regional parameters used across much of Asia-Pacific."
lede: "AS923 is the LoRaWAN regional parameter set covering the 915–928 MHz band used across large parts of the Asia-Pacific region."
category: "frequency"
related: ["as923-2", "as923-3", "as923-4", "au915-928", "kr920-923", "in865-867"]
faq:
  - q: "Which countries use the AS923 frequency plan?"
    a: "AS923 is used across much of the Asia-Pacific region, including countries such as Japan, Singapore, Malaysia, Indonesia, Thailand, Vietnam and others. Because local regulations differ, AS923 is divided into channel groups (AS923-1 through AS923-4), so always confirm the exact plan and channel mask required by the country and operator where you deploy."
  - q: "What frequency band does AS923 operate in?"
    a: "AS923 operates in the sub-GHz 915–928 MHz ISM band. The plan defines default channels and a common channel frequency offset so the same hardware can be tuned to the segment of the band allowed in a given country."
  - q: "What is the difference between AS923 and AS923-2, AS923-3 and AS923-4?"
    a: "They share the same physical layer and channel plan but apply different frequency offsets to fit each country's allocated portion of the 915–928 MHz band. A device must use the variant matching its deployment country to stay within legal limits and reach the network."
---
AS923 is one of the LoRaWAN regional parameter sets defined by the LoRa Alliance. It governs the radio channels, data rates, transmit power and duty-cycle rules that a device and network use when communicating in the Asia-Pacific region. AS923 operates in the sub-GHz **915–928 MHz** band, sitting between the European and North American plans.

Because national regulators allocate different slices of this spectrum, AS923 is split into channel groups (AS923-1 through AS923-4) that apply different frequency offsets. The plan is used in many Asia-Pacific markets, including Japan, Singapore, Malaysia, Thailand, Indonesia and Vietnam, among others.

A LoRaWAN end device must support the frequency plan in force where it is deployed, because:

- It will not join or exchange data with a gateway tuned to a different plan.
- Transmitting outside the locally permitted channels can break radio regulations.

The devices listed here declare AS923 support, helping integrators match hardware to the correct regional configuration before rollout.
