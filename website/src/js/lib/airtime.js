// LoRa airtime math (Semtech AN1200.13). Used by the emulated uplink metadata.

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
