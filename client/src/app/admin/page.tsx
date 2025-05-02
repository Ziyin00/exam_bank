"use client"

import DashboardHero from '@/src/components/Admin/DashboardHero'
import AdminSidebar from '@/src/components/Admin/sidebar/AdminSideBar'
import React from 'react'


type Props = {}

const page = (props: Props) => {
  return (
      <div className='bg-gradient-to-b'>
          {/* <AdminProtected > */}
              
          
          <div className="flex h-[200vh] ">
              <div className='1500px:w-[16%] w-1/5 '>
                  <AdminSidebar />
                  
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