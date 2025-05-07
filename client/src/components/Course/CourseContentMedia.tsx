'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import { MdOutlineOndemandVideo } from 'react-icons/md'

interface Lesson {
  _id: string
  section: string
  title: string
  duration: number
  imageUrl: string
}

interface CourseContentMediaProps {
  courseId: string
}

const CourseContentMedia = ({ courseId }: CourseContentMediaProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [activeLesson, setActiveLesson] = useState(0)

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/student/get-course-content/${courseId}`
        )
        
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        
        const { data } = await res.json()
        const formattedLessons = data.map((lesson: any) => ({
          _id: lesson.id.toString(),
          section: lesson.department_name.trim(),
          title: lesson.title,
          duration: lesson.year * 30, // Convert year to approximate minutes
          imageUrl: lesson.image || '/default-lesson.jpg'
        }))

        setLessons(formattedLessons)
        if (formattedLessons.length > 0) {
          setVisibleSections(new Set([formattedLessons[0].section]))
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course content')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseContent()
  }, [courseId])

  const toggleSection = (section: string) => {
    const updated = new Set(visibleSections)
    updated.has(section) ? updated.delete(section) : updated.add(section)
    setVisibleSections(updated)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return hours > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${remainingMinutes}m`
  }

  const courseSections = Array.from(new Set(lessons.map(lesson => lesson.section)))
  const activeMedia = lessons[activeLesson]

  if (loading) return (
    <div className="text-center py-10">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course content...</p>
    </div>
  )

  if (error) return (
    <div className="text-center py-10 text-red-500">
      Error: {error}
    </div>
  )

  if (!lessons.length) return (
    <div className="text-center py-10 text-gray-600 dark:text-gray-400">
      No lessons available for this course.
    </div>
  )

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">
      {/* Media Preview Section */}
      <div className="lg:w-[60%]">
        <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
          <Image
            src={activeMedia.imageUrl.startsWith('/') 
              ? activeMedia.imageUrl 
              : `${process.env.NEXT_PUBLIC_IMAGE_BASE}/${activeMedia.imageUrl}`}
            alt={activeMedia.title}
            fill
            className="object-cover"
            quality={100}
            priority
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-lesson.jpg'
            }}
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <h2 className="text-xl font-semibold text-white mb-1">
              {activeMedia.title}
            </h2>
            <p className="text-gray-300 text-sm">
              {formatDuration(activeMedia.duration)}
            </p>
          </div>
        </div>
      </div>

      {/* Lessons Navigation */}
      <div className="lg:w-[40%] space-y-6 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
        {courseSections.map((section) => {
          const isVisible = visibleSections.has(section)
          const sectionLessons = lessons.filter(lesson => lesson.section === section)
          const totalDuration = sectionLessons.reduce((sum, l) => sum + l.duration, 0)

          return (
            <div key={section} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {section}
                </h3>
                <button
                  onClick={() => toggleSection(section)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label={`${isVisible ? 'Collapse' : 'Expand'} ${section} section`}
                >
                  {isVisible ? <BsChevronUp size={18} /> : <BsChevronDown size={18} />}
                </button>
              </div>

              {isVisible && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {sectionLessons.length} lessons • {formatDuration(totalDuration)}
                  </div>

                  {sectionLessons.map((lesson, index) => (
                    <div
                      key={lesson._id}
                      onClick={() => setActiveLesson(lessons.findIndex(l => l._id === lesson._id))}
                      className={`p-3 rounded-lg transition-colors cursor-pointer ${
                        activeLesson === index
                          ? 'bg-blue-50 border-blue-200 dark:bg-gray-700 dark:border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                      } border`}
                    >
                      <div className="flex items-start gap-3">
                        <MdOutlineOndemandVideo 
                          className={`flex-shrink-0 mt-1 ${
                            activeLesson === index 
                              ? 'text-blue-500' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`} 
                          size={20} 
                        />
                        <div>
                          <h4 className={`text-base ${
                            activeLesson === index
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-800 dark:text-gray-100'
                          } font-medium`}>
                            {lesson.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {formatDuration(lesson.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CourseContentMedia