import React from 'react'
import PropTypes from 'prop-types'

import style from './subscription-list.styl'

import SubscriptionItem from './item'

function SubscriptionList(props) {
  const { children } = props

  return (
    <>
      <section className={style.container}>
        <ul className={style.list}>{children}</ul>
      </section>
    </>
  )
}

SubscriptionList.Item = SubscriptionItem

SubscriptionList.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
}

SubscriptionList.defaultProps = {
  children: [<></>],
}

export default SubscriptionList
