import fs from 'fs'
import path from 'path'

import Common, { Chain } from '@ethereumjs/common'
import { Hardfork } from '@ethereumjs/common/dist/types'
import matter from 'gray-matter'
import { GetServerSideProps } from 'next'
import cookies from 'next-cookies'
import { serialize } from 'next-mdx-remote/serialize'
import getConfig from 'next/config'
import { IOpcodeDocs, IOpcodeGasDocs, IOpcodeDocMeta } from 'types'

import { CURRENT_FORK } from 'util/constants'
import { parseGasPrices } from 'util/gas'

const docsDir = 'docs/opcodes'

const { serverRuntimeConfig } = getConfig()

export const opcodeDocsProps: GetServerSideProps = async (context) => {
  const docsPath = path.join(serverRuntimeConfig.APP_ROOT, docsDir)
  const docs = fs.readdirSync(docsPath)

  const opcodeDocs: IOpcodeDocs = {}
  const gasDocs: IOpcodeGasDocs = {}

  const knownForks: { [name: string]: number } = {}
  let common: Common
  let selectedForkName = cookies(context).fork
  let selectedFork: Hardfork

  try {
    common = new Common({
      chain: Chain.Mainnet,
      hardfork: selectedForkName,
    })
  } catch (error) {
    common = new Common({
      chain: Chain.Mainnet,
      hardfork: CURRENT_FORK,
    })
    selectedForkName = CURRENT_FORK
  }

  // initialize known and selected forks
  common.hardforks().forEach((fork) => {
    if (fork.block) {
      knownForks[fork.name] = fork.block
      if (fork.name === selectedForkName) {
        selectedFork = fork
      }
    }
  })

  await Promise.all(
    docs.map(async (doc) => {
      const stat = fs.statSync(path.join(docsPath, doc))
      const opcode = path.parse(doc).name.toLowerCase()

      try {
        if (stat?.isDirectory()) {
          // read all fork docs, filter by known forks, sort by block number, and
          // find the one matching selected fork
          const foundDoc = fs
            .readdirSync(path.join(docsPath, doc))
            .map((fileName) => path.parse(fileName).name)
            .filter((forkName) => forkName in knownForks)
            .sort((a, b) => knownForks[a] - knownForks[b])
            .find((doc) => knownForks[doc] >= (selectedFork?.block || 0))

          if (foundDoc) {
            const markdown = fs.readFileSync(
              path.join(docsPath, doc, `${foundDoc}.mdx`),
              'utf-8',
            )

            gasDocs[opcode] = {
              mdxSource: await serialize(parseGasPrices(common, markdown)),
            }
          }
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
