// Copyright © 2021 The Things Network Foundation, The Things Industries B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export const eventTemplates = [
  {
    name: 'as.up.data.forward',
    time: '2020-09-25T13:46:53.445120375Z',
    identifiers: [
      {
        device_ids: {
          device_id: 'test-dev-01',
          application_ids: {
            application_id: 'tti-ch-test-app',
          },
          dev_eui: '0004A30B001C1E48',
          join_eui: '8000000000000003',
          dev_addr: '2700000B',
        },
      },
    ],
    data: {
      '@type': 'type.googleapis.com/ttn.lorawan.v3.ApplicationUplink',
      end_device_ids: {
        device_id: 'test-dev-01',
        application_ids: {
          application_id: 'tti-ch-test-app',
        },
        dev_eui: '0004A30B001C1E48',
        join_eui: '8000000000000003',
        dev_addr: '2700000B',
      },
      correlation_ids: [
        'as:up:01EK2R8GM3JN90QF338G3G2NS0',
        'gs:conn:01EK2KY9B4Q2Y6QT1GAEEB2TQX',
        'gs:up:host:01EK2KY9BB88KBZFGQCQYTGYPK',
        'gs:uplink:01EK2R8F8NSVXWK1YRC42DS0D0',
        'ns:uplink:01EK2R8FMHS2K1B5FPBE65PFQN',
        'rpc:/ttn.lorawan.v3.GsNs/HandleUplink:01EK2R8FMGZGHJ1X6K6QQ94JX8',
      ],
      received_at: '2020-09-25T13:46:53.444154877Z',
      uplink_message: {
        session_key_id: 'AXTFUoae2WV6TtuOUy0bHQ==',
        f_port: 1,
        f_cnt: 202,
        frm_payload: 'AQ==',
        decoded_payload: {},
        rx_metadata: [
          {
            gateway_ids: {
              gateway_id: 'test-gateway-01',
              eui: '647FDAFFFE007B3F',
            },
            timestamp: 237035948,
            rssi: -49,
            channel_rssi: -49,
            snr: 6.8,
            uplink_token:
              'CiMKIQoVcm9tYW4ta29uYS1taWNyby1ob21lEghkf9r//gB7PxCsw4NxGgsIzOm3+wUQ6ZioGSDgj8aD84MB',
            channel_index: 6,
          },
        ],
        settings: {
          data_rate: {
            lora: {
              bandwidth: 125000,
              spreading_factor: 7,
            },
          },
          data_rate_index: 5,
          coding_rate: '4/5',
          frequency: '868300000',
          timestamp: 237035948,
        },
        received_at: '2020-09-25T13:46:52.433197574Z',
      },
    },
    correlation_ids: [
      'as:up:01EK2R8GM3JN90QF338G3G2NS0',
      'gs:conn:01EK2KY9B4Q2Y6QT1GAEEB2TQX',
      'gs:up:host:01EK2KY9BB88KBZFGQCQYTGYPK',
      'gs:uplink:01EK2R8F8NSVXWK1YRC42DS0D0',
      'ns:uplink:01EK2R8FMHS2K1B5FPBE65PFQN',
      'rpc:/ttn.lorawan.v3.GsNs/HandleUplink:01EK2R8FMGZGHJ1X6K6QQ94JX8',
    ],
    unique_id: '01EK2R8GM5XZBD1S5PGPRCE5NV',
  },
]
