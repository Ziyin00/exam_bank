"use client"

import DashboardHero from '@/src/components/Admin/DashboardHero'

import AdminSideBar from '@/src/components/superAdmin/sidebar/AdminSideBar'
import React from 'react'


type Props = {}

const page = (props: Props) => {
  return (
      <div className='bg-gradient-to-b'>
          {/* <AdminProtected > */}
              
          
          <div className="flex h-[200vh] ">
              <div className='1500px:w-[16%] w-1/5 '>
                  <AdminSideBar />
                  
              </div>
              <div className='w-[85%] '>
                      <DashboardHero isDashboard={ true} />
              </div>
          </div>
          {/* </AdminProtected> */}
    </div>
  )
}

export default page