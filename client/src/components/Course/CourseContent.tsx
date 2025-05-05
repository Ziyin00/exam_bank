'use client'
import React, { useEffect, useState } from "react"
import Navbar from "../Navbar"
import CourseContentMedia from "./CourseContentMedia"
import CourseContentList from "./CourseContentList"

interface CourseContentInterface {
  _id: string
  title: string
  description: string
  imageUrl: string
  tags: string[]
  links: { title: string; url: string }[]
  questions: any[]
  reviews: any[]
}

const CourseContent = () => {
  const [contents, setContents] = useState<CourseContentInterface[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch course content data
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/preview`)
        if (!res.ok) throw new Error('Failed to fetch course content')
        const data = await res.json()
        setContents(data)
      } catch (err: any) {
        setError(err.message || 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  const activeContent = contents[activeIndex]

  if (loading) return <div className="text-center py-10">Loading...</div>
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>
  if (!contents.length) return <div className="text-center py-10">No content found.</div>

  return (
    <div className="w-full">
      <Navbar />
      <div className="w-full grid 800px:grid-cols-10">
        <div className="col-span-7">
          <CourseContentMedia lesson={activeContent} />
        </div>

        <div className="hidden 800px:block 800px:col-span-3">
          <CourseContentList
            contents={contents}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        </div>
      </div>
    </div>
  )
}

export default CourseContent
