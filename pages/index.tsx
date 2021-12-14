import fs from 'fs'
import path from 'path'

import Common, { Chain } from '@ethereumjs/common'
import matter from 'gray-matter'
import type { NextPage } from 'next'
import { GetServerSideProps } from 'next'
import cookies from 'next-cookies'
import { serialize } from 'next-mdx-remote/serialize'
import { IOpcodeDocs, IOpcodeDocMeta } from 'types'

import { CURRENT_FORK, GITHUB_REPO_URL } from 'util/constants'
import { parseGasPrices } from 'util/gas'

import HomeLayout from 'components/layouts/Home'
import ReferenceTable from 'components/Reference'
import { H1, H2, Container, Button } from 'components/ui'

const docsDir = 'docs/opcodes'

const HomePage = ({ opcodeDocs }: { opcodeDocs: IOpcodeDocs }) => {
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
          <ReferenceTable opcodeDocs={opcodeDocs} />
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const files = fs.readdirSync(path.resolve(process.cwd(), docsDir))
  const opcodeDocs: IOpcodeDocs = {}
  let common: Common

  try {
    common = new Common({
      chain: Chain.Mainnet,
      hardfork: cookies(context).fork,
    })
  } catch (error) {
    common = new Common({
      chain: Chain.Mainnet,
      hardfork: CURRENT_FORK,
    })
  }

  await Promise.all(
    files.map(async (filename) => {
      const opcode = filename.split('.')[0].toString().toLowerCase()

      try {
        const markdownWithMeta = fs.readFileSync(
          path.resolve(process.cwd(), `${docsDir}/${filename}`),
          'utf-8',
        )

        const { data, content } = matter(markdownWithMeta)
        const meta = data as IOpcodeDocMeta
        const mdxSource = await serialize(parseGasPrices(common, content))

        opcodeDocs[opcode] = {
          meta,
          mdxSource,
        }
      } catch (error) {
        console.error("Can't read the doc", error)
      }
    }),
  )

  return {
    props: {
      opcodeDocs,
    },
  }
}

export default HomePage
