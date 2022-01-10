import fs from 'fs'
import path from 'path'

import { useContext } from 'react'

import matter from 'gray-matter'
import type { NextPage } from 'next'
import { serialize } from 'next-mdx-remote/serialize'
import getConfig from 'next/config'
import { IOpcodeDocs, IOpcodeGasDocs, IOpcodeDocMeta } from 'types'

import { EthereumContext } from 'context/ethereumContext'

import ContributeBox from 'components/ContributeBox'
import HomeLayout from 'components/layouts/Home'
import ReferenceTable from 'components/Reference'
import { H1, Container } from 'components/ui'

const { serverRuntimeConfig } = getConfig()

const HomePage = ({
  opcodeDocs,
  gasDocs,
}: {
  opcodeDocs: IOpcodeDocs
  gasDocs: IOpcodeGasDocs
}) => {
  const { opcodes } = useContext(EthereumContext)

  return (
    <>
      <Container>
        <H1>
          An interactive reference to <br />
          Ethereum Virtual Machine Opcodes
        </H1>
      </Container>

      <section className="py-10 md:py-20 bg-gray-50 dark:bg-black-700">
        <Container>
          <ReferenceTable
            opcodes={opcodes}
            opcodeDocs={opcodeDocs}
            gasDocs={gasDocs}
          />
        </Container>
      </section>

      <section className="pt-20 pb-10 text-center">
        <ContributeBox />
      </section>
    </>
  )
}

HomePage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export const getStaticProps = async () => {
  const docsPath = path.join(serverRuntimeConfig.APP_ROOT, 'docs/opcodes')
  const docs = fs.readdirSync(docsPath)

  const opcodeDocs: IOpcodeDocs = {}
  const gasDocs: IOpcodeGasDocs = {}

  await Promise.all(
    docs.map(async (doc) => {
      const stat = fs.statSync(path.join(docsPath, doc))
      const opcode = path.parse(doc).name.toLowerCase()

      try {
        if (stat?.isDirectory()) {
          fs.readdirSync(path.join(docsPath, doc)).map((fileName) => {
            const markdown = fs.readFileSync(
              path.join(docsPath, doc, fileName),
              'utf-8',
            )
            const forkName = path.parse(fileName).name
            if (!(opcode in gasDocs)) {
              gasDocs[opcode] = {}
            }
            gasDocs[opcode][forkName] = markdown
          })
        } else {
          const markdownWithMeta = fs.readFileSync(
            path.join(docsPath, doc),
            'utf-8',
          )
          const { data, content } = matter(markdownWithMeta)
          const meta = data as IOpcodeDocMeta
          const mdxSource = await serialize(content)

          opcodeDocs[opcode] = {
            meta,
            mdxSource,
          }
        }
      } catch (error) {
        console.debug("Couldn't read the Markdown doc for the opcode", error)
      }
    }),
  )
  return {
    props: {
      opcodeDocs,
      gasDocs,
    },
  }
}

export default HomePage
