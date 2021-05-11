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

import React from 'react'
import ReactDOM from 'react-dom'

import DeviceUplink from '../containers/device-uplink'

import 'normalize.css'
import '../styles/main.styl'

const { device } = window.config

const render = (id, component) => {
  ReactDOM.render(
    <React.StrictMode>
      {component}
    </React.StrictMode>,
    document.getElementById(id),
  )
}

render('device-events', <DeviceUplink model_id={device.modelid} brand_id={device.vendorid} device={device} />)
