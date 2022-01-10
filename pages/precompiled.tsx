import { useContext } from 'react'

import type { NextPage } from 'next'
import { IOpcodeDocs, IOpcodeGasDocs } from 'types'

import { EthereumContext } from 'context/ethereumContext'

import ContributeBox from 'components/ContributeBox'
import HomeLayout from 'components/layouts/Home'
import ReferenceTable from 'components/Reference'
import { H1, H2, Container, RelativeLink as Link } from 'components/ui'

import generateDocs from './static/generateDocs'

// It seems the memory expansion computation and constants did not change since frontier, but we have to keep an eye on new fork to keep this up to date
const PrecompiledPage = ({
  opcodeDocs,
  gasDocs,
}: {
  opcodeDocs: IOpcodeDocs
  gasDocs: IOpcodeGasDocs
}) => {
  const { precompiled } = useContext(EthereumContext)

  return (
    <>
      <Container className="text-sm leading-6">
        <H1>Precompiled Contracts</H1>

        <H2 className="mb-4">Introduction</H2>
        <p className="pb-6">
          On top of having a set of opcodes to choose from, the EVM also offers
          a set of more advanced functionalities through precompiled contracts.
          These are a special kind of contracts that are bundled with the EVM at
          fixed addresses, and can be called with a determined gas cost. The
          addresses start from 1, and increment for each contract. New hardforks
          may introduce new precompiled contracts. They are called from the
          opcodes like regular contracts, with instructions like{' '}
          <Link to="#F1" title="CALL" />. The gas cost mentioned here is purely
          the cost of the contract, and does not consider the cost of the call
          itself nor the instructions to put the parameters in memory. The
          precompiled contracts are also available in the{' '}
          <Link to="playground" title="playground" />.
        </p>
        <p className="pb-6">
          For all precompiled contracts, if the input is shorter than expected,
          it is assumed to be virtually padded with zeros at the end. If the
          input is longer than expected, surplus bytes at the end are ignored.
        </p>
        <p className="pb-6">
          After the hardfork <b>Berlin</b>, all the precompiled contracts
          addresses are always considered warm. See section{' '}
          <Link to="about" title="access sets" />.
        </p>
      </Container>

      <section className="py-10 md:py-20 bg-gray-50 dark:bg-black-700">
        <Container>
          <ReferenceTable
            isPrecompiled
            opcodes={precompiled}
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

PrecompiledPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export const getStaticProps = async () => {
  const props = await generateDocs('docs/precompiled')
  return props
}

export default PrecompiledPage
