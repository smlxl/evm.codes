import React, {
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react'
import NoSSR from "react-no-ssr"
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { signal, batch, useSignal } from '@preact/signals-react'
import { bufferToHex, Address, isValidAddress } from '@ethereumjs/util'
import Editor from '@monaco-editor/react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import ContractTreeView from './ContractTreeView'
import { etherscanParse } from 'util/EtherscanParser'
import { astToTreeView, state } from './ContractState'
import { findContract, flattenCode } from 'util/flatten'
import { EtherscanContractResponse } from 'types/contract'

export function astToTreeView(
  astParser: SolidityParser,
  ast,
  contractInfo: EtherscanContractResponse,
  address: string,
  context?: string
): ContractDeployment {
  // TODO: move from index.tsx
}

const ContractViewer = () => {
  let [forceRender, setForceRender] = useState(0)
  let rerender = () => setForceRender(forceRender + 1)
  useEffect(()=>{}, [forceRender])




  const router = useRouter()

  const { theme, setTheme, resolvedTheme } = useTheme()

  const editorRef = useRef(null);
  const solcWorkerRef = useRef<null | Worker>(null)
  const [astParser, setAstParser] = useState<any>(null)

  function handleEditorDidMount(editor, monaco) {
    if (!editor)
      return

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

  // TODO: fix the solidity-parser import in browser
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

  // load contract from url once everything is ready
  useEffect(() => {
    const address = router.query.address as string
    // instead of setting value attribute directly, otherwise it won't be editable
    if (window.txt_address)
      window.txt_address.value = address
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
      solcWorkerRef.current?.postMessage({ version: info_with_settings.CompilerVersion, stdJson: info_with_settings.SourceCode })
    }, [solcWorkerRef])

  function onSourceAvailable(contractInfo: EtherscanContractResponse, codeAddress: string, contextAddress: string) {
    state.contractInfo.value = contractInfo

    if (!contractInfo || !contractInfo.SourceCode) {
      state.code.value = '/*\nno source code found\n*/'
      // state.defTree.value = {}
      return
    }

    if (!astParser) {
      state.code.value = '/*\nparser failed to load??\n*/'
      // state.defTree.value = {}
      return
    }

    // recursively load proxy implementation if available
    // it's async so it won't block the rest of the code
    if (contractInfo?.Implementation) {
      // console.warn('loading proxy implementation:', contractInfo.Implementation, 'for context:', contextAddress, 'from:', codeAddress)
      loadContract(contractInfo.Implementation, contextAddress)
    }
    
    let contractPath = findContract(contractInfo.SourceCode, contractInfo.ContractName)
    if (!contractPath) {
      state.code.value = '/*\nfailed to find contract..\n*/'
      // state.defTree.value = {}
      return
    }

    let flatCode = flattenCode(astParser, contractInfo.SourceCode, contractPath)
    state.code.value = flatCode

    // parse ast and process definitions tree
    let ast = astParser.parse(flatCode, { loc: true, range: true, tolerant: true })
    state.ast = ast
    
    // let tree = astToTreeView(astParser, ast, contractInfo, state.address.peek())
    let id = 0
    
    function makeItem(type, props) {
      return {
        id: codeAddress + '_' + contextAddress + '_' + id,
        type,
        children: [],
        ...props
      }
    }

    let tree = makeItem('Deployment', { node: { codeAddress, contextAddress, impls: [], name: contractInfo.ContractName, code: flatCode } })
    let context: any = [tree]
    
    function getContext() {
      return context.at(-1)
    }

    // function pushContext() {
    //   context.push(makeItem('Context'))
    // }

    // function getContextPath() {
    //   return '/' + context.map(node => node.name).join('/')
    // }

    /*
      tree has only two nesting levels (below the root):
      - parent is one of contract, interface, library or an orphan child (eg. floating function)
      - child is one of function, struct, event, enum
    */
    function tagParent(node, parent) {
      node.nodeId = id++
      if (parent) {
        node.parentId = parent.nodeId
      }
    }

    const callbackNames = [
      'ContractDefinition',
      'FunctionDefinition',
      'StructDefinition',
      'EventDefinition',
      'ErrorDefinition',
      'EnumDefinition',
      'StateVariableDeclaration'
    ]

    function onNodeEnter(node, parent) {
      tagParent(node, parent)

      if (callbackNames.indexOf(node.type) != -1) {
        let item = makeItem(node.type, { node })
        context.at(-1).children.push(item)
        context.push(item)
        // console.log(getContextPath())
      }
    }

    function onNodeExit(node, parent) {
      if (callbackNames.indexOf(node.type) != -1) {
        context.pop()
      }
    }

    let allVisitor = new Proxy({}, {
      get(target, name: string) {
        return (name.endsWith(':exit') ? onNodeExit : onNodeEnter)
      }
    })
  
    astParser.visit(state.ast, allVisitor)

    // TODO: yes it's weird. is there a nicer way to work with signals of objects?
    let defTree = state.defTree.value
    defTree[codeAddress] = tree
    // the code below was supposed to allow delegated impl contracts to be *under* their proxies
    // but it's not working properly yet
    // console.log(defTree[contextAddress])
    // if (contextAddress == codeAddress) {
    //   // if (defTree[contextAddress]) {
    //   //   let imps = defTree[contextAddress]['$Implementations']
    //   //   if (imps)
    //   //     tree['$Implementations'] = imps
    //   // }

    //   defTree[contextAddress] = tree
    // } else {
    //   console.log('push delegation', codeAddress, 'in context', contextAddress)
    //   // if (!defTree[contextAddress]['$Implementations']) {
    //   //   defTree[contextAddress]['$Implementations'] = {}
    //   //   console.log('created context', defTree)
    //   // }
    //   try {
    //   console.log('ctx', contextAddress, defTree[contextAddress])
    //   defTree[contextAddress].node.impls.push(tree)
    //   console.log(defTree[contextAddress].node)
    //   } catch (e) {
    //     return
    //   }

    //   // defTree[contextAddress]['$Implementations'][codeAddress] = tree
    //   // window.imps = defTree[contextAddress]['$Implementations']
    // }
    state.defTree.value = { ...defTree }

    // window.tree = defTree/
    // console.log(state.ast)
    // window.ast = state.ast
    // debugger
    // startCompilation(contractInfo)
  }

  // this useEffect is called when astParser is available to ensure
  // the code is parsed (the ast parser is loaded in a separate script)
  const loadContract = async (codeAddress: string, contextAddress: address = '') => {
    codeAddress = codeAddress.toLowerCase()
    contextAddress = contextAddress.toLowerCase()
    if (!contextAddress) {
      contextAddress = codeAddress
    }

    const cache_key = `contractInfo_${codeAddress}`
    let contractInfo = JSON.parse(sessionStorage.getItem(cache_key))
    if (contractInfo) {
      // console.log('found cached contract info')
      onSourceAvailable(contractInfo, codeAddress, contextAddress)
      return
    }

    fetch('/api/getContract?address=' + codeAddress)
      .then(res => res.json())
      .then(data => {
        let contractInfo = etherscanParse(data)
        onSourceAvailable(contractInfo, codeAddress, contextAddress)
        sessionStorage.setItem(cache_key, JSON.stringify(contractInfo))
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const tryLoadAddress = (address: string) => {
    batch(() => {
      state.address.value = (address || '').toLowerCase()
      if (!isValidAddress(address))
        return

      router.push({query:{address}})
      // console.log('astParser', astParser && astParser.parse)
      loadContract(address)
    })
  }

  return (
    <NoSSR>
      <input
        id="txt_address"
        type="text"
        placeholder="Address..."
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
        onChange={e => tryLoadAddress(e.target.value)}
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
                <ContractTreeView
                  // name={state.contractInfo.value.ContractName}
                  // rootLabel={<div><p>🗂️ {state.contractInfo.value.ContractName}</p><span className="text-xs">{state.address.value}</span></div>}
                  forest={Object.values(state.defTree.value)}
                  onSelect={
                    (item, root) => {
                      if (!item || !item.node || !item.node.loc)
                        return

                      let { loc } = item.node
                      let addr = root.node.codeAddress
                      if (addr != state.address.value) {
                        state.address.value = addr
                        state.code.value = root.node.code
                      }

                      rerender()

                      editorRef.current.setPosition({lineNumber: loc.start.line, column: loc.start.column })
                      // TODO: potentially select on double click?
                      // editorRef.current.setSelection({
                      //   startLineNumber: loc.start.line,
                      //   startColumn: loc.start.column,
                      //   endLineNumber: loc.end.line,
                      //   endColumn: loc.end.column + 2,
                      // })
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
