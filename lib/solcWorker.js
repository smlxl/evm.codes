import { compilerVersion } from 'util/compiler'

importScripts(`https://binaries.soliditylang.org/bin/${compilerVersion}.js`)
var assert = require('assert')

// Code extracted from https://github.com/ethereum/solc-js/blob/{compilerVersion}/wrapper.js
const alloc = cwrap('solidity_alloc', 'number', ['number'])
const copyFromCString = UTF8ToString
const reset = cwrap('solidity_reset', null, [])
const solidityCompile = cwrap('solidity_compile', 'string', [
  'string',
  'number',
  'number',
])

function copyToCString(str, ptr) {
  var length = lengthBytesUTF8(str)
  // This is allocating memory using solc's allocator.
  //
  // Before 0.6.0:
  //   Assuming copyToCString is only used in the context of wrapCallback, solc will free these pointers.
  //   See https://github.com/ethereum/solidity/blob/v0.5.13/libsolc/libsolc.h#L37-L40
  //
  // After 0.6.0:
  //   The duty is on solc-js to free these pointers. We accomplish that by calling `reset` at the end.
  var buffer = alloc(length + 1)
  stringToUTF8(str, buffer, length + 1)
  setValue(ptr, buffer, '*')
}

function wrapCallback(callback) {
  assert(typeof callback === 'function', 'Invalid callback specified')
  return function (data, contents, error) {
    var result = callback(copyFromCString(data))
    if (typeof result.contents === 'string') {
      copyToCString(result.contents, contents)
    }
    if (typeof result.error === 'string') {
      copyToCString(result.error, error)
    }
  }
}

function wrapCallbackWithKind(callback) {
  assert(typeof callback === 'function', 'Invalid callback specified')
  return function (context, kind, data, contents, error) {
    // Must be a null pointer.
    assert(context === 0, 'Callback context must be null')
    var result = callback(copyFromCString(kind), copyFromCString(data))
    if (typeof result.contents === 'string') {
      copyToCString(result.contents, contents)
    }
    if (typeof result.error === 'string') {
      copyToCString(result.error, error)
    }
  }
}

function runWithCallbacks(callbacks, compile, args) {
  if (callbacks) {
    assert(typeof callbacks === 'object', 'Invalid callback object specified')
  } else {
    callbacks = {}
  }

  var readCallback = callbacks.import
  if (readCallback === undefined) {
    readCallback = function (data) {
      return {
        error: 'File import callback not supported',
      }
    }
  }

  var singleCallback
  // After 0.6.x multiple kind of callbacks are supported.
  var smtSolverCallback = callbacks.smtSolver
  if (smtSolverCallback === undefined) {
    smtSolverCallback = function (data) {
      return {
        error: 'SMT solver callback not supported',
      }
    }
  }

  singleCallback = function (kind, data) {
    if (kind === 'source') {
      return readCallback(data)
    } else if (kind === 'smt-query') {
      return smtSolverCallback(data)
    } else {
      assert(false, 'Invalid callback kind specified')
    }
  }

  singleCallback = wrapCallbackWithKind(singleCallback)

  var cb = addFunction(singleCallback, 'viiiii')
  var output
  try {
    args.push(cb)
    // Callback context.
    args.push(null)
    output = compile.apply(undefined, args)
  } catch (e) {
    removeFunction(cb)
    throw e
  }
  removeFunction(cb)
  if (reset) {
    // Explicitly free memory.
    //
    // NOTE: cwrap() of "compile" will copy the returned pointer into a
    //       Javascript string and it is not possible to call free() on it.
    //       reset() however will clear up all allocations.
    reset()
  }
  return output
}

function compile(input, callbacks) {
  return runWithCallbacks(callbacks, solidityCompile, [input])
}
// End code extracted

// Common input
const input = {
  sources: {
    web: {
      content: '',
    },
  },
  settings: {
    optimizer: {
      enabled: false,
      runs: 200,
    },
    evmVersion: '',
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
}

function findImports(path) {
  return { error: 'Does not support imports' }
}

// Entrypoint of the worker
onmessage = function (e) {
  if (!e.data.source) {
    postMessage({ error: 'The source should not be empty' })
    return
  }

  input.language = e.data.language
  input.sources.web.content = e.data.source
  input.settings.evmVersion = e.data.evmVersion

  const output = JSON.parse(
    compile(JSON.stringify(input), { import: findImports }),
  )
  let warningMessage = ''

  if (output.errors) {
    let errorMessage = ''

    output.errors.forEach((report) => {
      if (report.severity == 'error') {
        errorMessage += report.formattedMessage + '\n'
      } else {
        warningMessage += report.formattedMessage + '\n'
      }
    })

    if (errorMessage) {
      postMessage({ error: errorMessage })
      return
    }
  }

  const contracts = []

  for (const contractName in output.contracts.web) {
    contracts.push({
      name: contractName,
      code: output.contracts.web[contractName].evm.bytecode.object,
      abi: output.contracts.web[contractName].abi,
    })
  }

  if (contracts.length === 0) {
    postMessage({ error: 'No contracts found' })
  } else {
    postMessage({ error: null, warning: warningMessage, contracts })
  }
}
