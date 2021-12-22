import { useContext, useMemo, useEffect, useState } from 'react'

import { Hardfork } from '@ethereumjs/common/dist/types'
import cn from 'classnames'
import { MDXRemote } from 'next-mdx-remote'
import { IOpcode, IOpcodeDoc, IOpcodeGasDoc } from 'types'

import { EthereumContext } from 'context/ethereumContext'

import { GITHUB_REPO_URL } from 'util/constants'
import { parseGasPrices } from 'util/gas'

import * as Doc from 'components/ui/Doc'

import DynamicFee from './DynamicFee'

type Props = {
  opcodeDoc: IOpcodeDoc
  opcode: IOpcode
  gasDoc: IOpcodeGasDoc
  isDynamicFeeActive: boolean
}

const docComponents = {
  h1: Doc.H1,
  h2: Doc.H2,
  h3: Doc.H3,
  p: Doc.P,
  ul: Doc.UL,
  ol: Doc.OL,
  li: Doc.LI,
  table: Doc.Table,
  th: Doc.TH,
  td: Doc.TD,
  a: Doc.A,
  pre: Doc.Pre,
}

// Finds matching fork between available ones and provided list
const findFork = (
  forks: Hardfork[],
  forkNames: string[],
  selectedFork: Hardfork | undefined,
) => {
  // get all known forks mapped to a block number
  const knownForksWithBlocks = forks.reduce(
    (res: { [forkName: string]: number }, fork: Hardfork) => {
      if (fork.block) {
        res[fork.name] = fork.block
      }
      return res
    },
    {},
  )

  // filter all forks with block number below or equal to the selected,
  // sort in descending order and pick the first found
  let foundFork: string = forkNames
    .filter(
      (forkName) =>
        knownForksWithBlocks[forkName] <= (selectedFork?.block || 0),
    )
    .sort((a, b) => knownForksWithBlocks[b] - knownForksWithBlocks[a])[0]

  // NOTE: Petersburg and Constantinople have the same block number & hash,
  // so when both are present, Constantinople is picked, so this handles it.
  if (
    selectedFork?.name === 'petersburg' &&
    forkNames.includes(selectedFork?.name)
  ) {
    foundFork = selectedFork?.name
  }

  return foundFork
}

const DocRow = ({ opcodeDoc, opcode, gasDoc, isDynamicFeeActive }: Props) => {
  const { common, forks, selectedFork } = useContext(EthereumContext)
  const [dynamicDocMdx, setDynamicDocMdx] = useState()

  const dynamicDoc = useMemo(() => {
    if (!gasDoc) return null
    const fork = findFork(forks, Object.keys(gasDoc), selectedFork)
    return fork && common ? parseGasPrices(common, gasDoc[fork]) : null
  }, [forks, selectedFork, gasDoc, common])

  const dynamicFeeFork = useMemo(() => {
    if (!opcode.dynamicFee) return null
    return findFork(forks, Object.keys(opcode.dynamicFee), selectedFork)
  }, [forks, selectedFork, opcode.dynamicFee])

  useEffect(() => {
    let controller: AbortController | null = new AbortController()

    const fetchDynamicDoc = async () => {
      try {
        const response = await fetch('/api/getDynamicDoc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: dynamicDoc }),
          signal: controller?.signal,
        })
        const data = await response.json()
        setDynamicDocMdx(data.mdx)
        controller = null
      } catch (error) {
        setDynamicDocMdx(undefined)
      }
    }

    if (dynamicDoc) {
      fetchDynamicDoc()
    }

    return () => controller?.abort()
  }, [dynamicDoc])

  return (
    <div className="text-sm px-4 md:px-8 py-8 bg-indigo-50 dark:bg-black-600">
      {opcodeDoc && (
        <>
          <table className="table-auto mb-6 bg-indigo-100 dark:bg-black-500 rounded font-medium">
            <thead>
              <tr className="text-gray-500 uppercase text-xs">
                <td className="pt-3 px-4">Since</td>
                <td className="pt-3 px-4">Group</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pb-3 px-4">{opcodeDoc.meta.fork}</td>
                <td className="pb-3 px-4">{opcodeDoc.meta.group}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex flex-col lg:flex-row">
            <div
              className={cn({
                'flex-1 lg:pr-8': opcode.dynamicFee,
              })}
            >
              <MDXRemote {...opcodeDoc.mdxSource} components={docComponents} />
              {isDynamicFeeActive && dynamicDocMdx && (
                <MDXRemote {...dynamicDocMdx} components={docComponents} />
              )}
            </div>

            {isDynamicFeeActive && dynamicFeeFork && (
              <DynamicFee opcode={opcode} fork={dynamicFeeFork} />
            )}
          </div>
        </>
      )}
      {!opcodeDoc && (
        <div>
          There is no reference doc for this opcode yet. Why not{' '}
          <a
            className="underline font-medium"
            href={`${GITHUB_REPO_URL}/new/main/docs/opcodes`}
            target="_blank"
            rel="noreferrer"
          >
            contribute?
          </a>{' '}
          ;)
        </div>
      )}
    </div>
  )
}

export default DocRow
