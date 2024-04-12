// an alternative solc worker that can load arbitrary versions
// to rebuild this, run `pnpm build:solcjs-worker` which updates /public/solcWorker.js

import wrapper from 'solc/wrapper'

const releases = {
  '0.8.23': 'soljson-v0.8.23+commit.f704f362.js',
  '0.8.22': 'soljson-v0.8.22+commit.4fc1097e.js',
  '0.8.21': 'soljson-v0.8.21+commit.d9974bed.js',
  '0.8.20': 'soljson-v0.8.20+commit.a1b79de6.js',
  '0.8.19': 'soljson-v0.8.19+commit.7dd6d404.js',
  '0.8.18': 'soljson-v0.8.18+commit.87f61d96.js',
  '0.8.17': 'soljson-v0.8.17+commit.8df45f5f.js',
  '0.8.16': 'soljson-v0.8.16+commit.07a7930e.js',
  '0.8.15': 'soljson-v0.8.15+commit.e14f2714.js',
  '0.8.14': 'soljson-v0.8.14+commit.80d49f37.js',
  '0.8.13': 'soljson-v0.8.13+commit.abaa5c0e.js',
  '0.8.12': 'soljson-v0.8.12+commit.f00d7308.js',
  '0.8.11': 'soljson-v0.8.11+commit.d7f03943.js',
  '0.8.10': 'soljson-v0.8.10+commit.fc410830.js',
  '0.8.9': 'soljson-v0.8.9+commit.e5eed63a.js',
  '0.8.8': 'soljson-v0.8.8+commit.dddeac2f.js',
  '0.8.7': 'soljson-v0.8.7+commit.e28d00a7.js',
  '0.8.6': 'soljson-v0.8.6+commit.11564f7e.js',
  '0.8.5': 'soljson-v0.8.5+commit.a4f2e591.js',
  '0.8.4': 'soljson-v0.8.4+commit.c7e474f2.js',
  '0.8.3': 'soljson-v0.8.3+commit.8d00100c.js',
  '0.8.2': 'soljson-v0.8.2+commit.661d1103.js',
  '0.8.1': 'soljson-v0.8.1+commit.df193b15.js',
  '0.8.0': 'soljson-v0.8.0+commit.c7dfd78e.js',
  '0.7.6': 'soljson-v0.7.6+commit.7338295f.js',
  '0.7.5': 'soljson-v0.7.5+commit.eb77ed08.js',
  '0.7.4': 'soljson-v0.7.4+commit.3f05b770.js',
  '0.7.3': 'soljson-v0.7.3+commit.9bfce1f6.js',
  '0.7.2': 'soljson-v0.7.2+commit.51b20bc0.js',
  '0.7.1': 'soljson-v0.7.1+commit.f4a555be.js',
  '0.7.0': 'soljson-v0.7.0+commit.9e61f92b.js',
  '0.6.12': 'soljson-v0.6.12+commit.27d51765.js',
  '0.6.11': 'soljson-v0.6.11+commit.5ef660b1.js',
  '0.6.10': 'soljson-v0.6.10+commit.00c0fcaf.js',
  '0.6.9': 'soljson-v0.6.9+commit.3e3065ac.js',
  '0.6.8': 'soljson-v0.6.8+commit.0bbfe453.js',
  '0.6.7': 'soljson-v0.6.7+commit.b8d736ae.js',
  '0.6.6': 'soljson-v0.6.6+commit.6c089d02.js',
  '0.6.5': 'soljson-v0.6.5+commit.f956cc89.js',
  '0.6.4': 'soljson-v0.6.4+commit.1dca32f3.js',
  '0.6.3': 'soljson-v0.6.3+commit.8dda9521.js',
  '0.6.2': 'soljson-v0.6.2+commit.bacdbe57.js',
  '0.6.1': 'soljson-v0.6.1+commit.e6f7d5a4.js',
  '0.6.0': 'soljson-v0.6.0+commit.26b70077.js',
  '0.5.17': 'soljson-v0.5.17+commit.d19bba13.js',
  '0.5.16': 'soljson-v0.5.16+commit.9c3226ce.js',
  '0.5.15': 'soljson-v0.5.15+commit.6a57276f.js',
  '0.5.14': 'soljson-v0.5.14+commit.01f1aaa4.js',
  '0.5.13': 'soljson-v0.5.13+commit.5b0b510c.js',
  '0.5.12': 'soljson-v0.5.12+commit.7709ece9.js',
  '0.5.11': 'soljson-v0.5.11+commit.c082d0b4.js',
  '0.5.10': 'soljson-v0.5.10+commit.5a6ea5b1.js',
  '0.5.9': 'soljson-v0.5.9+commit.e560f70d.js',
  '0.5.8': 'soljson-v0.5.8+commit.23d335f2.js',
  '0.5.7': 'soljson-v0.5.7+commit.6da8b019.js',
  '0.5.6': 'soljson-v0.5.6+commit.b259423e.js',
  '0.5.5': 'soljson-v0.5.5+commit.47a71e8f.js',
  '0.5.4': 'soljson-v0.5.4+commit.9549d8ff.js',
  '0.5.3': 'soljson-v0.5.3+commit.10d17f24.js',
  '0.5.2': 'soljson-v0.5.2+commit.1df8f40c.js',
  '0.5.1': 'soljson-v0.5.1+commit.c8a2cb62.js',
  '0.5.0': 'soljson-v0.5.0+commit.1d4f565a.js',
  '0.4.26': 'soljson-v0.4.26+commit.4563c3fc.js',
  '0.4.25': 'soljson-v0.4.25+commit.59dbf8f1.js',
  '0.4.24': 'soljson-v0.4.24+commit.e67f0147.js',
  '0.4.23': 'soljson-v0.4.23+commit.124ca40d.js',
  '0.4.22': 'soljson-v0.4.22+commit.4cb486ee.js',
  '0.4.21': 'soljson-v0.4.21+commit.dfe3193c.js',
  '0.4.20': 'soljson-v0.4.20+commit.3155dd80.js',
  '0.4.19': 'soljson-v0.4.19+commit.c4cbbb05.js',
  '0.4.18': 'soljson-v0.4.18+commit.9cf6e910.js',
  '0.4.17': 'soljson-v0.4.17+commit.bdeb9e52.js',
  '0.4.16': 'soljson-v0.4.16+commit.d7661dd9.js',
  '0.4.15': 'soljson-v0.4.15+commit.bbb8e64f.js',
  '0.4.14': 'soljson-v0.4.14+commit.c2215d46.js',
  '0.4.13': 'soljson-v0.4.13+commit.0fb4cb1a.js',
  '0.4.12': 'soljson-v0.4.12+commit.194ff033.js',
  '0.4.11': 'soljson-v0.4.11+commit.68ef5810.js',
  '0.4.10': 'soljson-v0.4.10+commit.f0d539ae.js',
  '0.4.9': 'soljson-v0.4.9+commit.364da425.js',
  '0.4.8': 'soljson-v0.4.8+commit.60cc1668.js',
  '0.4.7': 'soljson-v0.4.7+commit.822622cf.js',
  '0.4.6': 'soljson-v0.4.6+commit.2dabbdf0.js',
  '0.4.5': 'soljson-v0.4.5+commit.b318366e.js',
  '0.4.4': 'soljson-v0.4.4+commit.4633f3de.js',
  '0.4.3': 'soljson-v0.4.3+commit.2353da71.js',
  '0.4.2': 'soljson-v0.4.2+commit.af6afb04.js',
  '0.4.1': 'soljson-v0.4.1+commit.4fc6fc2c.js',
  '0.4.0': 'soljson-v0.4.0+commit.acd334c9.js',
  '0.3.6': 'soljson-v0.3.6+commit.3fc68da5.js',
  '0.3.5': 'soljson-v0.3.5+commit.5f97274a.js',
  '0.3.4': 'soljson-v0.3.4+commit.7dab8902.js',
  '0.3.3': 'soljson-v0.3.3+commit.4dc1cb14.js',
  '0.3.2': 'soljson-v0.3.2+commit.81ae2a78.js',
  '0.3.1': 'soljson-v0.3.1+commit.c492d9be.js',
  '0.3.0': 'soljson-v0.3.0+commit.11d67369.js',
  '0.2.2': 'soljson-v0.2.2+commit.ef92f566.js',
  '0.2.1': 'soljson-v0.2.1+commit.91a6b35f.js',
  '0.2.0': 'soljson-v0.2.0+commit.4dc2445e.js',
  '0.1.7': 'soljson-v0.1.7+commit.b4e666cc.js',
  '0.1.6': 'soljson-v0.1.6+commit.d41f8b7c.js',
  '0.1.5': 'soljson-v0.1.5+commit.23865e39.js',
  '0.1.4': 'soljson-v0.1.4+commit.5f6c3cdf.js',
  '0.1.3': 'soljson-v0.1.3+commit.028f561d.js',
  '0.1.2': 'soljson-v0.1.2+commit.d0d36e3.js',
  '0.1.1': 'soljson-v0.1.1+commit.6ff4cd6.js',
}

let loadedCompilers = {}

function loadCompiler(version) {
  let release
  // allow short version (eg. 0.8.19) or full release name (eg. v0.8.19+commit.7dd6d404)
  if (version[0] != 'v') {
    release = releases[version]
  } else {
    release = `soljson-${version}.js`
  }

  if (!loadedCompilers[version]) {
    const url = `https://binaries.soliditylang.org/bin/${release}`
    try {
      // eslint-disable-next-line no-undef
      importScripts(url)
    } catch (e) {
      console.error('failed to load compiler version', version, url, e)
      return false
    }
    loadedCompilers[version] = true
  }

  return true
}

function onCompileRequest(msg) {
  let { jobId, version, stdJson } = msg.data
  if (!version || !stdJson) {
    self.postMessage({ jobId, error: 'no version or standard json specified' })
    return
  }

  if (!loadCompiler(version)) {
    self.postMessage({ jobId, error: `failed to load compiler ${version}` })
    return
  }

  const compiler = wrapper(self.Module)
  try {
    // compiler expects json string
    const input = typeof stdJson == 'string' ? stdJson : JSON.stringify(stdJson)
    const result = compiler.compile(input)
    self.postMessage({ jobId, result: JSON.parse(result) })
  } catch (error) {
    self.postMessage({ jobId, error })
  }
}

self.addEventListener('message', onCompileRequest, false)
