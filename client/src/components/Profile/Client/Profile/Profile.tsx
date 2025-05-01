'use client'

import React, { FC, useEffect, useState } from 'react'
import SideBarProfile from './SideBarProfile'

import { signOut } from 'next-auth/react'
import ProfileInfo from './ProfileInfo'
import ChangePassword from './ChangePassword'
import CourseCard from '@/src/components/Course/CourseCard'


type Props = {
  user: any;
}

const Profile: FC<Props> = ({ user }) => {
  const [scroll, setScroll] = useState(false)
  const [avatar, setAvatar] = useState(user?.avatar?.url || '')
  const [logout, setLogout] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [active, setActive] = useState(1) // Added active state
  

  // Scroll handler with cleanup
  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 85)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])



  const logoutHandler = async () => {
    try {
      setLogout(true)
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className='w-[85%] flex mx-auto'>
      {/* Sidebar */}
      <div className={`w-[60px] lg:w-[310px] h-[450px] dark:bg-slate-900 bg-white bg-opacity-90 border dark:border-[#ffffff1d] border-[#ffffff0f] rounded-[5px] shadow-xl dark:shadow-sm mt-[80px] mb-[80px] sticky ${
        scroll ? "top-[120px]" : "top-[30px]"
      } left-[30px]`}>
        <SideBarProfile
          user={user}
          active={active}
          avatar={avatar}
          setActive={setActive}
          logoutHandler={logoutHandler}
        />
      </div>

      {/* Main Content */}
      <div className='flex-1'>
        {active === 1 && (
          <div className='w-full h-full bg-transparent mt-[80px]'>
            <ProfileInfo avatar={avatar} user={user} />
          </div>
        )}

        {active === 2 && (
          <div className='w-full h-full bg-transparent mt-[80px]'>
            <ChangePassword user={user} /> {/* Added user prop */}
          </div>
        )}

        {active === 3 && (
          <div className='w-full h-full bg-transparent mt-[80px]'>
            <div className="w-full pl-7 px-2 lg:px-10 lg:pl-8">
            
                <div className="text-center">Loading courses...</div>
           
                <>
                  <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((item: any) => (
                      <CourseCard 
                        key={item._id}
                         
                         
                       
                      />
                    ))}
                  </div>
                  {courses.length === 0 && (
                    <h1 className='text-center text-[20px] font-Poppins'>
                      You don&apos;t have any purchased courses!
                    </h1>
                  )}
                </>
           
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile



















// "use client"

// import React, { FC, useEffect, useState } from 'react'
// import SideBarProfile from './SideBarProfile'
// import { useLogOutQuery } from '@/redux/features/auth/authApi';
// import { signOut } from 'next-auth/react';
// import ProfileInfo from './ProfileInfo';
// import ChangePassword from './ChangePassword';
// import CourseCard from '../Course/CourseCard';
// import { useGetAllCoursesQuery } from '@/redux/features/courses/coursesApi';
// type Props = {

//   user: any;
// }

// const Profile: FC<Props> = ({user}) => {
//   const [scroll, setScroll] = useState(false);
//   const [avatar, setAvatar] = useState(user?.avatar)
//   const [logout, setLogout] = useState(false);
//   const [courses, setCourses] = useState([]);
//   const { data, isLoading } = useGetAllCoursesQuery(undefined, {}); 
  
//   const { } = useLogOutQuery(undefined, {
//     skip: !logout ? true : false,
//   })
//   const [active, setActive] = useState(1)
//   const logoutHandler = async() => {
//     setLogout(true)
//     await signOut();
//   }

//   if (typeof window !== 'undefined') {
//     window.addEventListener('scroll', () => {
//       if (window.scrollY > 85) {
//         setScroll(true)
//       } else {
//         setScroll(false)
//       }
//     })
//   };

//   useEffect(() => {
//          if (data) {
//            const filteredCourses = user.courses.map((userCourse: any) => 
//              data.courses.find((course: any) => course._id === userCourse._id) ).filter((course: any) => course !== undefined);
//            setCourses(filteredCourses)
//          }
//   },[data, user.courses])
//   return (
//     <div className='w-[85%] flex mx-auto '>
//       <div className={`w-[60px] lg:w-[310px] h-[450px] dark:bg-slate-900 bg-white bg-opacity-90 border dark:border-[#ffffff1d] border-[#ffffff0f] rounded-[5px] shadow-xl dark:shadow-sm mt-[80px] mb-[80px] sticky ${scroll ? "top-[120px] " : "top-[30px] "} left-[30px] `}>
        
//         <SideBarProfile
//           user={user}
//           active={active}
//           avatar={avatar}
//           setActive={setActive}
//           logoutHandler={logoutHandler}
//         />


//       </div>
//         {
//         active === 1 && (
//           <div className='w-full h-full bg-transparent mt-[80px] '>

//             <ProfileInfo avatar={avatar} user={user} />
//           </div>
//           )
//         }
      
//       {
//         active === 2 && (
//           <div className='w-full h-full bg-transparent mt-[80px] '>

//             <ChangePassword avatar={avatar} user={user} />
//           </div>
//           )
//       }

// {
//         active === 3 && (
//           <div className='w-full h-full bg-transparent mt-[80px] '>

//             <div className="w-full pl-7 px-2 lg:px-10 lg:pl-8">
//               <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-2 lg:gap-[30px] xl:grid-cols-3 xl:gap-[35px] ">
//                 {
//                   courses && courses.map((item: any, index: number) => (
//                     <CourseCard item={item} key={index} user={ user} isProfile={true} />
//                   ))}
//               </div>
//               {courses.length === 0 && (
//                 <h1 className='text-center text-[20px] font-Poppins'>
//                   You don&apos;t have any purchased courses!
//                 </h1>
//               )}
              
//           </div>
//           </div>
//           )
//       }
      
//     </div>
//   )
// }

// export default Profile