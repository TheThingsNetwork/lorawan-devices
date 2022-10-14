import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import style from './input.styl'
import Icon from '@wof-webui/components/icon'

const Input = React.memo((props) => {
  const {
    label,
    onFocus,
    onChange,
    onBlur,
    name,
    type,
    value,
    icon,
    error,
    showError,
    maxLength,
    placeholder,
    disabled,
  } = props

  const cls = classnames('ttui-field__input', {
    'ttui-field__input--error': Boolean(error && showError),
  })

  return (
    <div className={style.container}>
      <input
        type={type}
        placeholder={placeholder ? placeholder : label}
        className={cls}
        onFocus={onFocus}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
      />
      {icon && <Icon icon={icon} className={style.icon} />}
    </div>
  )
})

Input.propTypes = {
  disabled: PropTypes.bool,
  error: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  maxLength: PropTypes.number,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  showError: PropTypes.bool,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

Input.defaultProps = {
  disabled: false,
  error: '',
  label: '',
  maxLength: 524288,
  type: 'text',
  icon: undefined,
  showError: false,
  placeholder: '',
  value: undefined,
}

export default Input
