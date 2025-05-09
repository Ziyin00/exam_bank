'use client'

import React, { useState, useEffect } from 'react'
import DashboardHeader from "./DashboardHeader"
import DashboardWidgets from "./Widgets/DashboardWidgets"
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@mui/material'
import { IoMdNotificationsOutline } from 'react-icons/io'

// Demo data for initial load
const demoDashboardData = {
  userStats: {
    activeUsers: 2458,
    newUsers: 154,
    userGrowth: 12.5
  },
  salesData: {
    totalSales: 45600,
    monthlyTarget: 50000,
    topCourse: 'Advanced React'
  }
}

type Props = {
  isDashboard?: boolean;
}

const DashboardHero = ({ isDashboard }: Props) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(demoDashboardData)

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeader open={open} setOpen={setOpen} />
      
      <AnimatePresence>
        {isDashboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 lg:p-8"
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <Skeleton 
                    key={index}
                    variant="rectangular" 
                    height={150}
                    className="rounded-xl bg-opacity-20 dark:bg-gray-700"
                  />
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                {/* Quick Stats Cards */}
                <motion.div
                  variants={containerVariants}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
                >
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-2">Active Users</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">
                    {dashboardData.userStats.activeUsers.toLocaleString()}
                  </p>
                  <span className="text-green-500 text-sm mt-2">
                    +{dashboardData.userStats.userGrowth}% from last month
                  </span>
                </motion.div>

                <motion.div
                  variants={containerVariants}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
                >
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-2">Total Questions</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">
                    {dashboardData.salesData.totalSales.toLocaleString()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(dashboardData.salesData.totalSales / dashboardData.salesData.monthlyTarget) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm mt-2 block">
                    {((dashboardData.salesData.totalSales / dashboardData.salesData.monthlyTarget) * 100).toFixed(1)}% of monthly target
                  </span>
                </motion.div>

                {/* Add more stat cards here */}
              </motion.div>
            )}

            <DashboardWidgets open={open} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 lg:hidden p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        <IoMdNotificationsOutline className="text-2xl" />
        {dashboardData.userStats.newUsers > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {dashboardData.userStats.newUsers}
          </span>
        )}
      </button>
    </div>
  )
}

export default DashboardHero