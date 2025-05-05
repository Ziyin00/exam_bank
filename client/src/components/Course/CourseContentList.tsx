'use client'
import React, { useEffect, useState } from 'react'
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import { MdOutlineOndemandVideo } from 'react-icons/md'

interface Lesson {
  _id: string
  section: string
  title: string
  duration: number
}

interface CourseContentListProps {
  contents: any[]
  activeIndex: number
  setActiveIndex: (index: number) => void
}

const CourseContentList = ({ contents, activeIndex, setActiveIndex }: CourseContentListProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  // Fetch lessons data
  useEffect(() => {
    const fetchLessons = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cours/${contents[activeIndex]._id}`)
      const data = await res.json()
      setLessons(data)

      // Optionally expand first section
      if (data.length > 0) {
        setVisibleSections(new Set([data[0].section]))
      }
    }

    if (contents.length > 0) {
      fetchLessons()
    }
  }, [activeIndex, contents])

  const toggleSection = (section: string) => {
    const updated = new Set(visibleSections)
    updated.has(section) ? updated.delete(section) : updated.add(section)
    setVisibleSections(updated)
  }

  const formatDuration = (minutes: number) =>
    minutes > 60 ? `${(minutes / 60).toFixed(1)} hours` : `${minutes} minutes`

  const courseSections = Array.from(new Set(lessons.map(lesson => lesson.section)))

  return (
    <div>
      {courseSections.map((section) => {
        const isVisible = visibleSections.has(section)
        const sectionLessons = lessons.filter(lesson => lesson.section === section)

        return (
          <div key={section}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">{section}</h3>
              <button
                onClick={() => toggleSection(section)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isVisible ? <BsChevronUp size={18} /> : <BsChevronDown size={18} />}
              </button>
            </div>
            {isVisible && (
              <div>
                <p className="text-sm text-gray-600">{sectionLessons.length} lessons</p>
                {sectionLessons.map((lesson) => (
                  <div
                    key={lesson._id}
                    onClick={() => setActiveIndex(lesson._id)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <MdOutlineOndemandVideo className="text-blue-500" size={20} />
                    <div>
                      <h4>{lesson.title}</h4>
                      <p>{formatDuration(lesson.duration)}</p>
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
