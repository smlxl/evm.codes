import fs from 'fs'
import path from 'path'

import matter from 'gray-matter'
import type { NextPage } from 'next'
import { serialize } from 'next-mdx-remote/serialize'
import getConfig from 'next/config'
import { IOpcodeDocs, IOpcodeGasDocs, IOpcodeDocMeta } from 'types'

import { GITHUB_REPO_URL } from 'util/constants'

import HomeLayout from 'components/layouts/Home'
import ReferenceTable from 'components/Reference'
import { H1, H2, Container, Button } from 'components/ui'

const docsDir = 'docs/opcodes'

const { serverRuntimeConfig } = getConfig()

const HomePage = ({
  opcodeDocs,
  gasDocs,
}: {
  opcodeDocs: IOpcodeDocs
  gasDocs: IOpcodeGasDocs
}) => {
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
          <ReferenceTable opcodeDocs={opcodeDocs} gasDocs={gasDocs} />
        </Container>
      </section>

      <section className="pt-20 pb-10 text-center">
        <Container>
          <H2 className="mb-10">Have ideas to make evm.codes better?</H2>
          <Button external href={GITHUB_REPO_URL}>
            Contribute on GitHub
          </Button>
        </Container>
      </section>
    </>
  )
}

HomePage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export const getStaticProps = async () => {
  const docsPath = path.join(serverRuntimeConfig.APP_ROOT, docsDir)
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
            if (!(opcode in gasDocs)) gasDocs[opcode] = {}
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
