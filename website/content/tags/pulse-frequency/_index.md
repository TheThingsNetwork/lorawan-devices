---
title: "LoRaWAN Pulse Frequency Sensors"
linkTitle: "Pulse Frequency"
description: "Browse LoRaWAN pulse frequency sensors that measure the rate of pulses from meters and flow devices and report readings over long range."
lede: "LoRaWAN devices that measure pulse frequency, reporting the rate of incoming pulses from meters, flow sensors, and rotating equipment."
category: "sensor"
related: ["pulse-count", "digital-input", "water", "energy", "velocity", "reed-switch"]
faq:
  - q: "What is the difference between pulse frequency and pulse count?"
    a: "Pulse count reports the cumulative number of pulses received, while pulse frequency reports the rate of pulses over time, for example pulses per second. Frequency is useful for instantaneous flow or speed readings, whereas count is used for totalized consumption."
  - q: "What can a LoRaWAN pulse frequency sensor connect to?"
    a: "It connects to equipment with a pulse output, such as water, gas, or electricity meters with an S0 interface, flow meters, anemometers, or rotation sensors. The sensor measures the incoming pulse rate and transmits it over LoRaWAN."
  - q: "How is pulse frequency data sent over LoRaWAN?"
    a: "The sensor samples the pulse rate locally and transmits encoded readings at scheduled uplink intervals to a LoRaWAN network. A payload codec on the network server decodes the bytes into a frequency value in pulses per second or a configured unit."
---
Pulse frequency sensing measures how often a pulse signal arrives, the rate of pulses over time, typically expressed in pulses per second (Hz) or a scaled engineering unit. It suits applications where you need an instantaneous rate rather than a running total, such as flow, rotational speed, or consumption load.

LoRaWAN pulse frequency devices wire to a dry-contact, open-collector, or S0 pulse output on the monitored equipment. The device counts edges over a sampling window, derives the frequency, then encodes it and sends scheduled uplinks to a LoRaWAN network. A payload codec on the network server decodes the bytes into a usable value. Common uses include water and gas flow rate, electricity load monitoring, wind speed from anemometers, and machine RPM across utilities, agriculture, and facilities.

When comparing devices, consider:

- Input type and maximum supported pulse frequency
- Battery life versus uplink interval
- Enclosure rating (IP) for outdoor or wet installs
- Supported regional frequency plans and the payload codec format
