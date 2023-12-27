
let ETHERSCAN_URL = 'https://api.etherscan.io/api?'

export async function etherscanRequest(module: string, action: string, params: object) {
  let query: any = {
      'apikey': process.env.APIKEY_ETHERSCAN,
      'module': module,
      'action': action,
      ...params
  }

  let url = ETHERSCAN_URL + new URLSearchParams(query)
  return fetch(url)
}

export async function etherscanGetSource(address: string) {
    return etherscanRequest('contract', 'getsourcecode', { address })
}

