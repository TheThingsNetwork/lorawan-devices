import React from 'react'

/**
 * React hook returns previous stored prop value.
 *
 * @param value
 * @param prop
 * @returns {object}
 */
const usePrevious = (prop) => {
  const ref = React.useRef()
  React.useEffect(() => {
    ref.current = prop
  })
  return ref.current
}

export default usePrevious
