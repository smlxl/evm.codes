import type { ReactElement, ReactNode } from 'react'

import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

import { EthereumProvider } from 'context/ethereumContext'

import '../styles/globals.css'
import '../styles/highlight/atom-one-light.css'

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function Main({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <EthereumProvider>
      {getLayout(<Component {...pageProps} />)}
    </EthereumProvider>
  )
}
export default Main
