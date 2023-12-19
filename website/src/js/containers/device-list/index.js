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

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

function DeviceList(props) {
  const { devices } = props

  console.log(devices)

  return (
    <ul className="device-list">
        <div className="grid">
            {devices.map((device) => (
              <div className="item-4 sm:item-12" key={device.id}>
              <li className="device-list__item">
                <h2>{device.name}</h2>
                <p className="device-list__description">Description</p>
                <div className="device-list__image">
                  <img src="#" />
                </div>
                <div className="device-list__cta">
                  <a href="#" className="ttui-btn ttui-btn--primary">See more</a>
                </div>
              </li>
            </div>
            ))}
        </div>
      </ul>
  )
}

export default DeviceList

// function DeviceListItem(props) {
//   const { device } = props

//   return (
//     <div className="item-4 sm:item-12" key={device.id}>
//     <li className="device-list__item">
//       <h2>{device.name}</h2>
//       <p className="device-list__description">Description</p>
//       <div className="device-list__image">
//         <img src="#" />
//       </div>
//       <div className="device-list__cta">
//         <a href="#" className="ttui-btn ttui-btn--primary">See more</a>
//       </div>
//     </li>
//     </div>
//   )
// }
