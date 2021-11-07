import type { NextPage } from 'next'

import Editor from 'components/Editor'
import HomeLayout from 'components/layouts/Home'
import { Container } from 'components/ui'

const PlaygroundPage = () => {
  return (
    <Container>
      <Editor />
    </Container>
  )
}

PlaygroundPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default PlaygroundPage
