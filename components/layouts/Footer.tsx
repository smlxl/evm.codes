import { GITHUB_REPO_URL } from 'util/constants'

import Container from 'components/ui/Container'

const Footer = () => {
  return (
    <footer className="border-t py-6">
      <Container>
        <div className="flex justify-between text-tiny">
          <div>
            <span>
              Brought to you by{' '}
              <a href="https://comitylabs.com" target="_blank" rel="noreferrer">
                Comity Labs
              </a>
              .
            </span>

            <span className="mx-4">
              Powered by{' '}
              <a href="" target="_blank">
                EthereumJS
              </a>
              .
            </span>
          </div>

          <div>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
