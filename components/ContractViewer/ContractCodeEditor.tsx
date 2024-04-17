import { useState, useEffect } from 'react'

import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'

const ContractCodeEditor = ({ code, line, column, ...props }: any) => {
  const [codeEditor, setCodeEditor] = useState<any>(null)
  const { resolvedTheme } = useTheme()

  const handleEditorDidMount = (editor: any) => {
    if (!editor) {
      return
    }

    setCodeEditor(editor)

    editor.updateOptions({
      glyphMargin: false,
      folding: true,
      readOnly: true,
    })
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
        theme={resolvedTheme == 'dark' ? 'vs-dark' : 'vs-light'}
        onMount={handleEditorDidMount}
        value={code}
        {...props}
      />
    </div>
  )
}

export default ContractCodeEditor
