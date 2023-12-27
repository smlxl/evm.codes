import wrapper from 'solc/wrapper';

let loadedCompilers = {}

function loadCompiler(version) {
  if (!version) {
    console.warn('no version specified')
    return;
  }

  if (!loadedCompilers[version]) {
    const url = `https://binaries.soliditylang.org/bin/soljson-${version}.js`
    console.log('loading compiler:', url)
    importScripts(url)
    loadedCompilers[version] = true
  }
}

function onCompileRequest(msg) {
  let version = msg.data.CompilerVersion
  if (!version) {
    console.warn('no version specified')
    return;
  }

  loadCompiler(version)
  // console.log('compiling with version:', version)
  const compiler = wrapper(self.Module)
  const input = JSON.stringify(msg.data.SourceCode)
  const result = compiler.compile(input)
  // console.log('compilation result:', result)
  self.postMessage(result)
}

self.addEventListener('message', onCompileRequest, false)
