// Builds the JSON uplink envelope exactly as The Things Stack delivers it
// over MQTT or webhooks, populated from a real codec example payload.

import { loraAirtime } from './airtime'

// Representative uplink channel per frequency plan.
const PLAN_FREQUENCY = {
  'EU863-870': '868100000',
  'US902-928': '903900000',
  'AU915-928': '916800000',
  AS923: '923200000',
  'AS923-2': '921400000',
  'AS923-3': '916600000',
  'AS923-4': '917300000',
  'KR920-923': '922100000',
  'IN865-867': '865402500',
  'RU864-870': '868900000',
  'CN470-510': '486300000',
  EU433: '433175000',
}

export const planFrequency = (plan) => PLAN_FREQUENCY[plan] || '868100000'

const b64 = (bytes) => btoa(String.fromCharCode.apply(null, bytes))

const hash = (s) => {
  let h = 0
  for (let i = 0; i < (s || '').length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// Stable, obviously-fake DevEUI derived from the model id.
export const deviceID = (modelID) =>
  `eui-70b3d57ed0${(hash(modelID) % 0xffffff).toString(16).padStart(6, '0')}`

export const buildEnvelope = ({
  modelID,
  bytes,
  fPort,
  decoded,
  plan,
  sf = 9,
  fCnt = 341,
  rssi = -98,
  snr = 7.25,
  receivedAt = new Date(),
}) => {
  const devID = deviceID(modelID)
  const devEUI = devID.replace('eui-', '').toUpperCase()
  const airtime = loraAirtime({ payloadBytes: bytes.length + 13, sf })

  const envelope = {
    end_device_ids: {
      device_id: devID,
      application_ids: { application_id: 'your-application' },
      dev_eui: devEUI,
      dev_addr: '260B' + (hash(devID) % 0x10000).toString(16).toUpperCase().padStart(4, '0'),
    },
    received_at: receivedAt.toISOString(),
    uplink_message: {
      f_port: fPort,
      f_cnt: fCnt,
      frm_payload: b64(bytes),
      decoded_payload: decoded,
      rx_metadata: [
        {
          gateway_ids: { gateway_id: 'example-gateway' },
          rssi,
          channel_rssi: rssi,
          snr,
          channel_index: 4,
        },
      ],
      settings: {
        data_rate: {
          lora: { bandwidth: 125000, spreading_factor: sf, coding_rate: '4/5' },
        },
        frequency: planFrequency(plan),
      },
      consumed_airtime: airtime.toFixed(6) + 's',
    },
  }

  if (decoded === undefined) delete envelope.uplink_message.decoded_payload
  return envelope
}

export const topicFor = (modelID) =>
  `v3/your-application/devices/${deviceID(modelID)}/up`
