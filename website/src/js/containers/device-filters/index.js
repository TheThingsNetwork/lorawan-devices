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

function DeviceFilters(props) {
  const { devices, setFilter, filter } = props

  useEffect(() => {

    console.log('filter', filter);

    const sensors = devices.map(device => device.sensors).flat()
    const vendors = devices.map(device => device.vendor)

    const results = []
    const map = new Map();
    for (const item of vendors) {
        if(!map.has(item.id)){
            map.set(item.id, true);    // set any value to Map
            results.push({
                id: item.id,
                name: item.name
            });
        }
    }
    setUniqueSensors([...new Set(sensors)])
    setVendorList(results)
  }, [filter])


  const [uniqueSensors, setUniqueSensors] = React.useState([])
  const [vendorList, setVendorList] = React.useState([])

  return (
    <form className="dr-form-filters">
    <h3>Sensors</h3>
    <br />
    {uniqueSensors.map((sensor) => (
      <DeviceFilter id={sensor} name={sensor} type="sensors" key={`id-${sensor}`} setFilter={setFilter} filter={filter} />
    ))}

    <h3>Vendors</h3>
    <br />

    {
      vendorList.map((vendor) => (
        <DeviceFilter id={vendor.id} name={vendor.name} type="vendors" key={`id-${vendor.id}`} setFilter={setFilter} filter={filter} />
      ))
    }
  </form>
  )
}

export default DeviceFilters


function DeviceFilter(props) {
  const {id, name, type, setFilter, filter} = props

  const handleClick = (e) => {
    // if checked, add to filter
    // if unchecked, remove from filter

    console.log(e.target.checked);

    e.target.checked ? setFilter({...filter, [type]: [...filter[type], id]}) :  setFilter({...filter, [type]: filter[type].filter(item => item !== id)});
  }

  return (<div className="ttui-field" key={`id-${id}`}>
  <label className="ttui-field__label ttui-field__label--checkbox" htmlFor={`id-${ id }`}>
    <input
      type="checkbox"
      id={`id-${ id }`}
      name={type}
      className="ttui-field__checkbox"
      value={id}
      onClick={handleClick}
      checked={filter[type].includes(id)}
    />
    {name}
  </label>
</div>)
}
