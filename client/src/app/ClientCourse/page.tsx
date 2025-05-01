import CourseDetailsPage from '@/src/components/Course/CourseDetailsPage';
import Navbar from '@/src/components/Navbar';
import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <div>
      <Navbar />
      <CourseDetailsPage />
    </div>
  )
}

export default page;