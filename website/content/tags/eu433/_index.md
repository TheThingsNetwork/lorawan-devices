---
title: "LoRaWAN EU433 Frequency Plan"
linkTitle: "EU433"
description: "Browse LoRaWAN devices supporting the EU433 frequency plan, the 433 MHz ISM band used across ITU Region 1."
lede: "EU433 is the LoRaWAN regional plan for the 433 MHz ISM band, used in ITU Region 1, including Europe, Africa, and the Middle East."
category: "frequency"
related: ["eu863-870", "cn470-510", "in865-867", "ru864-870", "as923", "kr920-923"]
faq:
  - q: "Where is the EU433 frequency plan used?"
    a: "EU433 applies to the 433 MHz ISM band within ITU Region 1, which covers Europe, Africa, and the Middle East. It is one of several plans available in this region alongside EU863-870. Always confirm that the band is permitted by your local regulator before deploying."
  - q: "What frequency range does EU433 cover?"
    a: "As the name implies, EU433 operates in the sub-GHz 433 MHz ISM band, with channels falling roughly between 433.05 and 434.79 MHz. The LoRaWAN Regional Parameters specification defines the exact default and join channels, data rates, and duty-cycle limits for this plan."
  - q: "Why must a device match the regional frequency plan?"
    a: "A LoRaWAN end device only communicates with gateways and a network server when it transmits on the channels and data rates defined by the regional plan in use. A device built for a different band, such as US902-928, will not join or operate on an EU433 network."
---
The EU433 frequency plan defines how LoRaWAN end devices operate in the 433 MHz ISM band. It is one of the regional parameter sets standardized by the LoRa Alliance, specifying the channel frequencies, data rates, maximum payload sizes, and duty-cycle constraints a device must follow on this band.

EU433 belongs to ITU Region 1, which spans Europe, Africa, and the Middle East. As a sub-GHz plan, its channels sit around the 433 MHz mark, roughly between 433.05 and 434.79 MHz. In much of this region the more common choice is EU863-870, but EU433 remains available where the 433 MHz band is permitted.

A LoRaWAN device must support the frequency plan used where it is deployed in order to join a network and exchange data:

- It transmits and listens only on that plan's channels and data rates.
- It respects the band's duty-cycle and power limits.

Devices on this page are catalogued as supporting EU433.
