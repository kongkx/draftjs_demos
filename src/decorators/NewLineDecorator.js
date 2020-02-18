import { List, Record } from 'immutable'
import React from 'react'

var KEY_SEPARATOR = '-'

const defaultRender = props => (
  <span className={`return`} data-line-num={props.num}>
    {props.children}
  </span>
)

const defaultFilter = block => block.getType() === 'code-block'

const PrismOptions = Record({
  render: defaultRender,
  filter: defaultFilter
})

function ReturnDecorator(options) {
  this.options = PrismOptions(options || {})
  this.linesCount = 0
}

/**
 * Return list of decoration IDs per character
 *
 * @param {ContentBlock}
 * @return {List<String>}
 */
ReturnDecorator.prototype.getDecorations = function(block) {
  var lineNum = 1
  var filter = this.options.get('filter')
  var blockKey = block.getKey()
  var blockText = block.getText()
  var decorations = Array(blockText.length).fill(null)

  if (!filter(block)) {
    return List(decorations)
  }

  for (let i = 0; i < blockText.length; i += 1) {
    if (blockText[i] === '\n') {
      decorations[i] = `${blockKey}${KEY_SEPARATOR}line${lineNum}`
      lineNum += 1
    }
  }

  return List(decorations)
}

/**
 * Return component to render a decoration
 *
 * @param {String}
 * @return {Function}
 */
ReturnDecorator.prototype.getComponentForKey = function(key) {
  return this.options.get('render')
}

/**
 * Return props to render a decoration
 *
 * @param {String}
 * @return {Object}
 */
ReturnDecorator.prototype.getPropsForKey = function(key) {
  var parts = key.split(KEY_SEPARATOR)
  //   var blockKey = parts[0]
  var lineInfo = parts[1]

  return {
    num: lineInfo.replace('line', ''),
    lineBreak: true
  }
}

export default ReturnDecorator
