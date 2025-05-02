'use client'

import React, { FC, useEffect, useState } from 'react'
import SideBarProfile from './SideBarProfile'
import { signOut } from 'next-auth/react'
import ProfileInfo from './ProfileInfo'
import ChangePassword from './ChangePassword'
import CourseCard from '@/src/components/Course/CourseCard'
// import { Loader } from '@/src/components/Loader/Loader'
// import { useGetAllCoursesQuery } from '@/redux/features/courses/coursesApi'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { FiSettings, FiBook, FiUsers } from 'react-icons/fi'

// Demo data configuration
const DEMO_USER = {
  name: "Sarah Johnson",
  email: "sarah@demo.com",
  avatar: {
    url: "/demo-avatar.jpg"
  },
  role: "student",
  courses: [
    {
      _id: "1",
      name: "Web Development Bootcamp",
      thumbnail: "/demo-course-web.jpg",
      purchasedDate: "2024-03-01",
      progress: 65
    },
    {
      _id: "2",
      name: "Advanced JavaScript",
      thumbnail: "/demo-course-js.jpg",
      purchasedDate: "2024-02-15",
      progress: 40
    }
  ]
};

const Profile: FC<Props> = ({ user }) => {
  const [scroll, setScroll] = useState(false)
  const [avatar, setAvatar] = useState(user?.avatar?.url || '/demo-avatar.jpg')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [active, setActive] = useState(1)
  
  // Use demo data if real user isn't available
  const currentUser = user || DEMO_USER;

  // const { data: coursesData, isLoading } = useGetAllCoursesQuery({})

  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY > 85)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (currentUser.courses) {
      const userCourses = currentUser.courses.map((userCourse: any) => ({
        ...userCourse,
        // Add demo course details
        ratings: 4.8,
        estimatedLength: "15 hours",
        instructor: "John Doe",
        price: 49.99
      }));
      setCourses(userCourses)
    }
  }, [currentUser.courses])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
    } catch (error) {
      toast.error('Logout failed. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-[85%] flex flex-col lg:flex-row mx-auto gap-8 pt-24 pb-12">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`w-full lg:w-[300px] flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl backdrop-blur-lg border border-gray-200 dark:border-gray-700 sticky top-6 h-fit`}
        >
          <SideBarProfile
            user={currentUser}
            active={active}
            avatar={avatar}
            setActive={setActive}
            logoutHandler={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1">
          <motion.div
            key={active}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3 }}
          >
            {active === 1 && (
              <ProfileInfo 
                avatar={avatar} 
                user={currentUser} 
                onAvatarChange={(newAvatar: string) => setAvatar(newAvatar)}
              />
            )}

            {active === 2 && <ChangePassword user={currentUser} />}

            {active === 3 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white ml-10">
                    Your Learning Journey
                  </h2>
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                    <FiUsers className="text-xl" />
                    <span>{courses.length} Enrolled Courses</span>
                  </div>
                </div>
                
               
                  {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl h-96" />
                    ))}
                  </div> */}
              
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-10">
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <CourseCard
                          key={course._id}
                          course={course}
                          isProfile={true}
                        />
                      ))
                    ) : (
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="col-span-full text-center py-12 space-y-4"
                      >
                        <div className="text-6xl mb-4">🎓</div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                          No Courses Purchased Yet!
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          Start your learning adventure with our curated courses
                        </p>
                        <button className="bg-gary-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                          Browse Courses
                        </button>
                      </motion.div>
                    )}
                  </div>
              
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile