"use client"
import OrdersAnalytics from '@/src/components/Admin/Analytics/OrdersAnalytics'
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
                      <OrdersAnalytics />
              </div>
          </div>



             
              
          </div>

    </div>
  )
}

export default page