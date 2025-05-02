"use client"
import EditFaq from '@/src/components/Admin/Customization/EditFaq'
import DashboardHeader from '@/src/components/Admin/DashboardHeader'
import AdminSidebar from '@/src/components/Admin/sidebar/AdminSideBar'
import React, { FC } from 'react'






type Props = {}

const page: FC<Props> = (props) => {
    
    
  return (
      <div className='bg-gradient-to-b'>
        
          <div>
              
          <div className="flex h-[200vh] ">
          <div className='1500px:w-[16%] w-1/5 '>
                  <AdminSidebar />
              </div>
              <div className='w-[85%] '>
                  <DashboardHeader />
                      <EditFaq />
              </div>
          </div>



             
              
          </div>

    </div>
  )
}

export default page