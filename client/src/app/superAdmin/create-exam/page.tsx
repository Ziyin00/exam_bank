"use client"
import DashboardHeader from '@/src/components/Admin/DashboardHeader';
import CreateExam from '@/src/components/Admin/Exam/CreateExam';
import AdminSidebar from '@/src/components/Admin/sidebar/AdminSideBar';
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
                      <CreateExam />
              </div>
          </div>



             
              
          </div>

    </div>
  )
}

export default page