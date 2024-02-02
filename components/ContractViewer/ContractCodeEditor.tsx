import { useState, useEffect } from 'react'

import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'

const ContractCodeEditor = ({ code, line, column, ...props }: any) => {
  const [codeEditor, setCodeEditor] = useState<any>(null)
  const { theme } = useTheme()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleEditorDidMount(editor: any, _monaco: any) {
    if (!editor) {
      return
    }

    setCodeEditor(editor)

    editor.updateOptions({
      glyphMargin: false,
      folding: true,
      readOnly: true,
    })

    // fetch('/synthwave-color-theme.json')
    //   .then((res) => res.json())
    //   .then((res) => {
    //     _monaco.editor.defineTheme('synthwave', res)
    //     _monaco.editor.setTheme('synthwave')
    //   })
  }

  useEffect(() => {
    if (!codeEditor || !line || !column) {
      return
    }

    codeEditor.setPosition({
      lineNumber: line,
      column: column,
    })

    codeEditor.revealLineInCenter(line)
  }, [line, column, codeEditor])

  return (
    <div className="h-full">
      <Editor
        defaultLanguage="sol"
        theme={theme == 'dark' ? 'vs-dark' : 'vs-light'}
        onMount={handleEditorDidMount}
        value={code}
        {...props}
      />
    </div>
  )
}

export default ContractCodeEditor
