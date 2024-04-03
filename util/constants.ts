export const GITHUB_REPO_URL = 'https://github.com/smlxl/evm.codes'

// Currently active hardfork from the ones available:
// See: https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/common/src/hardforks
export const CURRENT_FORK = 'cancun'

export const FORKS_WITH_TIMESTAMPS: { [name: string]: number } = {
  shanghai: 1681338455,
  cancun: 1710338135,
}
