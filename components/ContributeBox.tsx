import React from 'react'

import { GITHUB_REPO_URL } from 'util/constants'

import { H2, Container, Button } from 'components/ui'

const ContributeBox = () => {
  return (
    <Container>
      <H2 className="mb-10">Have ideas to make evm.codes better?</H2>
      <Button external href={GITHUB_REPO_URL}>
        Contribute on GitHub
      </Button>
    </Container>
  )
}

export default ContributeBox
