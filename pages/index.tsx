import type { NextPage } from 'next'
import { IOpcodeDocs, IOpcodeGasDocs } from 'types'

import { GITHUB_REPO_URL } from 'util/constants'

import HomeLayout from 'components/layouts/Home'
import ReferenceTable from 'components/Reference'
import { H1, H2, Container, Button } from 'components/ui'

import { opcodeDocsProps } from './serverProps'

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

export const getServerSideProps = opcodeDocsProps

export default HomePage
