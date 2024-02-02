import { EtherscanContractResponse } from 'types/contract'

import { etherscanParse } from 'util/EtherscanParser'

import { DeploymentInfo } from './DeploymentInfo'

export default class EtherscanLoader {
  static async loadFromEtherscan(address: string) {
    const data = await fetch('/api/getContract?address=' + address)
      .then((res) => res.json())
      .catch((err) => {
        console.error('fetch error:', err)
        throw err
      })

    return etherscanParse(data)
  }

  static cacheKey(address: string) {
    return `contractInfo_${address}`
  }

  static loadFromCache(address: string) {
    const value = sessionStorage.getItem(EtherscanLoader.cacheKey(address))
    return value ? JSON.parse(value) : undefined
  }

  static saveToCache(
    address: string,
    etherscanInfo: EtherscanContractResponse,
  ) {
    return sessionStorage.setItem(
      EtherscanLoader.cacheKey(address),
      JSON.stringify(etherscanInfo),
    )
  }

  static async loadDeployment(address: string, context?: DeploymentInfo) {
    address = address.toLowerCase()

    let etherscanInfo = EtherscanLoader.loadFromCache(address)
    if (!etherscanInfo) {
      etherscanInfo = await EtherscanLoader.loadFromEtherscan(address)
      EtherscanLoader.saveToCache(address, etherscanInfo)
    }

    if (
      !etherscanInfo ||
      !etherscanInfo?.SourceCode ||
      etherscanInfo?.ABI == 'Contract source code not verified'
    ) {
      throw 'failed to load contract info'
    }

    return new DeploymentInfo(etherscanInfo, address, context)
  }
}
