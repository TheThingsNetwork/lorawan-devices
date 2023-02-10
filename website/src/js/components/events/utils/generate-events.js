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

import { eventTemplates } from './event-data'

const generateId = (length) => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

// eslint-disable-next-line import/prefer-default-export
export const generateUplinkEvents = (payloadFormatter) => {
  const events = []
  const example =
    payloadFormatter.examples[Math.floor(Math.random() * payloadFormatter.examples.length)]
  eventTemplates.forEach((eventData) => {
    console.log(example)
    const currentDateISO = new Date().toISOString()
    const forwardEvent = {
      ...eventData,
      time: currentDateISO,
      unique_id: generateId(26),
      data: {
        ...eventData.data,
        received_at: currentDateISO,
        uplink_message: {
          ...eventData.data.uplink_message,
          f_port: example.input.f_port,
          frm_payload: example.input.frm_payload,
          decoded_payload:
            'data' in example.output
              ? example.output.data
              : 'errors' in example.output
              ? example.output.errors
              : undefined,
          received_at: currentDateISO,
        },
      },
    }
    events.push(forwardEvent)
  })
  return events
}
