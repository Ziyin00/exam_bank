"use client"
import Answer from '@/src/components/Admin/Answer/Answer';
import DashboardHeader from '@/src/components/Admin/DashboardHeader';
import AdminSideBar from '@/src/components/superAdmin/sidebar/AdminSideBar';
import React, { FC } from 'react'






type Props = {}

const page: FC<Props> = ({ params }: any) => {
    
    const id = params.id;
  return (
      <div className='bg-gradient-to-b'>
          
          <div>
              
          <div className="flex h-[200vh] ">
          <div className='1500px:w-[16%] w-1/5 '>
                  <AdminSideBar />
              </div>
              <div className='w-[85%] '>
                  <DashboardHeader />
                      <Answer />
              </div>
          </div>



             
              
          </div>

    </div>
  )
}

export default page