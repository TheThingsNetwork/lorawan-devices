import React from 'react'
import { Formik, yupToFormErrors, useFormikContext, validateYupSchema } from 'formik'
import classnames from 'classnames'
import scrollIntoView from 'scroll-into-view-if-needed'

import PropTypes from 'prop-types'

import FormField from './field'
import FormSubmit from './submit'

import style from './form.styl'
import usePrevious from '@wof-webui/lib/hooks/use-previous'

const InnerForm = React.memo((props) => {
  const { className, children, formError, formInfo, handleSubmit, isSubmitting } = props
  const notificationRef = React.createRef()

  const prevFormError = usePrevious(formError)

  const showNotifications = React.useCallback(async () => {
    scrollIntoView(notificationRef.current, { behavior: 'smooth' })
  }, [notificationRef])

  const showFirstError = () => {
    const firstErrorNode = document.querySelectorAll('[data-needs-focus="true"]')[0]
    if (firstErrorNode) {
      scrollIntoView(firstErrorNode, { behavior: 'smooth' })
      firstErrorNode.querySelector('input,textarea').focus({ preventScroll: true })
    }
  }

  React.useEffect(() => {
    if (prevFormError !== formError) {
      if (notificationRef.current) showNotifications()
    }
    if (isSubmitting) showFirstError()
  }, [formError, isSubmitting, notificationRef, prevFormError, showNotifications])

  return (
    <form className={classnames(style.container, className)} onSubmit={handleSubmit}>
      {(formError || formInfo) && (
        <div style={{ outline: 'none' }} ref={notificationRef} tabIndex="-1">
          {formError && <p className={style.error}>{formError}</p>}
          {formInfo && <p className={style.info}>{formInfo}</p>}
        </div>
      )}
      {children}
    </form>
  )
})

InnerForm.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  formError: PropTypes.string,
  formInfo: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
}

InnerForm.defaultProps = {
  className: undefined,
  formError: '',
  formInfo: '',
  isSubmitting: false,
}

const formRenderer = ({ children, ...rest }) =>
  function (renderProps) {
    const { className, error, info, disabled } = rest
    const { handleSubmit, ...restFormikProps } = renderProps

    return (
      <InnerForm
        className={className}
        formError={error}
        formInfo={info}
        handleSubmit={handleSubmit}
        disabled={disabled}
        {...restFormikProps}
      >
        {children}
      </InnerForm>
    )
  }

const Form = React.memo((props) => {
  const {
    onSubmit,
    onReset,
    initialValues,
    validateOnBlur,
    validateOnChange,
    validationSchema,
    validationContext,
    validateOnMount,
    formikRef,
    enableReinitialize,
    ...rest
  } = props

  function validate(values) {
    const { validationSchema, validationContext, validateSync } = props

    if (!validationSchema) {
      return {}
    }

    if (validateSync) {
      try {
        validateYupSchema(values, validationSchema, validateSync, validationContext)

        return {}
      } catch (error) {
        if (error.name === 'ValidationError') {
          return yupToFormErrors(error)
        }

        throw error
      }
    }

    return new Promise((resolve, reject) => {
      validateYupSchema(values, validationSchema, validateSync, validationContext).then(
        () => {
          resolve({})
        },
        (error) => {
          // Resolve yup errors, see https://jaredpalmer.com/formik/docs/migrating-v2#validate.
          if (error.name === 'ValidationError') {
            resolve(yupToFormErrors(error))
          } else {
            // Throw any other errors as it is not related to the validation process.
            reject(error)
          }
        },
      )
    })
  }

  return (
    <Formik
      innerRef={formikRef}
      validate={validate}
      onSubmit={onSubmit}
      onReset={onReset}
      validateOnMount={validateOnMount}
      initialValues={initialValues}
      validateOnBlur={validateOnBlur}
      validateOnChange={validateOnChange}
      enableReinitialize={enableReinitialize}
    >
      {formRenderer(rest)}
    </Formik>
  )
})

Form.Field = FormField
Form.Submit = FormSubmit

export { Form as default, useFormikContext as useFormContext }

Form.propTypes = {
  enableReinitialize: PropTypes.bool,
  formikRef: PropTypes.shape({ current: PropTypes.any }),
  initialValues: PropTypes.shape({}),
  onReset: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  validateOnMount: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  validateOnChange: PropTypes.bool,
  validationSchema: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.func]),
  validationContext: PropTypes.shape({}),
  validateSync: PropTypes.bool,
}

Form.defaultProps = {
  enableReinitialize: false,
  formikRef: undefined,
  initialValues: undefined,
  onReset: () => null,
  validateOnBlur: true,
  validateOnMount: false,
  validateOnChange: false,
  validationSchema: undefined,
  validationContext: {},
  validateSync: true,
}
