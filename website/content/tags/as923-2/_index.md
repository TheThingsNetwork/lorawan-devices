---
title: "LoRaWAN AS923-2 Frequency Plan"
linkTitle: "AS923-2"
description: "Browse LoRaWAN devices supporting AS923-2, the AS923 group that applies a -1.8 MHz channel offset, used in parts of the Asia-Pacific."
lede: "AS923-2 is a group of the LoRaWAN AS923 plan that shifts the default channels down by 1.8 MHz to fit national allocations in parts of the Asia-Pacific."
category: "frequency"
related: ["as923", "as923-3", "as923-4", "au915-928", "kr920-923", "in865-867"]
faq:
  - q: "What is the difference between AS923 and AS923-2?"
    a: "AS923-2 is one of the frequency-offset groups of the AS923 plan. It keeps the same channel structure and data rates as the baseline AS923 (AS923-1) but applies a -1.8 MHz offset to the default channels so they fit the spectrum allocated where it applies. Devices and networks must agree on the same group to communicate."
  - q: "Where is AS923-2 used?"
    a: "AS923-2 is used in Asia-Pacific countries whose sub-GHz allocations align with the -1.8 MHz offset, such as Brunei, Indonesia, and Vietnam. National rules change, so always confirm the correct group against your local regulator and your network operator before deployment."
  - q: "Does my device need to support AS923-2 specifically?"
    a: "Yes. A device must implement the exact frequency plan and offset group in force where it is deployed. An AS923 device set to the wrong group may transmit outside the permitted channels and fail to join, so verify the plan with your operator."
---
AS923-2 is one of the frequency-offset groups defined within the LoRaWAN **AS923** regional parameters. AS923 covers sub-GHz spectrum used across the Asia-Pacific (broadly the 915-928 MHz region), and it is split into groups so a single plan can fit the differing national allocations there. Relative to the baseline AS923-1, AS923-2 applies a -1.8 MHz offset, shifting its default channels downward by that amount.

This page lists catalogued devices that support AS923-2. The group is intended for countries whose spectrum rules match this offset; the exact list is set by national regulators, so always confirm the correct plan with your network operator.

A LoRaWAN device must implement the frequency plan in force where it operates:

- Channels, default data rates, and duty-cycle or dwell-time rules all depend on the plan.
- An AS923 device configured for the wrong group can transmit on disallowed channels and fail to join.

When in doubt, match the AS923 group your operator advertises for your country.
