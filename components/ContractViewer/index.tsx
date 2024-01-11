import React, { useState, useRef, useEffect, useCallback } from 'react'

import { /*bufferToHex, Address,*/ isValidAddress } from '@ethereumjs/util'
import Editor from '@monaco-editor/react'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import NoSSR from 'react-no-ssr'

import { state } from './ContractState'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import ContractTreeView from './ContractTreeView'

// function astToTreeView(
//   astParser: SolidityParser,
//   ast,
//   etherscanInfo: EtherscanContractResponse,
//   address: string,
//   context?: string
// ): ContractDeployment {
//   // TODO: move from index.tsx
// }

const ContractViewer = () => {
  const [forceRender, setForceRender] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const rerender = () => setForceRender(forceRender + 1)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useEffect(() => {}, [forceRender])

  // =========

  const router = useRouter()

  const { theme } = useTheme()

  const editorRef = useRef(null)
  const solcWorkerRef = useRef<null | Worker>(null)
  // const [astParser, setAstParser] = useState<any>(null)

  const [currentAddress, setCurrentAddress] = useState<string>('')
  // const [currentCode, setCurrentCode] = useState<string>('')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleEditorDidMount(editor, monaco) {
    if (!editor) {
      return
    }

    editorRef.current = editor

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
  }

  // const onCompilationResult = (event: MessageEvent) => {
  //   // console.log('onCompilationResult', event.data)
  //   state.compilationResult.value = event.data
  // }

  // load compiler worker
  // useEffect(() => {
  //   // console.info('starting solc worker')
  //   solcWorkerRef.current = new Worker('/solcWorker.js')
  //   solcWorkerRef.current.addEventListener('message', onCompilationResult)

  //   return function unmount() {
  //     if (solcWorkerRef?.current) {
  //       solcWorkerRef?.current.terminate()
  //     }
  //   }
  // }, [solcWorkerRef])

  // TODO: separate to compilation component??
  // const startCompilation = useCallback(
  //   (info: EtherscanContractResponse | null) => {
  //     if (!info)
  //       return

  //     let info_with_settings = { ...info }
  //     if (!info_with_settings.SourceCode.settings)
  //       info_with_settings.SourceCode.settings = {}

  //     // request ast output from compilation
  //     info_with_settings.SourceCode.settings.outputSelection = {'*': {'': ['ast']}}

  //     // console.log(info_with_settings)
  //     solcWorkerRef.current?.postMessage({ version: info_with_settings.CompilerVersion, stdJson: info_with_settings.SourceCode })
  //   }, [solcWorkerRef])

  const tryLoadAddress = useCallback(
    (address: string) => {
      //batch(() => {
      address = (address || '').toLowerCase()
      // state.address.value = address
      if (!isValidAddress(address)) {
        return
      }

      setCurrentAddress(address)
      router.push({ query: { address } })
      state.loadContract(address).then(() => {
        // setCode(state.selectedContract().code)
        editorRef.current.setValue(state.selectedContract().code)
      })
      //}) // /batch
    },
    [router],
  )

  // load contract from url once everything is ready
  useEffect(() => {
    const address = router.query.address as string
    // instead of setting value attribute directly, otherwise it won't be editable
    // TODO: fix this hack
    // if (window['txt_address']) {
    //   window['txt_address'].value = address
    // }

    tryLoadAddress(address)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solcWorkerRef, editorRef])

  return (
    <NoSSR>
      <input
        id="txt_address"
        type="text"
        placeholder="Address..."
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
        onChange={(e) => tryLoadAddress(e.target.value)}
      />

      <ResizablePanelGroup
        direction="horizontal"
        className="w-full"
        style={{ height: '800px' }}
      >
        <ResizablePanel defaultSize={60}>
          <div className="h-full">
            <Editor
              defaultLanguage="sol"
              theme={theme == 'dark' ? 'vs-dark' : 'vs-light'}
              // value={state.code.value}
              onMount={handleEditorDidMount}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={80} style={{ overflow: 'auto' }}>
              {isValidAddress(state.selectedAddress) && (
                <ContractTreeView
                  // name={state.etherscanInfo.value.ContractName}
                  // rootLabel={<div><p>🗂️ {state.etherscanInfo.value.ContractName}</p><span className="text-xs">{state.address.value}</span></div>}
                  forest={Object.values(state.contracts).map((c) => c.defTree)}
                  onSelect={(item, root) => {
                    if (!item || !item.node || !item.node.loc) {
                      return
                    }

                    const { loc } = item.node
                    const addr = root.node.codeAddress
                    if (addr != currentAddress) {
                      setCurrentAddress(currentAddress)
                      // state.address.value = addr
                      // state.code.value = root.node.code
                      // editorRef.current.setValue(state.selectedContract().code)

                      // rerender()
                    }

                    editorRef.current.setPosition({
                      lineNumber: loc.start.line,
                      column: loc.start.column,
                    })
                    // TODO: potentially select on double click?
                    // editorRef.current.setSelection({
                    //   startLineNumber: loc.start.line,
                    //   startColumn: loc.start.column,
                    //   endLineNumber: loc.end.line,
                    //   endColumn: loc.end.column + 2,
                    // })
                    editorRef.current.revealLineInCenter(loc.start.line)
                  }}
                  name=""
                />
              )}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20}>
              <div className="h-full py-2 px-4 border-t bg-gray-800 dark:bg-black-700 border-black-900/25 text-gray-400 dark:text-gray-600 text-xs">
                {/* <p>Compiler version: {state.etherscanInfo.value && state.etherscanInfo.value?.CompilerVersion}</p> */}
                <p>*Additional metadata info should go here*</p>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </NoSSR>
  )
}

export default ContractViewer
