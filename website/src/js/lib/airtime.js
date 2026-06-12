// LoRa airtime math (Semtech AN1200.13). Used by the battery estimator
// and the emulated uplink metadata.

// Returns time-on-air in seconds for a LoRa transmission.
export const loraAirtime = ({
  payloadBytes,
  sf,
  bandwidthHz = 125000,
  preambleSymbols = 8,
  codingRate = 1, // CR 4/5
  explicitHeader = true,
  lowDataRateOptimize = null,
}) => {
  const ldro = lowDataRateOptimize === null ? sf >= 11 : lowDataRateOptimize
  const tSym = Math.pow(2, sf) / bandwidthHz
  const tPreamble = (preambleSymbols + 4.25) * tSym
  const num =
    8 * payloadBytes - 4 * sf + 28 + 16 - (explicitHeader ? 0 : 20)
  const den = 4 * (sf - (ldro ? 2 : 0))
  const payloadSymbols = 8 + Math.max(Math.ceil(num / den) * (codingRate + 4), 0)
  return tPreamble + payloadSymbols * tSym
}

// Rough battery life estimate for a class-A device.
// Returns years. All currents in mA, capacity in mAh.
export const estimateBatteryYears = ({
  capacitymAh,
  intervalMinutes,
  payloadBytes,
  sf,
  sleepuA = 8,
  txmA = 45,
  rxmA = 11,
}) => {
  // LoRaWAN frame overhead: 13 bytes (MHDR..MIC) on top of the application payload.
  const airtime = loraAirtime({ payloadBytes: payloadBytes + 13, sf })
  const uplinksPerDay = (24 * 60) / intervalMinutes
  // Two receive windows, conservatively ~0.5s of active RX per uplink.
  const rxSeconds = 0.5
  const mAhPerUplink = (txmA * airtime + rxmA * rxSeconds) / 3600
  const dailyActive = uplinksPerDay * mAhPerUplink
  const dailySleep = (sleepuA / 1000) * 24
  // 15% capacity derating for self-discharge and cold weather.
  const usable = capacitymAh * 0.85
  const days = usable / (dailyActive + dailySleep)
  return days / 365
}
