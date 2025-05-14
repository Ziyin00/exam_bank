"use client"
import React, { FC } from 'react';

import DashboardHeader from '@/src/components/Admin/DashboardHeader';
import AdminSidebar from '@/src/components/Admin/sidebar/AdminSideBar';
import Profile from '@/src/components/Profile/teacher/Profile';

type Props = {}

const page: FC<Props> = (props) => {
    
    
  return (
      <>
        
          <div>
              
          <div className="flex h-[200vh] ">
          <div className='1500px:w-[16%] w-1/5 '>
                  <AdminSidebar />
              </div>
              <div className='w-[85%] '>
                      <DashboardHeader />
                      <Profile />


                  </div>
          </div>



             
              
          </div>

    </>
  )
}

export default page