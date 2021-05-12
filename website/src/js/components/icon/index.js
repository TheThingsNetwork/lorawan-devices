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

import style from './icon.styl'

// A map of hardcoded names to their corresponding icons.
// Keep these sorted alphabetically.
const hardcoded = {
  arrow_drop_down: 'arrow_drop_down',
  cancel: 'cancel',
  check_circle: 'check_circle',
  lock: 'lock',
  help: 'help',
}

function Icon({ icon, className, nudgeUp, nudgeDown, small, large, ...rest }) {
  const cls = classnames(style.icon, className, {
    [style.nudgeUp]: nudgeUp,
    [style.nudgeDown]: nudgeDown,
    [style.large]: large,
    [style.small]: small,
  })

  return (
    <span className={cls} {...rest}>
      {hardcoded[icon] || icon}
    </span>
  )
}

Icon.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  large: PropTypes.bool,
  nudgeDown: PropTypes.bool,
  nudgeUp: PropTypes.bool,
  small: PropTypes.bool,
}

Icon.defaultProps = {
  className: '',
  large: false,
  nudgeDown: false,
  nudgeUp: false,
  small: false,
}

export default Icon
