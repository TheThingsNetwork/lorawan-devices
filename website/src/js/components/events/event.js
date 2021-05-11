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

import React, { useMemo, useCallback } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import { getPreviewComponent, getEventIconByName } from './utils'

import Icon from '../icon'

import style from './events.styl'

const formatTime = (isoString) => {
  const time = new Date(isoString)
  return `${('0' + time.getHours()).slice(-2)}:${('0' + time.getMinutes()).slice(-2)}:${(
    '0' + time.getSeconds()
  ).slice(-2)}`
}

const Event = React.memo(({ event, rowStyle, onRowClick, eventId, active }) => {
  const icon = useMemo(() => getEventIconByName(event.name), [event.name])
  const typeValue = 'Forward uplink data message'
  const PreviewComponent = useMemo(() => {
    return getPreviewComponent(event)
  }, [event])

  const handleRowClick = useCallback(() => {
    onRowClick(eventId)
  }, [eventId, onRowClick])
  const eventClasses = classnames(style.event, {
    [style.active]: active,
    [style.synthetic]: event.isSynthetic,
  })

  return (
    <li className={eventClasses} style={rowStyle} onClick={handleRowClick}>
      <div className={style.cellTime} title={`${event.time}: ${typeValue}`}>
        <div>
          <span>{formatTime(event.time)}</span>
        </div>
      </div>
      <div className={style.cellType} title={typeValue}>
        <span>{typeValue}</span>
      </div>
      <div className={style.cellPreview}>
        <PreviewComponent event={event} />
      </div>
    </li>
  )
})

Event.propTypes = {
  active: PropTypes.bool,
  event: PropTypes.shape({}).isRequired,
  eventId: PropTypes.string.isRequired,
  onRowClick: PropTypes.func,
  rowStyle: PropTypes.shape({}),
}

Event.defaultProps = {
  active: false,
  onRowClick: () => null,
  rowStyle: undefined,
}

export default Event
