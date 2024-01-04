import React, {
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react'

import { bufferToHex, Address, isValidAddress } from '@ethereumjs/util'
import { useRouter } from 'next/router'

import NoSSR from "react-no-ssr"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { etherscanParse, EtherscanContractResponse } from 'util/EtherscanParser'
import Editor from '@monaco-editor/react';

import { findContract, flattenCode } from 'util/flatten'
import { signal, batch } from '@preact/signals-react'

import AstTreeView from './AstTreeView'
import { useTheme } from 'next-themes'

// TODO: not all of this needs to be signals...?
const state = {
  address: signal<string>(''),
  code: signal<string>('/*\nenter an address to load source code\n*/'),
  contractInfo: signal<EtherscanContractResponse | null>(null),
  compilationResult: signal(null),
  ast: null,
  defTree: signal({})
}

const ContractViewer = () => {
  const router = useRouter()

  const editorRef = useRef(null);
  const solcWorkerRef = useRef<null | Worker>(null)
  const [astParser, setAstParser] = useState<any>(null)

  function handleEditorDidMount(editor, monaco) {
    if (!editor)
      return

    editorRef.current = editor;
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

  // load ast parser from iife script because module isn't working...
  useEffect(() => {
    if (astParser) {
      // console.info('solidity parser already loaded')
      return
    }

    const script = document.createElement('script');
    // TODO: replace cdn with own server?
    script.src = "https://cdn.jsdelivr.net/npm/@solidity-parser/parser@0.17.0/dist/index.iife.js";
    script.async = true;

    script.onload = () => {
      // console.log('solidity parser loaded:', window.SolidityParser.parse)
      setAstParser(window.SolidityParser)
    }

    document.body.appendChild(script);
  }, []);

  const onCompilationResult = (event: MessageEvent) => {
      // console.log('onCompilationResult', event.data)
      state.compilationResult.value = event.data
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

  // load contract from url once everything is ready
  useEffect(() => {
    const address = router.query.address as string
    tryLoadAddress(address)
  }, [router.isReady, solcWorkerRef, editorRef, astParser])

  // TODO: separate to compilation component??
  const startCompilation = useCallback(
    (info: EtherscanContractResponse | null) => {
      if (!info)
        return

      let info_with_settings = { ...info }
      if (!info_with_settings.SourceCode.settings)
        info_with_settings.SourceCode.settings = {}

      // request ast output from compilation
      info_with_settings.SourceCode.settings.outputSelection = {'*': {'': ['ast']}}

      // console.log(info_with_settings)
      solcWorkerRef.current?.postMessage(info_with_settings)
    }, [solcWorkerRef])

  function onSourceAvailable(contractInfo: EtherscanContractResponse) {
    state.contractInfo.value = contractInfo

    if (!state.contractInfo.value || !state.contractInfo.value.SourceCode) {
      state.code.value = '/*\nno source code found\n*/'
      state.defTree.value = {}
      return
    }

    if (!astParser) {
      state.code.value = '/*\nparser failed to load??\n*/'
      state.defTree.value = {}
      return
    }

    let contractPath = findContract(state.contractInfo.value.SourceCode, state.contractInfo.value.ContractName)
    if (!contractPath) {
      state.code.value = '/*\nfailed to find contract..\n*/'
      state.defTree.value = {}
      return
    }

    let flatCode = flattenCode(astParser, state.contractInfo.value.SourceCode, contractPath)
    state.code.value = flatCode

    // parse ast and process definitions tree
    state.ast = astParser.parse(flatCode, { loc: true, range: true, tolerant: true })
    let tree = {}
    let id = 0
    
    /*
      tree has only two nesting levels (below the root):
      - parent is one of contract, interface, library or an orphan child (eg. floating function)
      - child is one of function, struct, event, enum
    */
    let addNode = (node, parent, ...props) => {
      let obj = {
        id: id++,
        node,
        parent,
        children: [],
        ...props
      }

      if (parent && parent.name && tree[parent.name]) {
        tree[parent.name].children.push(obj)
      } else {
        tree[node.name] = obj
      }
    }
  
    astParser.visit(state.ast, {
      ContractDefinition: addNode,
      FunctionDefinition: addNode,
      StructDefinition: addNode,
      EventDefinition: addNode,
      ErrorDefinition: addNode,
      EnumDefinition: addNode,
      StateVariableDeclaration: addNode,
    })

    state.defTree.value = tree
    // console.log(state.ast)
    // window.ast = state.ast
    // debugger
    // startCompilation(contractInfo)
  }

  // this useEffect is called when astParser is available to ensure
  // the code is parsed (the ast parser is loaded in a separate script)
  const loadContract = (address: string) => {
    const cache_key = `contractInfo_${address}`
    let contractInfo = JSON.parse(localStorage.getItem(cache_key))
    if (contractInfo) {
      // console.log('found cached contract info')
      onSourceAvailable(contractInfo)
      return
    }

    fetch('/api/getContract?address=' + address)
      .then(res => res.json())
      .then(data => {
        let contractInfo = etherscanParse(data)
        onSourceAvailable(contractInfo)
        localStorage.setItem(cache_key, JSON.stringify(contractInfo))
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const tryLoadAddress = (address: string) => {
    batch(() => {
      state.address.value = address
      if (!isValidAddress(address))
        return

      router.push({query:{address}})
      // console.log('astParser', astParser && astParser.parse)
      loadContract(address)
    })
  }

  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <NoSSR>
      <input
        type="text"
        placeholder="Address..."
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
        onChange={e => tryLoadAddress(e.target.value)}
        value={state.address.value}
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
              theme={theme == 'dark' ? "vs-dark" : "vs-light"}
              value={state.code.value}
              onMount={handleEditorDidMount}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={80} style={{'overflow':'auto'}}>
              {state.contractInfo.value && (
                <AstTreeView name={state.contractInfo.value.ContractName} tree={state.defTree.value} onSelect={
                  (item) => {
                    let { loc } = item.node
                    editorRef.current.setPosition({lineNumber: loc.start.line, column: loc.start.column })
                    editorRef.current.setSelection({
                      startLineNumber: loc.start.line,
                      startColumn: loc.start.column,
                      endLineNumber: loc.end.line,
                      endColumn: loc.end.column + 2,
                    })
                    editorRef.current.revealLineInCenter(loc.start.line)
                  }
                } />
              )}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20}>
              
              <div className="h-full py-2 px-4 border-t bg-gray-800 dark:bg-black-700 border-black-900/25 text-gray-400 dark:text-gray-600 text-xs">
                <p>Compiler version: {state.contractInfo.value && state.contractInfo.value?.CompilerVersion}</p>
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
