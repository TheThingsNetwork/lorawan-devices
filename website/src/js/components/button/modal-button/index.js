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

import PortalledModal from '../../modal/portalled'
import Button from '..'

const ModalButton = function (props) {
  const [modalVisible, setModalVisible] = React.useState(false)
  const {
    modalData,
    onApprove,
    text,
    cancelButtonMessage,
    approveButtonMessage,
    helpMessage,
    ...rest
  } = props

  function handleClick() {
    setModalVisible(true)
  }

  function handleComplete(confirmed) {
    if (confirmed) {
      onApprove()
    }
    setModalVisible(false)
  }

  const modalComposedData = {
    approval: true,
    danger: true,
    buttonMessage: text,
    title: text,
    onComplete: handleComplete,
    cancelButtonMessage,
    approveButtonMessage,
    helpMessage,
    ...modalData,
  }

  return (
    <React.Fragment>
      <PortalledModal visible={modalVisible} modal={modalComposedData} />
      <Button onClick={handleClick} text={text} {...rest} />
    </React.Fragment>
  )
}

ModalButton.propTypes = {
  approveButtonMessage: PropTypes.string,
  cancelButtonMessage: PropTypes.string,
  helpMessage: PropTypes.string,
  modalData: PropTypes.shape(),
  onApprove: PropTypes.func,
  text: PropTypes.string,
}

ModalButton.defaultProps = {
  approveButtonMessage: 'Approve',
  cancelButtonMessage: 'Cancel',
  helpMessage: '',
  modalData: {},
  onApprove: () => {},
  text: '',
}

export default ModalButton
