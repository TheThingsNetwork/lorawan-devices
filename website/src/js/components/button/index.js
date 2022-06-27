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
import classnames from 'classnames'

import style from './button.styl'

function Button(props) {
  const {
    text,
    onClick,
    type,
    disabled,
    danger,
    naked,
    secondary,
    inline,
    invert,
    subtle,
    busy,
    bold,
    small,
    className,
  } = props

  const cls = classnames(style.button, className, {
    [style.naked]: Boolean(naked),
    [style.danger]: Boolean(danger),
    [style.secondary]: Boolean(secondary),
    [style.subtle]: Boolean(subtle),
    [style.inline]: Boolean(inline),
    [style.bold]: Boolean(bold),
    [style.small]: Boolean(small),
    [style.invert]: Boolean(invert),
  })

  function handleClick(e) {
    if (disabled) {
      return
    }

    onClick(e)
  }

  return (
    <button className={cls} onClick={handleClick} type={type} disabled={busy || disabled}>
      {text}
    </button>
  )
}

Button.propTypes = {
  bold: PropTypes.bool,
  busy: PropTypes.bool,
  className: PropTypes.string,
  danger: PropTypes.bool,
  disabled: PropTypes.bool,
  inline: PropTypes.bool,
  invert: PropTypes.bool,
  naked: PropTypes.bool,
  onClick: PropTypes.func,
  secondary: PropTypes.bool,
  small: PropTypes.bool,
  subtle: PropTypes.bool,
  text: PropTypes.string,
  type: PropTypes.string,
}

Button.defaultProps = {
  bold: false,
  busy: false,
  className: '',
  danger: false,
  disabled: false,
  inline: false,
  invert: false,
  naked: false,
  onClick: () => null,
  secondary: false,
  small: false,
  subtle: false,
  text: '',
  type: 'button',
}

export default Button
