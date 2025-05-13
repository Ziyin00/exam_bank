import CourseDetailsPage from '@/src/components/Course/CourseDetailsPage';
import Footer from '@/src/components/Footer';
import Navbar from '@/src/components/Navbar';
import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <div>
      <Navbar />
      <CourseDetailsPage />
      <Footer/>
    </div>
  )
}

export default page;