"use client"
import CreateCourse from '@/src/components/Admin/Course/CreateCourse'
import DashboardHeader from '@/src/components/Admin/DashboardHeader'
import AdminSidebar from '@/src/components/Admin/sidebar/AdminSideBar'
import React from 'react'



type Props = {}

const page = (props: Props) => {
  return (
      <div className='bg-gradient-to-b'>
         
          <div>
              
          <div className="flex h-[200vh] ">
          <div className='1500px:w-[16%] w-1/5 '>
                  <AdminSidebar />
              </div>
              <div className='w-[85%] '>
                  <DashboardHeader />
                  <CreateCourse/>
              </div>
          </div>



             
              
          </div>

    </div>
  )
}

export default page