import React from 'react'

/**
 * React hook that combines multiple references from `refs` into a single reference.
 * This hook can be helpful to combine ref from react's `forwardRef` with a local ref.
 *
 * @param  {Array<object>} refs - The list of refs to be combined.
 * @returns {object} - A single ref combined from `refs`.
 */
const useCombinedRefs = (...refs) => {
  const targetRef = React.useRef()

  React.useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return

      if (typeof ref === 'function') {
        ref(targetRef.current)
      } else {
        ref.current = targetRef.current
      }
    })
  }, [refs])

  return targetRef
}

export default useCombinedRefs
