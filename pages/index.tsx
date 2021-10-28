import type { NextPage } from 'next'

import { GITHUB_REPO_URL } from 'util/constants'

import HomeLayout from 'components/layouts/Home'
import ReferenceTable from 'components/Reference'
import { H1, H2, Container, Button } from 'components/ui'

const HomePage = () => {
  return (
    <>
      <Container>
        <H1>
          Get a hang of Ethereum Virtual Machine{' '}
          <span className="font-semibold">Opcodes</span>,{' '}
          <span className="font-semibold">Gas</span> consumption and contract{' '}
          <span className="font-semibold">optimization</span>.
        </H1>
      </Container>

      <section className="py-20 bg-gray-100">
        <Container>
          <H2 className="mb-10">Instructions reference</H2>
          <ReferenceTable />
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

export default HomePage
