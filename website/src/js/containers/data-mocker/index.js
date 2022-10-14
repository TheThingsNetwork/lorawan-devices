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
import axios from 'axios'

function HTTPSender(props) {
  const { events, serverURL } = props;
  const [currentURL, setCurrentURL] = React.useState('')
  const [currLen, setCurrLen] = React.useState(-1)

  React.useEffect(() => {
    console.log(`HTTP SENDER serverURL: ${serverURL}`)
      console.log(`NICK currentURL :: ${currentURL}`)
    if (currentURL !== serverURL && (serverURL !== undefined && serverURL.length > 0)) {
      setCurrentURL(serverURL)
    }
    if (currentURL !== '') {
      // Doesn't send duplicates.
      if (events?.length !== undefined && events.length >= 0) {
        setCurrLen(events.length)
        axios.post(currentURL, { ...events[(currLen === 0) ? 0 : currLen - 1] })
          .then(() => { console.log("Sent") })
          .catch((err) => { console.log(`Something went wrong! => ${err}`) })
      }
    }
  });

  return (<></>);
}

function DataMocker(props) {
  const { events } = props;
  const [url, setURL] = React.useState('');
  const [serverURL, setServerURL] = React.useState('')
  const [flag, setFlag] = React.useState(false)

  useEffect(() => {
    if (!flag) {
      setFlag(true)
      axios.post('https://iotbin.thethingslabs.com/bin')
        .then((res) => {
          console.log(`NICK's DATA: ${JSON.stringify(res.data)}`)
          const id = res.data['bin_id']
          setURL(`https://iotbin.thethingslabs.com/bin/${id}`)
        })
        .catch((err) => {
          setURL('')
          console.log(`iotbin error: ${err}`)
        })
    }
  })

  const onChange = (e) => {
    setURL(e.target.value);
  };
  const onClick = () => {
    console.log(url)
    setServerURL(url)
  }

  return (
    <>
      <div>
        <label>To receive mock data, type your server URL bellow</label>
        <div>
          <input type="text" placeholder="Enter Server URL" onChange={onChange} value={url || ''} />
          <button onClick={onClick}>Send data</button>
        </div>
      </div>
      <HTTPSender events={events} serverURL={serverURL} />
    </>
  )
}

export default DataMocker;
