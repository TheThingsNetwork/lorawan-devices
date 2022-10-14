import React from 'react'

import PropTypes from 'prop-types'

import { useFormikContext } from 'formik'

const FormSubmit = React.memo((props) => {
  const { component: Component, ...rest } = props
  const context = useFormikContext()

  const submitProps = {
    isValid: context.isValid,
    isSubmitting: context.isSubmitting,
    isValidating: context.isValidating,
    submitCount: context.submitCount,
    dirty: context.dirty,
    validateForm: context.validateForm,
    validateField: context.validateField,
    disabled: context.disabled,
  }

  return <Component {...rest} {...submitProps} />
})

FormSubmit.propTypes = {
  component: PropTypes.elementType.isRequired,
}

FormSubmit.defaultProps = {}

export default FormSubmit
