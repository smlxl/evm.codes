import type { NextPage } from 'next'
import Head from 'next/head'

import ContractViewer from 'components/ContractViewer'
import HomeLayout from 'components/layouts/Home'
import { Container } from 'components/ui'

import { useRouter } from 'next/router'

const ContractPage = () => {
  const router = useRouter()
  const { addr } = router?.query
  console.log('addr:', addr)

  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <title>EVM Codes - Contract Viewer</title>
        <meta
          name="description"
          content="EVM Codes - Contract Viewer"
        />
      </Head>

      <Container>
        <ContractViewer />
      </Container>
    </>
  )
}

ContractPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default ContractPage
