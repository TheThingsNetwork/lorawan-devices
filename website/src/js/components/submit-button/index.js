import React from 'react'

import PropTypes from 'prop-types'

import Button from '../button'

const SubmitButton = React.memo((props) => {
  const { disabled, isSubmitting, isValidating, ...rest } = props

  const buttonLoading = isSubmitting || isValidating

  return <Button {...rest} type="submit" disabled={disabled} busy={buttonLoading} />
})

SubmitButton.propTypes = {
  disabled: PropTypes.bool,
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
}

SubmitButton.defaultProps = {
  disabled: false,
}

export default SubmitButton
