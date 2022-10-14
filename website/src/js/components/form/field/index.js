import React from 'react'
import { useField, useFormikContext } from 'formik'
import classnames from 'classnames'

import PropTypes from 'prop-types'

import Icon from '../../icon'

import style from './field.styl'

const FormField = React.memo((props) => {
  const {
    className,
    label,
    description,
    instruction,
    invert,
    tight,
    noLabel,
    naked,
    onChange,
    component: Component,
    action: Action,
  } = props
  const [didFocus, setDidFocus] = React.useState(false)
  const { validateOnChange, setFieldValue } = useFormikContext()
  const [field, meta] = useField(props)

  const showError = Boolean(meta.touched && meta.error)

  function handleFocus() {
    setDidFocus(!!validateOnChange)
  }

  function extractValue(value) {
    let newValue = value
    if (typeof value === 'object' && 'target' in value) {
      const target = value.target
      if ('type' in target && target.type === 'checkbox') {
        newValue = target.checked
      } else if ('value' in target) {
        newValue = target.value
      }
    }

    return newValue
  }

  async function handleChange(value) {
    const newValue = extractValue(value)

    if (typeof value !== 'undefined' && typeof value.persist === 'function') {
      value.persist()
    }

    await setFieldValue(field.name, newValue)

    onChange(newValue)
  }

  const cls = classnames(className, style.container, {
    [style.invert]: invert,
    [style.tight]: tight,
  })

  function Label() {
    const cls = classnames(style.label, {
      [style.naked]: naked,
    })

    return (
      <>
        <label className="ttui-field__label" htmlFor={field.name}>
          {!noLabel && <span>{label}</span>}
        </label>
        <div className={style.action}>
          <Action />
        </div>
      </>
    )
  }

  return (
    <div className="ttui-field" data-needs-focus={showError}>
      <Label />
      {description && <p className="ttui-field__text">{description}</p>}
      {instruction && <p className={style.instruction}>{instruction}</p>}
      <Component
        onFocus={handleFocus}
        {...field}
        {...props}
        error={!!didFocus || meta.touched ? meta.error : null}
        setFieldValue={setFieldValue}
        onChange={handleChange}
      />
      {!!didFocus || meta.touched ? <Err error={meta.error} /> : null}
    </div>
  )
})

FormField.propTypes = {
  action: PropTypes.elementType,
  className: PropTypes.string,
  component: PropTypes.elementType.isRequired,
  description: PropTypes.string,
  instruction: PropTypes.string,
  invert: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  naked: PropTypes.bool,
  name: PropTypes.string.isRequired,
  noLabel: PropTypes.bool,
  onChange: PropTypes.func,
  tight: PropTypes.bool,
}

FormField.defaultProps = {
  action: () => <></>,
  className: undefined,
  description: '',
  instruction: '',
  label: '',
  naked: false,
  noLabel: false,
  tight: false,
  invert: false,
  onChange: () => {},
}

function Err(props) {
  const { error } = props
  return <span className="ttui-field__error">{error}</span>
}

Err.propTypes = {
  error: PropTypes.string,
}

Err.defaultProps = {
  error: undefined,
}

export default FormField
