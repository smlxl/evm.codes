import type { NextPage } from 'next'

import { GITHUB_REPO_URL } from 'util/constants'

import Editor from 'components/Editor'
import HomeLayout from 'components/layouts/Home'
import ReferenceTable from 'components/Reference'
import { Container, Button } from 'components/ui'

const HomePage = () => {
  return (
    <>
      <Container>
        <h1 className="text-center text-3xl max-w-3xl mx-auto font-medium leading-relaxed mb-10">
          Get a hang of Ethereum Virtual Machine{' '}
          <span className="font-semibold">Opcodes</span>,{' '}
          <span className="font-semibold">Gas</span> consumption and contract{' '}
          <span className="font-semibold">optimization</span>.
        </h1>
      </Container>

      <section className="py-20">
        <Container>
          <Editor />
        </Container>
      </section>

      <section className="py-20 bg-gray-100">
        <Container>
          <h2 className="mb-10 font-medium text-xl">Instructions reference</h2>

          <ReferenceTable />
        </Container>
      </section>

      <section className="py-20 text-center">
        <Container>
          <h2 className="mb-10 font-semibold text-2xl">
            Have ideas to make evm.codes better?
          </h2>

          <Button external href={GITHUB_REPO_URL}>
            Contribute to GitHub
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
