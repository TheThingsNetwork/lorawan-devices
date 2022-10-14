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
import PropTypes from 'prop-types'
import Select from '../../components/select'
import Form from '../../components/form'
import Input from '@wof-webui/components/input'
import SubmitBar from '../../components/submit-bar'
import SubmitButton from '../../components/submit-button'

import { useFormikContext } from 'formik'

import { generateUplinkEvents } from '../../components/events/utils/generate-events'
import Events from '../../components/events'

import * as Yup from 'yup'
import axios from 'axios'

const Schema = Yup.object().shape({
  type: Yup.string().required('Required'),
  url: Yup.string().required('Required'),
})

function DeviceUplink(props) {
  const { truncated, brand_id, model_id, device } = props
  const [events, setEvents] = React.useState([])
  const [paused, setPaused] = React.useState(false)
  const [displayEvents, setDisplayEvents] = React.useState(false)
  const [payloadFormatter, setPayloadFormatter] = React.useState({})
  const [start, setStart] = React.useState(false)

  React.useEffect(() => {
    let firm
    let band
    device.firmwareversions.forEach((fw) => {
      for (const profile in fw.profiles) {
        if ('codec' in fw.profiles[profile]) {
          firm = fw.version
          band = profile
        }
      }
    })
    if (Boolean(firm) && Boolean(band)) {
      if (device.codecs[band.toLowerCase()]) {
        setPayloadFormatter(device.codecs[band.toLowerCase()].uplinkdecoder)
      }
    }
  }, [brand_id, model_id])

  React.useEffect(() => {
    if (Boolean(payloadFormatter) && 'examples' in payloadFormatter) {
      setDisplayEvents(true)
    }
  }, [payloadFormatter])
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!paused && events.length < 10 && displayEvents) {
        const generatedEvents = generateUplinkEvents(payloadFormatter)
        setEvents([...events, ...generatedEvents])
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [displayEvents, events, paused, payloadFormatter])
  const onPauseToggle = () => {
    setPaused(!paused)
  }
  const onClear = () => {
    setEvents([])
  }

  const handleSubmit = React.useCallback((values, { setSubmitting }) => {
    setSubmitting(false)
    setStart(true)
  }, [])

  return (
    displayEvents && (
      <>
        <Events
          events={events}
          paused={paused}
          onClear={onClear}
          onPauseToggle={onPauseToggle}
          truncated={truncated}
          scoped
          widget
        />
        <h1>Test an integration</h1>
        <Form
          initialValues={{ type: '', url: '' }}
          validationSchema={Schema}
          validateOnBlur
          validateOnMount
          onSubmit={handleSubmit}
        >
          <DeviceForm start={start} events={events} setStart={setStart} />
        </Form>
      </>
    )
  )
}

function DeviceForm(props) {
  const { start, events, setStart } = props
  const { values } = useFormikContext()

  const handleChange = React.useCallback(() => {
    setStart(false)
  }, [])

  return (
    <>
      <Form.Field
        label={'Connection Type'}
        name={'type'}
        options={[
          { value: 'post', label: 'Post Request' },
          { value: 'mqtt', label: 'MQTT' },
        ]}
        component={Select}
        onChange={handleChange}
        required
      />

      <Form.Field label={'URL'} name={'url'} component={Input} required />

      <SubmitBar center>
        <Form.Submit component={SubmitButton} text={'Start'} secondary invert />
      </SubmitBar>
      {start && (
        <>
          {values.type && values.type === 'mqtt' && <h1>mqtt</h1>}
          {values.type && values.type === 'post' && (
            <HTTPSender events={events} serverURL={values.url} />
          )}
        </>
      )}
    </>
  )
}

function HTTPSender(props) {
  const { events, serverURL } = props
  const [currLen, setCurrLen] = React.useState(-1)

  React.useEffect(() => {
    if (serverURL !== '') {
      // Doesn't send duplicates.
      if (events?.length !== undefined && events.length >= 0) {
        setCurrLen(events.length)
        axios
          .post(serverURL, { ...events[currLen === 0 ? 0 : currLen - 1] })
          .then(() => {
            console.log('Sent')
          })
          .catch((err) => {
            console.log(`Something went wrong! => ${err}`)
          })
      }
    }
  })

  return <></>
}

DeviceUplink.propTypes = {
  brand_id: PropTypes.string.isRequired,
  model_id: PropTypes.string.isRequired,
  truncated: PropTypes.bool,
}

DeviceUplink.defaultProps = {
  truncated: false,
}

export default DeviceUplink
