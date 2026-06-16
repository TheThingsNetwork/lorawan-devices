---
title: "LoRaWAN Vapor Pressure Sensors"
linkTitle: "Vapor Pressure"
description: "Browse LoRaWAN vapor pressure sensors in The Things Network Device Repository, with frequency plans, payload codecs and accuracy specs."
lede: "LoRaWAN sensors that report vapor pressure — the partial pressure of water vapor in air — for agriculture, HVAC and environmental monitoring."
category: "sensor"
related: ["humidity", "temperature", "dew-point", "vapor-pressure-deficit", "barometer", "leaf-wetness"]
faq:
  - q: "How does a LoRaWAN sensor measure vapor pressure?"
    a: "Most devices derive vapor pressure from on-board temperature and relative humidity readings, then transmit the calculated value over LoRaWAN. Some report actual (ambient) vapor pressure, others saturation vapor pressure, so check the datasheet and payload codec to confirm which figure each uplink contains."
  - q: "What units are LoRaWAN vapor pressure readings reported in?"
    a: "Vapor pressure is typically expressed in kilopascals (kPa) or hectopascals/millibars (hPa/mbar). The decoded payload defines the exact unit and scaling, so verify the device codec before integrating the data into your application."
  - q: "Why measure vapor pressure instead of relative humidity?"
    a: "Vapor pressure is an absolute measure of moisture in air and does not change with temperature the way relative humidity does. This makes it useful for greenhouse climate control, crop transpiration models and condensation risk analysis."
---
Vapor pressure is the partial pressure exerted by water vapor in air, an absolute measure of atmospheric moisture usually expressed in kilopascals (kPa) or hectopascals (hPa). Unlike relative humidity, it does not shift with temperature alone, making it valuable for climate modeling and condensation analysis.

LoRaWAN devices in this category typically combine a temperature and humidity element, compute vapor pressure on-board, and send the result in compact uplinks over long ranges on low power. Battery-powered nodes can run for years on scheduled reports, and a decoder (payload codec) converts the raw bytes into usable values in your application.

Common deployments include:

- Greenhouse and vertical-farming climate control
- Crop transpiration and irrigation modeling
- HVAC and building moisture management

When comparing devices, weigh measurement range and accuracy, whether actual or saturation vapor pressure is reported, battery life and reporting interval, enclosure (IP) rating for outdoor use, supported regional frequency plans, and the availability of a documented payload codec.
