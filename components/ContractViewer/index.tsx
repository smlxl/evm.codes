import React, { useState, useRef, useEffect, useCallback } from 'react'

import { /*bufferToHex, Address,*/ isValidAddress } from '@ethereumjs/util'
import Editor from '@monaco-editor/react'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import NoSSR from 'react-no-ssr'
import { SoliditySettings } from 'types/contract'

import { ContractInfo, state } from './ContractState'
import ContractTreeView from './ContractTreeView'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

const ContractViewer = () => {
  const router = useRouter()

  const { theme } = useTheme()

  const [status, setStatus] = useState('Loading...')
  const [codeEditor, setCodeEditor] = useState<any>(null)
  const solcWorkerRef = useRef<Worker>()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentAddress, setCurrentAddress] = useState<string>('')
  // const [currentCode, setCurrentCode] = useState<string>('')

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

  const onCompilationResult = (event: MessageEvent) => {
    // console.log('onCompilationResult', event.data)
    // state.compilationResult.value = event.data
    console.log(event.data)
  }

  // load compiler worker
  useEffect(() => {
    // console.info('starting solc worker')
    solcWorkerRef.current = new Worker('/solcWorker.js')
    solcWorkerRef.current.addEventListener('message', onCompilationResult)

    return function unmount() {
      if (solcWorkerRef?.current) {
        solcWorkerRef?.current.terminate()
      }
    }
  }, [solcWorkerRef])

  // TODO: separate to compilation component??
  const startCompilation = useCallback(
    (contract: ContractInfo) => {
      if (!contract.etherscanInfo) {
        return
      }

      const info_with_settings = { ...contract.etherscanInfo }
      if (!info_with_settings.SourceCode.settings) {
        info_with_settings.SourceCode.settings = {} as SoliditySettings
      }

      // request ast output from compilation
      info_with_settings.SourceCode.settings.outputSelection = {
        '*': { '': ['ast'], '*': ['abi'] },
      }

      if (!solcWorkerRef.current) {
        return
      }

      info_with_settings.SourceCode.sources = {
        'flat.sol': {
          content: contract.code,
        },
      }
      console.log(info_with_settings)

      solcWorkerRef.current?.postMessage({
        version: info_with_settings.CompilerVersion,
        stdJson: info_with_settings.SourceCode,
      })
    },
    [solcWorkerRef.current],
  )

  async function tryLoadContract(codeAddress: string, contextAddress: string) {
    setStatus('Loading...')
    return state.loadContract(codeAddress).then(() => {
      // TODO: make this independent of codeEditor
      if (codeEditor) {
        codeEditor.setValue(state.selectedContract().code)
        // scheduleCodeLensUpdate.current()
      }
      // setCode(state.selectedContract().code)

      const contract = state.contracts[codeAddress]
      startCompilation(contract)

      // TODO: recursively load proxy implementation if available
      // it's async so it won't block the rest of the code
      const impl = contract.etherscanInfo?.Implementation as string
      if (impl) {
        // console.warn('loading proxy implementation:', etherscanInfo.Implementation, 'for context:', contextAddress, 'from:', codeAddress)
        tryLoadContract(impl.toLowerCase(), contextAddress)
      } else {
        setStatus('') // '✌️ Loaded'
      }
    })
  }

  const tryLoadAddress = useCallback(
    (address: string) => {
      address = (address || '').toLowerCase()
      if (!isValidAddress(address)) {
        return
      }

      // TODO: move or remove
      setStatus('Loading...')

      setCurrentAddress(address)
      router.push({ query: { address } })

      tryLoadContract(address, address)
    },
    [router, codeEditor],
  )

  useEffect(() => {
    if (codeEditor && state.selectedContract()) {
      codeEditor.setValue(state.selectedContract().code)
      // scheduleCodeLensUpdate.current?.()
    }
  }, [codeEditor])

  // load contract from url once everything is ready
  useEffect(() => {
    const address = router.query.address as string
    // instead of setting value attribute directly, otherwise it won't be editable
    // TODO: fix this hack
    if (window['txt_address']) {
      window['txt_address'].value = address
    }

    tryLoadAddress(address)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, /*solcWorkerRef,*/ codeEditor])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state.onChange.push((/*codeAddress: string, info: ContractInfo*/) => {
      // setCurrentAddress(state.selectedAddress)
      setStatus('Reloading... (' + Date.now() + ')')
      // setTimeout(() => setStatus(''), 1000)
    })
  }, [])

  return (
    <NoSSR>
      <input
        id="txt_address"
        type="text"
        placeholder="Address..."
        className="bg-gray-50 border border-2 border-gray-300 text-gray-900 text-sm w-[374px] rounded-xl px-2"
        onChange={(e) => tryLoadAddress(e.target.value)}
      />
      <div className="inline-block mx-2">{status}</div>

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
                  forest={Object.values(state.contracts).map((c) => c.defTree)}
                  onSelect={(item, root) => {
                    if (!item || !item.node || !item.node.loc) {
                      return
                    }

                    const { loc } = item.node
                    const addr = root.node.info.codeAddress
                    // if (addr != currentAddress) {
                    setCurrentAddress(addr)
                    const code = state.contracts[addr].code
                    if (code && codeEditor) {
                      codeEditor.setValue(code)
                    }
                    // }

                    if (codeEditor) {
                      codeEditor.setPosition({
                        lineNumber: loc.start.line,
                        column: loc.start.column,
                      })
                      // TODO: potentially select on double click?
                      // codeEditor.setSelection({
                      //   startLineNumber: loc.start.line,
                      //   startColumn: loc.start.column,
                      //   endLineNumber: loc.end.line,
                      //   endColumn: loc.end.column + 2,
                      // })
                      codeEditor.revealLineInCenter(loc.start.line)
                    }
                  }}
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
