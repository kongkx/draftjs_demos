import React, { useState } from 'react'
import {
  Editor,
  EditorState,
  Modifier,
  convertFromRaw,
  SelectionState,
  DefaultDraftBlockRenderMap
} from 'draft-js'
import data from './data'
import CodeBlock from './CodeBlock'
import PrismDecorator from './decorators/PrismDecorator'
import MultiDecorator from './decorators/MultiDecorator'
import NewLineDecorator from './decorators/NewLineDecorator'

import 'draft-js/dist/Draft.css'
import 'prismjs/themes/prism.css'
import './App.css'

function myBlockRenderer(contentBlock) {
  const type = contentBlock.getType()
  if (type === 'code-block') {
    return {
      component: CodeBlock,
      editable: true
    }
  }
}

console.log(DefaultDraftBlockRenderMap.toJS())

export default function App() {
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(
      convertFromRaw(data),
      new MultiDecorator([
        new PrismDecorator({
          defaultSyntax: 'javascript'
        }),
        new NewLineDecorator()
      ])
    )
  )

  return (
    <div className="App">
      <Editor
        placeholder="Demo"
        editorState={editorState}
        onChange={setEditorState}
        blockRendererFn={myBlockRenderer}
        handleKeyCommand={(...args) => {
          console.log('keyCommand', args)
        }}
        handleReturn={(event, state) => {
          console.log(event, state)
          const contentState = state.getCurrentContent()
          const selection = state.getSelection()
          const currentBlock = contentState.getBlockForKey(
            selection.getStartKey()
          )
          if (
            selection.isCollapsed() &&
            currentBlock.getType() === 'code-block'
          ) {
            if (event.metaKey) {
              const nextContentBlock = contentState.getBlockAfter(
                selection.getStartKey()
              )
              if (nextContentBlock) {
                const newEditorState = EditorState.forceSelection(
                  editorState,
                  new SelectionState().merge({
                    anchorKey: nextContentBlock.getKey(),
                    focusKey: nextContentBlock.getKey()
                  })
                )
                setEditorState(newEditorState)
              } else {
                // insert new block;
                let newContentState = Modifier.splitBlock(
                  contentState,
                  selection.merge({
                    anchorOffset: currentBlock.getLength()
                  })
                )
                newContentState = Modifier.setBlockType(
                  newContentState,
                  newContentState.getSelectionAfter(),
                  'unstyled'
                )
                const newEditorState = EditorState.push(
                  editorState,
                  newContentState,
                  'split-block'
                )
                setEditorState(newEditorState)
              }
            } else {
              let newContentState = Modifier.insertText(
                contentState,
                selection,
                '\n'
              )
              const newEditorState = EditorState.push(
                editorState,
                newContentState,
                'insert-characters'
              )
              setEditorState(newEditorState)
            }
            return 'handled'
          }
        }}
      />
      <div>
        <h3>Orders: </h3>
        <code>handleReturn</code> > <code>handleKeyCommand</code>
      </div>
    </div>
  )
}
