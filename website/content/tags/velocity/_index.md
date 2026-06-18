---
title: "LoRaWAN Velocity Sensors"
linkTitle: "Velocity"
description: "Browse LoRaWAN velocity sensors that measure speed and rate of movement, reporting data wirelessly over long range for low-power IoT monitoring."
lede: "LoRaWAN velocity sensors measure the speed and direction of moving objects, fluids, or air and report readings wirelessly over long-range, low-power links."
category: "sensor"
related: ["accelerometer", "wind-speed", "gps", "vibration", "tilt", "distance"]
faq:
  - q: "What does a LoRaWAN velocity sensor measure?"
    a: "It measures the rate of movement, typically speed (and often direction), of an object, vehicle, fluid, or airflow. Depending on the device, velocity may be derived from motion, position change over time, flow rate, or Doppler-based detection, then encoded into a LoRaWAN uplink payload."
  - q: "How do LoRaWAN velocity sensors transmit data?"
    a: "They sample the measured velocity and send compact, encoded payloads over a LoRaWAN network to a gateway, which forwards them to a network server. A payload codec on the application server decodes the bytes into engineering units such as m/s or km/h."
  - q: "What should I compare when choosing a LoRaWAN velocity sensor?"
    a: "Compare measurement range and accuracy, sampling and reporting interval, battery life and power draw, enclosure rating for the deployment environment, supported regional frequency plans, and whether a payload decoder is provided."
---
Velocity sensing captures how fast something is moving, and often in which direction. Depending on the application, "velocity" can describe a moving object or vehicle, the flow of a liquid through a pipe or channel, or the speed of air or wind. The measurement is expressed as a rate, such as metres per second or kilometres per hour.

LoRaWAN velocity devices sample the measured rate on a fixed or event-driven schedule and transmit small encoded payloads to a nearby gateway. The gateway relays uplinks to the network server, and an application-side payload codec converts the raw bytes into usable engineering units. Long range and low power make these sensors well suited to remote or hard-to-wire locations.

Common deployments include industrial flow monitoring, fleet and asset movement, structural and environmental studies, and weather observation. When comparing devices, weigh:

- Measurement range, resolution, and accuracy
- Battery life and reporting interval
- Enclosure rating for the install environment
- Supported regional frequency plans and an available payload decoder
