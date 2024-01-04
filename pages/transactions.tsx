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

// It seems the memory expansion computation and constants did not change since frontier, but we have to keep an eye on new fork to keep this up to date
const TransactionsPage = ({
  transactionDocs,  
}: {
  transactionDocs: IItemDocs  
}) => {
  const { transactionTypes, onForkChange } = useContext(EthereumContext)

  // Change selectedFork according to query param
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
  const docs = fs.readdirSync(docsPath)

  const transactionDocs = {}; 

  await Promise.all(
    docs.map(async (doc) => {
      const filePath = path.join(docsPath, doc);
      const stat = fs.statSync(filePath);
      const transactionType = path.parse(doc).name.toLowerCase();

      try {
        if (stat.isFile()) {
          const markdownWithMeta = fs.readFileSync(filePath, 'utf-8');
          const { data, content } = matter(markdownWithMeta);
          const meta = data as IDocMeta;
          const mdxSource = await serialize(content);

          transactionDocs[transactionType] = {
            type: transactionType,
            meta,
            mdxSource,
          };
        }
      } catch (error) {
        console.debug("Couldn't read the Markdown doc for the transaction type", error);
      }
    }),
  );

  return {
    props: {
      transactionDocs, 
    },
  };
};

export default TransactionsPage;

