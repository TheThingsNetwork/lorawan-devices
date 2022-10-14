import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import style from './submit-bar.styl'

function SubmitBar(props) {
  const { children, center, end, between } = props

  const cls = classnames(style.container, {
    [style.center]: Boolean(center),
    [style.end]: Boolean(end),
    [style.between]: Boolean(between),
  })

  return <section className={cls}>{children}</section>
}

SubmitBar.propTypes = {
  between: PropTypes.bool,
  center: PropTypes.bool,
  children: PropTypes.node,
  end: PropTypes.bool,
}

SubmitBar.defaultProps = {
  between: false,
  center: false,
  children: <></>,
  end: false,
}

export default SubmitBar
