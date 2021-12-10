import { MDXRemote } from 'next-mdx-remote'
import { IOpcode, IOpcodeDoc } from 'types'

import { GITHUB_REPO_URL } from 'util/constants'

import * as Doc from 'components/ui/Doc'

import DynamicFee from './DynamicFee'

type Props = {
  opcodeDoc: IOpcodeDoc
  opcode: IOpcode
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

const DocRow = ({ opcodeDoc, opcode }: Props) => {
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

          {opcode.dynamicFee && <DynamicFee opcode={opcode} />}
          <MDXRemote {...opcodeDoc.mdxSource} components={docComponents} />
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
