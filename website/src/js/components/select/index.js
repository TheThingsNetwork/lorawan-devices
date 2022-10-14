import React from 'react'
import ReactSelect, { components } from 'react-select'
import classnames from 'classnames'

import PropTypes from 'prop-types'

import Icon from '../icon'

import style from './select.styl'

const Select = React.memo((props) => {
  const {
    className,
    options,
    disabled,
    error,
    warning,
    name,
    value,
    setFieldValue,
    onChange,
    onBlur,
    isMulti,
    limit,
  } = props

  const cls = classnames(className, style.container, {
    [style.error]: error,
    [style.warning]: warning,
  })

  function handleChange(option) {
    const optionValue = isMulti
      ? option === null
        ? []
        : option.map((item) => item.value)
      : option.value
    setFieldValue(name, optionValue)
    onChange(optionValue)
  }

  const getValue = () => {
    if (options) {
      return isMulti
        ? options.filter((option) => (option === null ? [] : value.indexOf(option.value) >= 0))
        : options.find((option) => option.value === value)
    }
    return isMulti ? [] : ''
  }

  function noOptionsMessage() {
    return value.length === limit && isMulti
      ? "You've reached the max options value"
      : 'No options available'
  }

  const DropdownIndicator = (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <Icon icon={'arrow_drop_down'} large />
      </components.DropdownIndicator>
    )
  }

  return (
    <ReactSelect
      className={cls}
      classNamePrefix="select"
      value={getValue()}
      options={value.length === limit && isMulti ? [] : options}
      noOptionsMessage={noOptionsMessage}
      onChange={handleChange}
      onBlur={onBlur}
      isDisabled={disabled}
      name={name}
      components={{ DropdownIndicator }}
      isMulti={isMulti}
    />
  )
})

Select.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  isMulti: PropTypes.bool,
  limit: PropTypes.number,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ),

  setFieldValue: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  warning: PropTypes.bool,
}

Select.defaultProps = {
  className: undefined,
  onChange: () => {},
  options: [],
  disabled: false,
  error: false,
  warning: false,
  value: undefined,
  isMulti: false,
  limit: 100000,
}

// Export default injectIntl(Select)
export default Select
