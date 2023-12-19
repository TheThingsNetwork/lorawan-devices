// Copyright © 2023 The Things Network Foundation, The Things Industries B.V.
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

import DeviceList from '../device-list'
import DeviceFilters from '../device-filters'

function Devices(props) {
  const { devices, initialFilter } = props

  const [currentDevices, setCurrentDevices] = React.useState([...devices].sort((a, b) => a.name.localeCompare(b.name)))
  const [filter, setFilter] = React.useState(initialFilter)

  const handleFilterDevices =  (filters) => {
    const filteredDevices = devices.filter(device => {
      // Check if all checkedSensors are included in the device's sensors
      const areAllSensorsValid = filters.sensors.length === 0 || filters.sensors.every(sensor => device.sensors.includes(sensor));

      // Assuming a device has only one vendor,
      // the check remains if the device's vendor is in checkedVendors
      const isVendorValid = filters.vendors.length === 0 || filters.vendors.includes(device.vendor.id);

      return areAllSensorsValid && isVendorValid;
    });

    setCurrentDevices([...filteredDevices].sort((a, b) => a.name.localeCompare(b.name)))
  }

  useEffect(() => {
    handleFilterDevices(filter)
  }, [filter])

  return (
    <div className='grid'>
      <div className='item-2'>
       <DeviceFilters devices={currentDevices} setFilter={setFilter} filter={filter} />
      </div>
      <div className='item-10'>
        <DeviceList devices={currentDevices} />
      </div>
    </div>

  )
}

export default Devices
