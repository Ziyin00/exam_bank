import React, { useState } from 'react'
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import { MdOutlineOndemandVideo } from 'react-icons/md'

interface DemoLesson {
  id: string
  section: string
  title: string
  duration: number
}

const CourseContentList = () => {
  // Demo course content data
  const demoLessons: DemoLesson[] = [
    { id: '1', section: 'Getting Started', title: 'Course Introduction', duration: 8 },
    { id: '2', section: 'Getting Started', title: 'Environment Setup Guide', duration: 15 },
    { id: '3', section: 'Core Concepts', title: 'Fundamental Principles', duration: 25 },
    { id: '4', section: 'Core Concepts', title: 'Advanced Techniques', duration: 35 },
    { id: '5', section: 'Practice', title: 'Hands-on Workshop', duration: 45 }
  ]

  // State management
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(['Getting Started'])
  )
  const [activeLesson, setActiveLesson] = useState(0)
  
  // Derived data
  const courseSections = Array.from(new Set(demoLessons.map(lesson => lesson.section)))

  // Section visibility toggle
  const toggleSection = (section: string) => {
    const updatedVisibility = new Set(visibleSections)
    updatedVisibility.has(section) 
      ? updatedVisibility.delete(section)
      : updatedVisibility.add(section)
    setVisibleSections(updatedVisibility)
  }

  // Duration formatting helper
  const formatDuration = (minutes: number) => {
    if (minutes > 60) return `${(minutes / 60).toFixed(1)} hours`
    return `${minutes} minutes`
  }

  return (
    <div className="w-full sticky top-24 space-y-6">
      {courseSections.map((section) => {
        const isVisible = visibleSections.has(section)
        const sectionLessons = demoLessons.filter(lesson => lesson.section === section)
        const totalSectionDuration = sectionLessons.reduce((sum, lesson) => sum + lesson.duration, 0)

        return (
          <div key={section} className="border-b border-gray-200 dark:border-gray-700 pb-4">
            {/* Section Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {section}
              </h3>
              <button
                onClick={() => toggleSection(section)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isVisible ? <BsChevronUp size={18} /> : <BsChevronDown size={18} />}
              </button>
            </div>

            {/* Section Summary */}
            {isVisible && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {sectionLessons.length} lessons • {formatDuration(totalSectionDuration)}
                </p>

                {/* Lessons List */}
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
  )
}

export default CourseContentList