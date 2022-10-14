// Copyright © 2022 The Things Network Foundation, The Things Industries B.V.
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

import React from 'react'
import * as mqtt from 'mqtt'

const client = mqtt.connect('mqtt://localhost:1883')

function Mqtt(props) {
  const { lastEvent, url } = props

  if (url != oldUrl) {
    client = mqtt.connect(url)
  }
  const oldUrl = url

  function getApplication(event) {
    if (event === undefined) {
      return ''
    }
    return event['identifiers'][0]['device_ids']['application_ids']['application_id']
  }

  function getDeviceID(event) {
    if (event === undefined) {
      return ''
    }
    return event['identifiers'][0]['device_ids']['device_id']
  }

  if (!(lastEvent === undefined)) {
    let topic =
      'mock.cloud.thethings.industries/v3/' +
      getApplication(lastEvent) +
      '@mock/devices/' +
      getDeviceID(lastEvent) +
      '/up'

    client.publish(topic, JSON.stringify(lastEvent['data']))
  }

  return <></>
}

export default Mqtt
