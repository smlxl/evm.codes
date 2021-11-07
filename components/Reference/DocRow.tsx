import cn from 'classnames'
import { MDXRemote } from 'next-mdx-remote'
import { IOpcodeDoc } from 'types'

import { GITHUB_REPO_URL } from 'util/constants'

import * as Doc from 'components/ui/Doc'

type Props = {
  opcode: IOpcodeDoc
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

const colClassName = 'py-1 px-2 border border-indigo-200 dark:border-black-400'

const DocRow = ({ opcode }: Props) => {
  return (
    <div className="text-sm px-8 py-8 bg-indigo-50 dark:bg-black-600">
      {opcode && (
        <>
          <table className="table-auto mb-4">
            <thead>
              <tr className="text-xs">
                <td className={cn('font-medium', colClassName)}>
                  Appeared in fork
                </td>
                <td className={cn('font-medium', colClassName)}>Group</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={colClassName}>{opcode.meta.fork}</td>
                <td className={colClassName}>{opcode.meta.group}</td>
              </tr>
            </tbody>
          </table>

          <MDXRemote {...opcode.mdxSource} components={docComponents} />
        </>
      )}
      {!opcode && (
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
