import Image from 'next/image';
import React, { FC } from 'react'
import avatarDefualt from '../../../../../public/assets/avatar.jpg'
import { RiLockPasswordLine } from "react-icons/ri";
import { SiCoursera } from "react-icons/si";
import { AiOutlineLogout } from "react-icons/ai";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import Link from 'next/link';


type Props = {
    user: any;
    active: number;
    avatar: string | null;
    setActive: (active: number) => void;
    logoutHandler: any;
}

const SideBarProfile : FC<Props> = ({user,active,avatar,setActive,logoutHandler}) => {
  return (
      <div className='w-full'>
          <div
              className={`w-full flex items-center px-3 py-4 cursor-pointer ${active === 1 ? "dark:bg-gray-800 bg-gray-700 text-white" : "bg-transparent"} `}
              onClick={() => setActive(1)}
          >
              <Image
                  src={avatarDefualt}
                  width={20}
                  height={20}
                  alt='avatar'
                  className='w-[30px] h-[20px] lg:h-[30px] cursor-pointer rounded-full'
              />
              <h5 className='pl-2 lg:block hidden dark:text-white  font-Poppins'>
                  My Account
              </h5>
          </div>

          <div
              className={`w-full items-center flex px-3 py-4 cursor-pointer ${active === 2 ? "dark:bg-slate-800 bg-gray-700 text-white" : "bg-transparent"} `}
              onClick={() => setActive(2)}
          >
              <RiLockPasswordLine size={20} className="dark:text-white" />
              <h5 className='pl-2 lg:block hidden dark:text-white  font-Poppins'>
                  Change Password
              </h5>
              
          </div>

          <div
              className={`w-full items-center flex pl-3 py-4 cursor-pointer ${active === 3 ? "dark:bg-slate-800 bg-gray-700 text-white" : "bg-transparent"} `}
              onClick={() => setActive(3)}
          >
              <SiCoursera size={20} className="dark:text-white" />
              <h5 className='pl-2 lg:block hidden dark:text-white  font-Poppins'>
                  Enrolled Courses
              </h5>
              
          </div>

          {
              user?.role === "admin" && (
                  <Link
                        href="/admin"
                        
                className={`w-full items-center flex pl-3 py-4 cursor-pointer ${active === 6 ? "dark:bg-slate-800 bg-gray-700 text-white" : "bg-transparent"} `}
                
            >
                <MdOutlineAdminPanelSettings size={20} className="dark:text-white " />
                <h5 className='pl-2 lg:block hidden dark:text-white  font-Poppins'>
                  Admin Dashboard
                </h5>
                
                  </Link>
               
              )
                    
          }

        

          <div
              className={`w-full items-center flex px-3 py-4 cursor-pointer ${active === 4 ? "dark:bg-slate-800 bg-white" : "bg-transparent"} `}
              onClick={ () => logoutHandler()}
          >
              <AiOutlineLogout size={20} className="dark:text-white text-black" />
              <h5 className='pl-2 lg:block hidden dark:text-white text-black font-Poppins'>
                  Log Out
              </h5>
              
          </div>
          
    </div>
  )
}

export default SideBarProfile