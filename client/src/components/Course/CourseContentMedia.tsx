'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import { MdOutlineOndemandVideo } from 'react-icons/md'

interface Lesson {
  id: string
  section: string
  title: string
  duration: number
  imageUrl: string
}

const CourseContentWithMedia = () => {
  // Demo data with images
  const demoLessons: Lesson[] = [
    { 
      id: '1', 
      section: 'Getting Started', 
      title: 'Course Introduction', 
      duration: 8,
      imageUrl: '../public/assets/worksheet1.jpg'
    },
    { 
      id: '2', 
      section: 'Getting Started', 
      title: 'Environment Setup', 
      duration: 15,
    imageUrl: '../public/assets/worksheet1.jpg'
    },
    { 
      id: '3', 
      section: 'Core Concepts', 
      title: 'Fundamental Principles', 
      duration: 25,
    imageUrl: '../public/assets/worksheet1.jpg'
    },
  ]

  // Component state
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(['Getting Started'])
  )
  const [activeLesson, setActiveLesson] = useState(0)

  // Derived data
  const courseSections = Array.from(new Set(demoLessons.map(lesson => lesson.section)))
  const activeMedia = demoLessons[activeLesson]

  // Helper functions
  const toggleSection = (section: string) => {
    const updated = new Set(visibleSections)
    updated.has(section) ? updated.delete(section) : updated.add(section)
    setVisibleSections(updated)
  }

  const formatDuration = (minutes: number) => {
    return minutes > 60 
      ? `${(minutes / 60).toFixed(1)} hours` 
      : `${minutes} minutes`
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">
      {/* Media Display Section */}
      <div className="lg:w-[60%]">
        <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
          <Image
            src={activeMedia.imageUrl}
            alt={activeMedia.title}
            fill
            className="object-cover"
            quality={100}
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h2 className="text-xl font-semibold text-white">
              {activeMedia.title}
            </h2>
            <p className="text-gray-300">
              {formatDuration(activeMedia.duration)}
            </p>
          </div>
        </div>
      </div>

      {/* Content List Section */}
      <div className="lg:w-[40%] space-y-6 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
        {courseSections.map((section) => {
          const isVisible = visibleSections.has(section)
          const sectionLessons = demoLessons.filter(lesson => lesson.section === section)
          const totalDuration = sectionLessons.reduce((sum, lesson) => sum + lesson.duration, 0)

          return (
            <div key={section} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {section}
                </h3>
                <button
                  onClick={() => toggleSection(section)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={`Toggle ${section} section`}
                >
                  {isVisible ? <BsChevronUp size={18} /> : <BsChevronDown size={18} />}
                </button>
              </div>

              {isVisible && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {sectionLessons.length} lessons • {formatDuration(totalDuration)}
                  </p>

                  {sectionLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(index)}
                      className={`p-3 rounded-lg transition-colors cursor-pointer ${
                        activeLesson === index
                          ? 'bg-blue-50 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MdOutlineOndemandVideo className="flex-shrink-0 text-blue-500 mt-1" size={20} />
                        <div>
                          <h4 className="text-base font-medium text-gray-800 dark:text-gray-100">
                            {lesson.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
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

export default CourseContentWithMedia