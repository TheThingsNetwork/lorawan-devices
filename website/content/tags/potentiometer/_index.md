---
title: "LoRaWAN Potentiometer Sensors"
linkTitle: "Potentiometer"
description: "Browse LoRaWAN potentiometer sensors that measure resistive wiper position and angle, reporting values wirelessly over long range."
lede: "LoRaWAN potentiometer sensors read resistive wiper position and stream the value wirelessly over long-range, low-power links."
category: "sensor"
related: ["analog-input", "4-20-ma", "voltage", "hall-effect", "tilt", "level"]
faq:
  - q: "What does a LoRaWAN potentiometer sensor measure?"
    a: "It reads the wiper position of a resistive potentiometer (rotary or linear) and converts that resistance ratio into a value representing angle, displacement, or a control setting. The device transmits the reading over LoRaWAN at scheduled intervals."
  - q: "How is potentiometer data reported over LoRaWAN?"
    a: "The node samples the wiper, encodes the value into a compact uplink payload, and sends it on your regional frequency plan. A payload codec on the network or application server decodes the bytes into a percentage, resistance, or engineering unit."
  - q: "Where are LoRaWAN potentiometer sensors used?"
    a: "Common uses include monitoring valve and damper positions, lever or pedal settings, fluid-level floats, and machine controls in industrial, building-automation, and agricultural settings where wiring a long cable run is impractical."
---
A potentiometer is a variable resistor whose output changes as a wiper moves along a resistive track. Reading that wiper tells you a rotary angle, a linear displacement, or the setting of a dial, lever, or float. A LoRaWAN potentiometer sensor digitizes this analog value and sends it wirelessly, so a control position can be monitored without a long cable back to a controller.

These devices sample the wiper voltage or resistance ratio, encode it into a small uplink payload, and transmit on a regional frequency plan. A payload codec decodes the bytes into a percentage or engineering unit on the application server. Typical uses include valve and damper position feedback, level floats, and machine setpoint monitoring across industrial, building, and agricultural sites.

When comparing devices, check:

- Input range, resolution, and accuracy for your potentiometer
- Battery life, reporting interval, and supported frequency plans
- Enclosure rating (IP/IK) for the install environment
- The payload codec and decoded output units
