// import SignUp from '@/components/auth/Signup'
// import Navbar from '@/components/Navbar'
import SignUp from '@/src/components/auth/Signup'
import Navbar from '@/src/components/Navbar'
import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <div>
      <Navbar/>
       <SignUp />   
    </div>
  )
}

export default page