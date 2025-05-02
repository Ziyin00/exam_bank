"use client"

import React, { FC, useEffect, useState } from 'react'
import { IoMdNotificationsOutline } from 'react-icons/io'
import { FiCheck } from 'react-icons/fi'
import { FaRegCommentDots } from 'react-icons/fa'
import { RiQuestionLine } from 'react-icons/ri'
import { format } from 'timeago.js'
import { motion, AnimatePresence } from 'framer-motion'
import useSound from 'use-sound'

// Demo notifications data
const demoNotifications = [
  {
    id: '1',
    title: 'New Message Received',
    message: 'You have a new message from John about the project updates.',
    date: new Date(Date.now() - 3600000),
    status: 'unread',
    type: 'message'
  },
  {
    id: '2',
    title: 'Course Update',
    message: 'The Advanced React course has been updated with new content.',
    date: new Date(Date.now() - 7200000),
    status: 'unread',
    type: 'update'
  },
  {
    id: '3',
    title: 'New Question',
    message: 'Student asked: "Can you explain the state management concept again?"',
    date: new Date(Date.now() - 86400000),
    status: 'read',
    type: 'question'
  }
]

const DashboardHeader: FC = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(demoNotifications)
  const [play] = useSound('/sounds/notification.mp3')
  
  const unreadCount = notifications.filter(n => n.status === 'unread').length

  // Simulate real-time notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => [
        {
          id: Date.now().toString(),
          title: 'New System Message',
          message: 'Scheduled maintenance will occur tonight at 2:00 AM UTC.',
          date: new Date(),
          status: 'unread',
          type: 'system'
        },
        ...prev
      ])
      play()
    }, 15000)

    return () => clearTimeout(timer)
  }, [])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, status: 'read' }
          : notification
      )
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <FaRegCommentDots className="text-blue-500" />
      case 'question':
        return <RiQuestionLine className="text-green-500" />
      case 'update':
        return <FiCheck className="text-purple-500" />
      default:
        return <IoMdNotificationsOutline className="text-yellow-500" />
    }
  }

  return (
    <div className="w-full flex items-center justify-end p-6 fixed top-5 right-0 z-50">
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative"
          aria-label="Notifications"
        >
          <IoMdNotificationsOutline className="text-2xl text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700"
            >
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount} unread messages
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b dark:border-gray-700 ${
                      notification.status === 'unread'
                        ? 'bg-blue-50 dark:bg-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {notification.title}
                          </h4>
                          {notification.status === 'unread' && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {format(notification.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {notifications.length === 0 && (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No notifications available
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DashboardHeader