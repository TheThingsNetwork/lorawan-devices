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
import ReactAce from 'react-ace'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import 'brace/mode/json'
import './ttn-theme'

import style from './code-editor.styl'

const CodeEditor = (props) => {
  const [focus, setFocus] = React.useState(false)
  const aceRef = React.useRef()
  const {
    className,
    language,
    name,
    onChange,
    value,
    placeholder,
    readOnly,
    editorOptions,
    height,
    showGutter,
    minLines,
    maxLines,
    commands,
  } = props

  const empty = !value || value === ''
  const currentValue = empty && !focus ? placeholder : value

  const editorCls = classnames(className, style.wrapper, {
    [style.focus]: focus,
    [style.readOnly]: readOnly,
  })

  const options = {
    tabSize: 2,
    useSoftTabs: true,
    fontFamily: '"IBM Plex Mono", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '13px',
    highlightSelectedWord: true,
    displayIndentGuides: true,
    showFoldWidgets: false,
    behavioursEnabled: !(readOnly || empty),
    ...editorOptions,
  }

  return (
    <div className={editorCls}>
      <ReactAce
        // Rendered options.
        theme="ttn"
        minLines={minLines}
        maxLines={maxLines}
        // Session options.
        mode={language}
        // Editor options.
        readOnly={readOnly}
        highlightActiveLine
        showGutter={showGutter}
        // Other props.
        name={name}
        onChange={onChange}
        value={currentValue}
        defaultValue={placeholder}
        setOptions={options}
        width="100%"
        height={height}
        editorProps={{ $blockScrolling: Infinity }}
        commands={commands}
        ref={aceRef}
      />
    </div>
  )
}

CodeEditor.propTypes = {
  className: PropTypes.string,
  /** New commands to add to the editor, see official docs. */
  commands: PropTypes.arrayOf(PropTypes.shape({})),
  /** See `https://github.com/ajaxorg/ace/wiki/Configuring-Ace`. */
  editorOptions: PropTypes.shape({}),
  /** The height of the editor. */
  height: PropTypes.string,
  /** The language to highlight. */
  language: PropTypes.oneOf(['javascript', 'json']),
  /** Maximum lines of code allowed. */
  maxLines: PropTypes.number,
  /** Minimum lines of code allowed. */
  minLines: PropTypes.number,
  /** The name of the editor (should be unique). */
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  /** The default value of the editor. */
  placeholder: PropTypes.string,
  /** A flag identifying whether the editor is editable. */
  readOnly: PropTypes.bool,
  /** A flag indicating whether the editor should scroll to the bottom when
   * the value has been updated, useful for logging use cases.
   */
  scrollToBottom: PropTypes.bool,
  showGutter: PropTypes.bool,
  /** The current value of the editor. */
  value: PropTypes.string,
}

CodeEditor.defaultProps = {
  className: undefined,
  commands: undefined,
  editorOptions: undefined,
  height: '30rem',
  language: 'javascript',
  maxLines: Infinity,
  minLines: 1,
  onBlur: undefined,
  onChange: undefined,
  onFocus: undefined,
  placeholder: '',
  readOnly: false,
  scrollToBottom: false,
  showGutter: true,
  value: '',
}

export default CodeEditor
