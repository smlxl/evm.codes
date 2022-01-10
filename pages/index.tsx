import { useContext } from 'react'

import type { NextPage } from 'next'
import { IOpcodeDocs, IOpcodeGasDocs } from 'types'

import { EthereumContext } from 'context/ethereumContext'

import ContributeBox from 'components/ContributeBox'
import HomeLayout from 'components/layouts/Home'
import ReferenceTable from 'components/Reference'
import { H1, Container } from 'components/ui'

import generateDocs from './static/generateDocs'

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
  const props = await generateDocs('docs/opcodes')
  return props
}

export default HomePage
