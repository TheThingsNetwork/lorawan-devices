import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import moment from 'moment'

import { NavLink, useRouteMatch } from 'react-router-dom'
import style from '../subscription-list.styl'

import Icon from '@wof-webui/components/icon'

function SubscriptionItem(props) {
  const { id, name, description, start_date, disabled } = props

  const { path } = useRouteMatch()

  const cls = classnames(style.item, {
    [style.disabled]: Boolean(disabled),
  })

  function renderItem() {
    return (
      <li className={cls}>
        <div>
          <h3 className={style.name}>
            {name.join(', ')}{' '}
            {start_date && (
              <span className={style.date}>Starts {moment.unix(start_date).format('Do MMM')}</span>
            )}
          </h3>
          <span className={style.details}>
            {description.length > 0 ? description.join(', ') : id}
          </span>
        </div>
        {!disabled && (
          <div className={style.arrow}>
            <Icon icon={'arrow_forward'} className={style.icon} />
          </div>
        )}
      </li>
    )
  }

  return disabled ? (
    <>{renderItem()}</>
  ) : (
    <>
      <NavLink to={`${path}/${id}`}>{renderItem()}</NavLink>
    </>
  )
}

SubscriptionItem.propTypes = {
  description: PropTypes.arrayOf(PropTypes.string),
  id: PropTypes.string,
  name: PropTypes.arrayOf(PropTypes.string),
}

SubscriptionItem.defaultProps = {
  description: [],
  id: '',
  name: 'name',
}

export default SubscriptionItem
