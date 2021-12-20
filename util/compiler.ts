/**
 * Gets target EVM version from a hardfork name
 *
 * @param forkName The String harffork name
 * @returns The String matching target EVM version
 * @see https://docs.soliditylang.org/en/v0.8.10/using-the-compiler.html#target-options
 */
export const getTargetEvmVersion = (forkName: string | undefined) => {
  if (forkName === 'dao') return 'homestead'
  if (forkName === 'muirGlacier') return 'berlin'
  if (forkName === 'arrowGlacier') return 'london'
  return forkName
}
