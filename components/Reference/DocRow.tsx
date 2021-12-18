import { useContext, useMemo, useEffect, useState } from 'react'

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
}

const DocRow = ({ opcodeDoc, opcode, gasDoc, isDynamicFeeActive }: Props) => {
  const { common, forks, selectedFork } = useContext(EthereumContext)
  const [dynamicDocMdx, setDynamicDocMdx] = useState()

  const dynamicDoc = useMemo(() => {
    if (!gasDoc) return null

    // get all known forks mapped to a block number
    const knownForksWithBlocks = forks.reduce(
      (res: { [forkName: string]: number }, fork) => {
        if (fork.block) {
          res[fork.name] = fork.block
        }
        return res
      },
      {},
    )

    // filter by known forks, sort by block number, and
    // find the one matching selected fork
    const foundFork = Object.keys(gasDoc)
      .filter((forkName) => forkName in knownForksWithBlocks)
      .sort((a, b) => knownForksWithBlocks[a] - knownForksWithBlocks[b])
      .find((doc) => knownForksWithBlocks[doc] >= (selectedFork?.block || 0))

    // parse fork dependent dynamic variables
    return foundFork && common
      ? parseGasPrices(common, gasDoc[foundFork])
      : null
  }, [gasDoc, common, forks, selectedFork])

  useEffect(() => {
    if (dynamicDoc) {
      fetch('/api/getDynamicDoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: dynamicDoc }),
      })
        .then((response) => response.json())
        .then((data) => {
          setDynamicDocMdx(data.mdx)
        })
    }
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

          <MDXRemote {...opcodeDoc.mdxSource} components={docComponents} />

          {isDynamicFeeActive && opcode.dynamicFee && (
            <DynamicFee opcode={opcode} />
          )}

          {isDynamicFeeActive && dynamicDocMdx && (
            <MDXRemote {...dynamicDocMdx} components={docComponents} />
          )}
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
