import Document, { Head, Html, Main, NextScript } from 'next/document'

import Remix from '../components/ui/vector/Remix'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=optional"
            rel="stylesheet"
          ></link>
        </Head>
        <body>
          <div id="remix">
            <Remix />
          </div>

          <Main />

          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
