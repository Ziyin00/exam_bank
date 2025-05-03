import Footer from '@/src/components/Footer'
import Navbar from '@/src/components/Navbar'
import Profile from '@/src/components/Profile/Client/Profile/Profile'

import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
      <div>
          <Navbar />
          <Profile />
          <Footer />
    </div>
  )
}

export default page