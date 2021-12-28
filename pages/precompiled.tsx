import fs from 'fs'
import path from 'path'

import matter from 'gray-matter'
import type { NextPage } from 'next'
import { serialize } from 'next-mdx-remote/serialize'
import getConfig from 'next/config'
import Link from 'next/link'
import { IPrecompiledDocs, IPrecompiledGasDocs } from 'types'

import HomeLayout from 'components/layouts/Home'
import PrecompiledReferenceTable from 'components/PrecompiledReference'
import { H1, H2, Container, Button } from 'components/ui'

const docsDir = 'docs/precompiled'

const { serverRuntimeConfig } = getConfig()

const ILink = ({ link, title }: { link?: string; title: string }) => (
  <Link href={link ? `/${link}` : '/'} passHref>
    <a className="underline font-mono">{title}</a>
  </Link>
)

// It seems the memory expansion computation and constants did not change since frontier, but we have to keep an eye on new fork to keep this up to date
const PrecompiledPage = ({
  precompiledDocs,
  gasDocs,
}: {
  precompiledDocs: IPrecompiledDocs
  gasDocs: IPrecompiledGasDocs
}) => {
  return (
    <>
      <Container className="text-sm leading-6">
        <H1>Precompiled contracts</H1>

        <H2 className="mb-4">Introduction</H2>
        <p className="pb-6">
          On top of having a set of opcodes to choose from, the EVM also offers
          a set of more advanced functionalities through precompiled contracts.
          These are a special kind of contracts that are bundled with the EVM at
          fixed addresses, and can be called with a reduced gas cost. The
          addresses start from 1, and increment for each contract. New hardforks
          may introduce new precompiled contracts. They are called from the
          opcodes like regular contracts, with instructions like{' '}
          <ILink link="#F1" title="CALL" />.
        </p>
        <p className="pb-6">
          After the hardfork <b>Berlin</b>, all the precompiled contracts
          addresses are always considered warm. See section{' '}
          <ILink link="about" title="access sets" />.
        </p>
        <p className="pb-6">
          The precompiled contracts are also available in the{' '}
          <ILink link="playground" title="playground" />.
        </p>
      </Container>

      <section className="py-10 md:py-20 bg-gray-50 dark:bg-black-700">
        <Container>
          <PrecompiledReferenceTable
            precompiledDocs={precompiledDocs}
            gasDocs={gasDocs}
          />
        </Container>
      </section>
    </>
  )
}

PrecompiledPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}
export const getStaticProps = async () => {
  const docsPath = path.join(serverRuntimeConfig.APP_ROOT, docsDir)
  const docs = fs.readdirSync(docsPath)

  const precompiledDocs: IPrecompiledDocs = {}
  const gasDocs: IPrecompiledGasDocs = {}

  await Promise.all(
    docs.map(async (doc) => {
      const stat = fs.statSync(path.join(docsPath, doc))
      const address = path.parse(doc).name.toLowerCase()

      try {
        if (stat?.isDirectory()) {
          fs.readdirSync(path.join(docsPath, doc)).map((fileName) => {
            const markdown = fs.readFileSync(
              path.join(docsPath, doc, fileName),
              'utf-8',
            )
            const forkName = path.parse(fileName).name
            if (!(address in gasDocs)) {
              gasDocs[address] = {}
            }
            gasDocs[address][forkName] = markdown
          })
        } else {
          const markdownWithMeta = fs.readFileSync(
            path.join(docsPath, doc),
            'utf-8',
          )
          const { data, content } = matter(markdownWithMeta)
          const fork = data['fork']
          const mdxSource = await serialize(content)

          precompiledDocs[address] = {
            fork,
            mdxSource,
          }
        }
      } catch (error) {
        console.debug(
          "Couldn't read the Markdown doc for the precompiled",
          error,
        )
      }
    }),
  )
  return {
    props: {
      precompiledDocs,
      gasDocs,
    },
  }
}

export default PrecompiledPage
