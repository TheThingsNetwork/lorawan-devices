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
import classnames from 'classnames'
import PropTypes from 'prop-types'
import style from './safe-inspector.styl'

function chunkArray(array, chunkSize) {
  return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
    array.slice(index * chunkSize, (index + 1) * chunkSize),
  )
}

function selectText(node) {
  if (document.body.createTextRange) {
    const range = document.body.createTextRange()
    range.moveToElementText(node)
    range.select()
  } else if (window.getSelection) {
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(node)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

const SafeInspector = (props) => {
  const displayElem = React.useRef()

  const handleDataClick = (e) => {
    selectText(displayElem.current)
    e.stopPropagation()
  }

  const { className, data, isBytes, small } = props

  let formattedData = isBytes ? data.toUpperCase() : data
  let display = formattedData

  if (isBytes) {
    const chunks = chunkArray(data.toUpperCase().split(''), 2)
    display = chunks.map((chunk, index) => <span key={`${data}_chunk_${index}`}>{chunk}</span>)
  }

  const containerStyle = classnames(className, style.container, {
    [style.containerSmall]: small,
  })

  return (
    <div className={containerStyle}>
      <div ref={displayElem} onClick={handleDataClick} className={style.data}>
        {display}
      </div>
    </div>
  )
}

SafeInspector.propTypes = {
  /** The classname to be applied. */
  className: PropTypes.string,
  /** The data to be displayed. */
  data: PropTypes.string.isRequired,
  /** Whether the data is in byte format. */
  isBytes: PropTypes.bool,
  /**
   * Whether a smaller style should be rendered (useful for display in
   * tables).
   */
  small: PropTypes.bool,
}

SafeInspector.defaultProps = {
  className: undefined,
  isBytes: true,
  small: false,
}

export default SafeInspector
