import React from 'react';

import DashboardHero from '@/src/components/Admin/DashboardHero';
import AdminSideBar from '@/src/components/superAdmin/sidebar/AdminSideBar';
import AllCourses from '@/src/components/superAdmin/Course/AllCourses';

type Props = {}

const page = (props: Props) => {
  return (
    <div className='bg-gradient-to-b'>
    {/* <AdminProtected > */}
        
  
    <div className="flex h-screen ">
        <div className='1500px:w-[16%] w-1/5 '>
            <AdminSideBar />
            
        </div>
        <div className='w-[85%] -mt-[680px]'>
                      <DashboardHero />
                      <AllCourses />
        </div>
    </div>
    {/* </AdminProtected> */}
</div>
  )
}

export default page