---
title: "LoRaWAN Button Devices"
linkTitle: "Button"
description: "Browse LoRaWAN button devices that send wireless alerts and event triggers over long range for help calls, asset tagging and one-touch reporting."
lede: "LoRaWAN buttons turn a single press into a long-range wireless event, sending alerts, counts or status updates to your network on demand."
category: "sensor"
related: ["switch", "reed-switch", "occupancy", "motion", "pulse-count", "digital-input"]
faq:
  - q: "How does a LoRaWAN button work?"
    a: "A press wakes the device and triggers a small uplink over LoRaWAN to the network server, where the payload codec decodes it into an event. Many models distinguish single, double or long presses, and some send a separate confirmation or low-battery message. Between presses the device sleeps to conserve power."
  - q: "How long does the battery in a LoRaWAN button last?"
    a: "Because the radio only transmits on a press, battery life is typically measured in years rather than days. Actual longevity depends on press frequency, transmit power, the chosen frequency plan and whether heartbeat uplinks are enabled. Check the vendor's stated specifications and battery type."
  - q: "What can LoRaWAN buttons be used for?"
    a: "Common uses include staff and patient help calls, facility issue reporting, restocking and replenishment requests, asset check-in or check-out, and simple presence or confirmation triggers across large sites where wired or short-range wireless options are impractical."
---
A LoRaWAN button is a battery-powered end device whose primary input is a physical press rather than a continuous measurement. Each press generates a discrete event that is sent as a compact uplink, and the network server's payload codec decodes it into an action your application can react to. Many devices report the press type, a rolling counter, and periodic heartbeat or battery-status messages.

Because they transmit only on demand, buttons are well suited to large or hard-to-wire sites and applications that need a simple, reliable trigger:

- Help, panic and assistance calls in care, retail and hospitality
- Facility and maintenance issue reporting
- Replenishment, restock and service requests
- Asset or visitor check-in and confirmation

When comparing devices, weigh battery life and rated press cycles, supported frequency plans (such as EU868 or US915), enclosure rating for indoor versus outdoor use, mounting options, and whether multiple press patterns are supported. Confirm an available payload formatter so events decode cleanly into your platform without custom integration work.
