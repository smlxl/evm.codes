import React, { useState, useEffect } from 'react'

import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'

// import { state } from './ContractState'

const ContractCodeEditor = ({ line, column, ...props }) => {
  const [codeEditor, setCodeEditor] = useState<any>(null)
  const { theme } = useTheme()

  // const scheduleCodeLensUpdate = useRef(null)

  // TODO: fix lenses or remove them
  // function provideCodeLenses(/*_model, _token*/) {
  //   let lenses: any[] = []
  //   const contract = state.selectedContract()
  //   if (contract) {
  //     lenses = contract.originalPathLenses.map((lens: any, i) => {
  //       return {
  //         range: {
  //           startLineNumber: lens.line,
  //           startColumn: 1,
  //           endLineNumber: lens.line + 1,
  //           endColumn: 1,
  //         },
  //         id: 'og_path_' + i,
  //         command: {
  //           id: null,
  //           title: lens.path,
  //         },
  //       }
  //     })
  //   }

  //   return {
  //     lenses,
  //   }
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleEditorDidMount(editor, monaco) {
    if (!editor) {
      return
    }

    setCodeEditor(editor)

    editor.updateOptions({ readOnly: true })
    // monaco.languages.registerHoverProvider('sol', {
    //   provideHover: function (model, position) {
    //     return {
    //       range: new monaco.Range(64, 21, 64, 27),
    //       contents: [
    //         { value: '# **LIVE VIEW**' },
    //         { value: '_admin: here we can show live view' },
    //       ]
    //     };
    //   }
    // });

    // monaco.languages.registerInlayHintsProvider("sol", {
    //   provideInlayHints(model, range, token) {
    //     return {
    //       hints: [
    //         {
    //           kind: monaco.languages.InlayHintKind.Type,
    //           position: { column: 99, lineNumber: 15 },
    //           label: ` 0xa13BAF47339d63B743e7Da8741db5456DAc1E556`,
    //         },
    //         {
    //           kind: monaco.languages.InlayHintKind.Type,
    //           position: { column: 99, lineNumber: 17 },
    //           label: ` 0x2e07f0fba71709bb5e1f045b02152e45b451d75f`,
    //         },
    //         // {
    //         //   kind: monaco.languages.InlayHintKind.Type,
    //         //   position: { column: 99, lineNumber: 19 },
    //         //   label: ` <LIVE VIEW VALUE>`,
    //         //   whitespaceBefore: true, // see difference between a and b parameter
    //         // },
    //         // {
    //         //   kind: monaco.languages.InlayHintKind.Parameter,
    //         //   position: { column: 99, lineNumber: 21 },
    //         //   label: ` <LIVE VIEW VALUE>`,
    //         // },
    //         // {
    //         //   kind: monaco.languages.InlayHintKind.Parameter,
    //         //   position: { column: 99, lineNumber: 23 },
    //         //   label: ` <LIVE VIEW VALUE>`,
    //         //   whitespaceAfter: true, // similar to whitespaceBefore
    //         // },
    //       ],
    //       dispose: () => {},
    //     };
    //   },
    // });

    // monaco.languages.registerCodeLensProvider('sol', {
    //   onDidChange: (cb) => {
    //     scheduleCodeLensUpdate.current = cb
    //   },
    //   provideCodeLenses
    // })
  }

  useEffect(() => {
    if (!codeEditor) {
      return
    }

    if (codeEditor) {
      codeEditor.setPosition({
        lineNumber: line,
        column: column,
      })
      // TODO: potentially select on double click?
      // codeEditor.setSelection({
      //   startLineNumber: loc.start.line,
      //   startColumn: loc.start.column,
      //   endLineNumber: loc.end.line,
      //   endColumn: loc.end.column + 2,
      // })
      codeEditor.revealLineInCenter(line)
    }
  }, [line, column])

  return (
    <div className="h-full">
      <Editor
        defaultLanguage="sol"
        theme={theme == 'dark' ? 'vs-dark' : 'vs-light'}
        onMount={handleEditorDidMount}
        {...props}
      />
    </div>
  )
}

export default ContractCodeEditor
