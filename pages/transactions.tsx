import fs from 'fs'
import path from 'path'

import React, { useContext, useEffect } from 'react'

import matter from 'gray-matter'
import type { NextPage } from 'next'
import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serialize } from 'next-mdx-remote/serialize'
import { IItemDocs, IGasDocs, IDocMeta } from 'types'

import { EthereumContext } from 'context/ethereumContext'

import ContributeBox from 'components/ContributeBox'
import HomeLayout from 'components/layouts/Home'
import ReferenceTable from 'components/Reference'
import { H1, H2, Container, RelativeLink as Link } from 'components/ui'

const { serverRuntimeConfig } = getConfig()


const TransactionsPage = ({
  transactionDocs,  
}: {
  transactionDocs: IItemDocs  
}) => {
  const { transactionTypes, onForkChange } = useContext(EthereumContext)

  
  const router = useRouter()

  useEffect(() => {
    const query = router.query

    if ('fork' in query) {
      onForkChange(query.fork as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  return (
    <>
      <html lang="en"></html>
      <React.Fragment>
        <Head>
          <title> EVM Codes - Transactions Types </title>
          <meta
            name="description"
            content="EVM Codes offers a reference of Transactions Types - complex
          client-side functions bundled with the Ethereum Virtual Machine for
          efficiency."
          />
        </Head>
      </React.Fragment>
      <Container className="text-sm leading-6">
        <H1>Transactions Types</H1>

        <H2 className="mb-4">Introduction</H2>
        <p className="pb-6">
          Beyond a set of opcodes, the Ethereum Virtual Machine (EVM) supports various types of transactions, 
          each with its own specific characteristics and uses. 
          These types primarily differ in how the transactions are structured and processed by the Ethereum network, 
          affecting aspects such as gas fees, gas limits, 
          and transaction prioritization.{' '}          
        </p>      
      </Container>

      <section className="py-10 md:py-20 bg-gray-50 dark:bg-black-700">
        <Container>
          <ReferenceTable
            isTransactionType
            reference={transactionTypes}
            itemDocs={transactionDocs}
            gasDocs={{}}            
          />
        </Container>
      </section>

      <section className="pt-20 pb-10 text-center">
        <ContributeBox />
      </section>
    </>
  )
}

TransactionsPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export const getStaticProps = async () => {
  const docsPath = path.join(serverRuntimeConfig.APP_ROOT, 'docs/transactions')
  
  const transactionDocs: IItemDocs = {}
  const gasDocs: IGasDocs = {}

  const docs = await readDocsFromDirectory(docsPath)

  await processDocuments(docs, docsPath, transactionDocs)

  return {
    props: {
      transactionDocs, 
      gasDocs,
    },
  }
}

async function readDocsFromDirectory(docsPath: string): Promise<string[]> {
  try {
    return fs.readdirSync(docsPath)
  } catch (error) {
    console.debug("Error reading documents directory:", error)
    return []
  }
}

async function processDocuments(docs: string[], docsPath: string, transactionDocs: IItemDocs): Promise<void> {
  await Promise.all(docs.map(async (doc) => {
    const filePath = path.join(docsPath, doc)
    if (isFile(filePath)) {
      await processDocument(filePath, transactionDocs)
    }
  }))
}

function isFile(filePath: string): boolean {
  try {
    const stat = fs.statSync(filePath)
    return stat.isFile()
  } catch (error) {
    console.debug("Error accessing file:", filePath, error)
    return false
  }
}

async function processDocument(filePath: string, transactionDocs: IItemDocs): Promise<void> {
  const transactionType = path.parse(filePath).name.toLowerCase()

  try {
    const markdownWithMeta = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(markdownWithMeta)
    const meta = data as IDocMeta
    const mdxSource = await serialize(content)

    transactionDocs[transactionType] = { meta, mdxSource }
  } catch (error) {
    console.debug("Error processing document:", filePath, error)
  }
}

export default TransactionsPage

