
import DashboardHero from '@/src/components/Admin/DashboardHero'
import AdminSidebar from '@/src/components/Admin/sidebar/AdminSideBar'
import AllUsers from '@/src/components/Admin/Users/AllUsers'
import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <div className='bg-gradient-to-b'>
    {/* <AdminProtected> */}
        
    
    <div className="flex h-screen ">
        <div className='1500px:w-[16%] w-1/5 '>
            <AdminSidebar />
            
        </div>
        <div className='w-[85%] '>
                      <DashboardHero />
            <AllUsers isTeam={false}  />
        </div>
    </div>
    {/* </AdminProtected> */}
</div>
  )
}

export default page