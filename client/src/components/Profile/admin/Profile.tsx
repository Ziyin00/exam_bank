'use client'

import React, { FC, useEffect, useState } from 'react'
import SideBarProfile from './SideBarProfile'
import { signOut } from 'next-auth/react'
import ProfileInfo from './ProfileInfo'
import ChangePassword from './ChangePassword'
import CourseCard from '@/src/components/Course/CourseCard'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { FiSettings, FiBook, FiUsers } from 'react-icons/fi'

interface Props {
  user: any
}

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
      progress: 65,
      ratings: 4.8,
      estimatedLength: "15 hours",
      instructor: "John Doe",
      price: 49.99
    },
    {
      _id: "2",
      name: "Advanced JavaScript",
      thumbnail: "/demo-course-js.jpg",
      purchasedDate: "2024-02-15",
      progress: 40,
      ratings: 4.7,
      estimatedLength: "10 hours",
      instructor: "Jane Smith",
      price: 39.99
    }
  ]
};

const Profile: FC<Props> = ({ user }) => {
  const [scroll, setScroll] = useState(false)
  const [avatar, setAvatar] = useState(user?.avatar?.url || '/demo-avatar.jpg')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [active, setActive] = useState(1)
  
  const currentUser = user || DEMO_USER;

  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY > 85)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (currentUser.courses) {
      setCourses(currentUser.courses)
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-[85%] flex flex-col lg:flex-row mx-auto gap-8 pt-24 pb-12">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full lg:w-[300px] flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-indigo-100 dark:border-gray-700 sticky top-6 h-fit"
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
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white ml-6">
                    Your Learning Journey
                  </h2>
                  <div className="flex items-center gap-4 text-indigo-600 dark:text-indigo-400">
                    <FiUsers className="text-xl" />
                    <span>{courses.length} Enrolled Courses</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-6">
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
                      <div className="text-6xl mb-4 text-indigo-500">🎓</div>
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        No Courses Purchased Yet!
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Start your learning adventure with our curated courses
                      </p>
                      <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
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