import type { NextPage } from 'next'

import Editor from 'components/Editor'
import HomeLayout from 'components/layouts/Home'
import { H1, Container } from 'components/ui'

const PlaygroundPage = () => {
  return (
    <Container>
      <H1>Playground</H1>

      <Editor />
    </Container>
  )
}

PlaygroundPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default PlaygroundPage
