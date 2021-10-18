import type { NextPage } from 'next'

import HomeLayout from '../components/layouts/Home'

const HomePage = () => {
  return (
    <h1 className="text-center text-3xl max-w-3xl mx-auto font-medium leading-relaxed">
      Get a hang of Ethereum Virtual Machine{' '}
      <span className="font-semibold">Opcodes</span>,{' '}
      <span className="font-semibold">Gas</span> consumption and contract{' '}
      <span className="font-semibold">optimization</span>.
    </h1>
  )
}

HomePage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default HomePage
