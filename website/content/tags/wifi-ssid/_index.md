---
title: "LoRaWAN Wi-Fi SSID Sensors"
linkTitle: "Wi-Fi SSID"
description: "LoRaWAN Wi-Fi SSID devices scan nearby access points and report BSSID/MAC lists for low-power indoor and urban positioning over long range."
lede: "LoRaWAN devices that passively scan nearby Wi-Fi access points and report their BSSID lists for low-power indoor and urban geolocation."
category: "sensor"
related: ["gps", "rssi", "link", "accelerometer", "battery", "motion"]
faq:
  - q: "How do LoRaWAN Wi-Fi SSID sensors determine location?"
    a: "They scan for nearby Wi-Fi access points, capture the BSSID (MAC address) and signal strength of each, and send that list over LoRaWAN. A cloud geolocation service matches the access points against a database to estimate a position, which is useful indoors where GPS is weak."
  - q: "Do Wi-Fi SSID trackers replace GPS?"
    a: "Not entirely. Wi-Fi scanning excels indoors and in dense urban areas where GNSS struggles, and a scan typically draws less power than a GPS fix. Many trackers combine both, falling back to GPS outdoors and Wi-Fi indoors."
  - q: "Does the device need to connect to the Wi-Fi network?"
    a: "No. It only passively scans the airwaves for access point beacons. It does not associate, authenticate, or transmit any data over Wi-Fi, so no network credentials are required."
---
Wi-Fi SSID sensing is a geolocation technique rather than an environmental measurement. The device passively scans for nearby Wi-Fi access points, records each one's BSSID (MAC address) and received signal strength, and transmits that list as a LoRaWAN uplink. A network-side resolver then matches the access points against a positioning database to estimate the device's location.

Because scanning is brief and the radio never associates with any network, power draw stays low and coverage reaches places GPS cannot. This makes Wi-Fi-based positioning popular for:

- Indoor asset tracking in warehouses and hospitals
- Logistics and last-mile parcel tracking
- Dense urban deployments where GNSS multipath degrades fixes

When comparing devices, look at how many access points each scan reports, the supported frequency plans, battery life at your reporting interval, enclosure rating, and whether the payload codec is documented for your network server. Many trackers also combine Wi-Fi scanning with GPS and motion sensing to balance accuracy and power.
