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

import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import hamburgerMenuClose from '@wof-assets/images/hamburger-menu-close.svg'
import Button from '../button'
import EventsList from './list'
import EventDetails from './details'

import { getEventId } from './utils'

import style from './events.styl'

const Events = React.memo(({ events, scoped, paused, onClear, onPauseToggle }) => {
  const [focus, setFocus] = useState({ eventId: undefined, visible: false })
  const onPause = useCallback(() => onPauseToggle(paused), [onPauseToggle, paused])
  const handleRowClick = useCallback(
    (eventId) => {
      if (eventId !== focus.eventId) {
        setFocus({ eventId, visible: eventId })
      } else {
        setFocus({ eventId: undefined, visible: false })
      }
    },
    [focus],
  )
  const handleEventInfoCloseClick = useCallback(() => {
    setFocus({ eventId: undefined, visible: false })
  }, [])

  return (
    <div className={style.container}>
      <section className={style.header}>
        <div className={style.headerCells}>
          <div className={style.cellTime}>Time</div>
          <div className={style.cellType}>Type</div>
          <div className={style.cellData}>Data preview</div>
          <div className={style.stickyContainer}>
            <div className={style.actions}>
              <Button
                onClick={onPause}
                text={paused ? 'Resume' : 'Pause'}
                naked
                secondary={!paused}
                warning={paused}
                icon={paused ? 'play_arrow' : 'pause'}
              />
              <Button onClick={onClear} text={'Clear'} naked secondary icon="delete" />
            </div>
          </div>
        </div>
      </section>
      <section className={style.body}>
        <EventsList
          events={events}
          paused={paused}
          scoped={scoped}
          onRowClick={handleRowClick}
          activeId={focus.eventId}
        />
      </section>
      <section className={classnames(style.sidebarContainer, { [style.expanded]: focus.visible })}>
        <div className={style.sidebarHeader}>
          <span className={style.sidebarTitle}>Event details</span>
          <button
            className={style.sidebarCloseButton}
            onClick={handleEventInfoCloseClick}
            tabIndex={focus.visible ? '0' : '-1'}
          >
            <img src={hamburgerMenuClose} alt="Close event info" />
          </button>
        </div>
        <div className={style.sidebarContent}>
          {Boolean(focus.eventId) && (
            <EventDetails event={events.find((event) => getEventId(event) === focus.eventId)} />
          )}
        </div>
      </section>
    </div>
  )
})

Events.propTypes = {
  events: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onClear: PropTypes.func,
  onPauseToggle: PropTypes.func,
  paused: PropTypes.bool.isRequired,
  scoped: PropTypes.bool,
}

Events.defaultProps = {
  scoped: false,
  onClear: () => null,
  onPauseToggle: () => null,
}

export default Events
