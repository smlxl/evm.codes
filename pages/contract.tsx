import type { NextPage } from 'next'
import Head from 'next/head'

import ContractViewer from 'components/ContractViewer'
import HomeLayout from 'components/layouts/Home'
import { Container } from 'components/ui'

const ContractPage = () => {
  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <title>EVM Codes - Contract Viewer</title>
        <meta name="description" content="EVM Codes - Contract Viewer" />
      </Head>

      <Container>
        <ContractViewer />
        <sub>
          Alpha version -{' '}
          <a href="https://twitter.com/smlxldotio">@smlxldotio</a> for feature
          requests or bug fixes
        </sub>
      </Container>
    </>
  )
}

ContractPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default ContractPage
