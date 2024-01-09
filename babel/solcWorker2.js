import wrapper from 'solc/wrapper';

let loadedCompilers = {}

function loadCompiler(version) {
  if (!loadedCompilers[version]) {
    const url = `https://binaries.soliditylang.org/bin/soljson-${version}.js`
    try {
      importScripts(url)
    } catch (e) {
      return false
    }
    loadedCompilers[version] = true
  }

  return true
}

function onCompileRequest(msg) {
  let { version, stdJson } = msg.data.version
  if (!version || !stdJson) {
    self.postMessage({ error: 'no version or standard json specified' })
    return
  }

  // console.log('loading compiler:', url)
  if (!loadCompiler(version)) {
    self.postMessage({ error: `failed to load compiler version ${version}` })
    return
  }

  // console.log('compiling with version:', version)
  const compiler = wrapper(self.Module)
  // compiler expects json string
  const input = typeof stdJson == 'string' ? stdJson : JSON.stringify(stdJson)
  const result = compiler.compile(input)
  // console.log('compilation result:', result)
  self.postMessage({ result })
}

self.addEventListener('message', onCompileRequest, false)
