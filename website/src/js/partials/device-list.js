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

import React from 'react'
import ReactDOM from 'react-dom'

import '../styles/main.styl'

import Devices from '../containers/devices'

const { devices } = window.config

const render = (id, component) => {
  ReactDOM.render(
    <React.StrictMode>
      {component}
    </React.StrictMode>,
    document.getElementById(id),
  )
}

const filters = [];


console.log('Device List JS loaded');

function getCheckedValues(formData, name) {
  var values = [];
  for (var entry of formData.entries()) {
      if (entry[0] === name && entry[1] !== '') {
          values.push(entry[1]);
      }
  }
  return values;
}

document.addEventListener('DOMContentLoaded', function() {
  // Select all elements with the class 'dr-filter'
  var elements = document.querySelectorAll('.ttui-field__checkbox.js-filter');
  // Iterate over the NodeList
  elements.forEach(function(element) {
      element.addEventListener('click', function(e) {

        var filterForm = document.querySelector('.dr-form-filters');
        var formData = new FormData(filterForm);

        // Get all checked values for each known filter type
        var checkedVendors = getCheckedValues(formData, 'vendors');
        var checkedSensors = getCheckedValues(formData, 'sensors');

        var filters = {
          vendors: checkedVendors,
          sensors: checkedSensors
        };

        render('device-list', <Devices devices={devices} initialFilter={filters} />)
      });
  });
});

function filterDevices() {
  // Function to get all checked values of checkboxes with the same name
  function getCheckedValues(formData, name) {
    var values = [];
    for (var entry of formData.entries()) {
        if (entry[0] === name && entry[1] !== '') {
            values.push(entry[1]);
        }
    }
    return values;
  }

  var filterForm = document.querySelector('.dr-form-filters');

  var formData = new FormData(filterForm);

  // Get all checked values for 'vendors'
  var checkedVendors = getCheckedValues(formData, 'vendors');
  var checkedSensors = getCheckedValues(formData, 'sensors');

  const filteredDevice = allDevices.filter(device => {
    // Check if all checkedSensors are included in the device's sensors
    const areAllSensorsValid = checkedSensors.length === 0 || checkedSensors.every(sensor => device.sensors.includes(sensor));

    // Assuming a device has only one vendor,
    // the check remains if the device's vendor is in checkedVendors
    const isVendorValid = checkedVendors.length === 0 || checkedVendors.includes(device.vendor.id);

    return areAllSensorsValid && isVendorValid;
  });


  // console.log(filteredDevice)

  // console.log('Checked vendors:', checkedVendors);
  // console.log('Checked sensors:', checkedSensors);

  function displayFilteredDevices(filteredDevice) {
    var deviceList = document.querySelector('.device-list');

    deviceList.innerHTML = '';

    // Example usage of JSX without React
    const myElement = (
      <div id="my-div">
        Hello, <span style={{ color: 'red' }}>world!</span>
      </div>
    );

    filteredDevice.forEach(device => {
      const listItem = document.createElement('p');
      listItem.textContent = `Device: ${device.name}`; // Assuming each device has a 'name' property
      deviceList.appendChild(listItem);
    });
  }

  displayFilteredDevices(filteredDevice);


  {{/*  TODO rebuild filter list based on selection  */}}


}
