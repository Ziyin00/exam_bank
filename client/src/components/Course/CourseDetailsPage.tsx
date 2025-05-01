'use client'

import React, { useState } from "react";
import Ratings from "@/utils/Ratings";
// import CoursePlayer from "./CoursePlayer";
import CourseContentList from "./CourseContentList";
import Image from "next/image";
import avatar from "../../../public/assets/avatar.jpg";
import { VscVerifiedFilled } from "react-icons/vsc";
import CourseImagePlayer from "@/utils/CourseImage";

const CourseDetailsPage = () => {
  // Demo data
  const demoCourse = {
    name: "Data Structure and Algorithm Practical Questions",
    ratings: 4.5,
    reviews: [
      {
        user: { name: "John Doe", avatar: null },
        rating: 4,
        comment: "Great course for beginners!",
        createdAt: "2024-03-15",
        commentReplies: []
      }
    ],
    price: 29.99,
    estimatedPrice: 99.99,
    benefits: [
      { title: "Full-stack development skills" },
      { title: "Build real-world projects" }
    ],
    prerequisites: [
      { title: "Basic computer knowledge" },
      { title: "No coding experience required" }
    ],
    courseData: [
      { title: "Introduction to HTML", videoLength: 15 },
      { title: "CSS Fundamentals", videoLength: 25 }
    ],
    description: `Learn web development from scratch with this comprehensive bootcamp. 
    Build modern websites and applications using the latest technologies.`,
    demoUrl: "https://example.com/demo-video.mp4"
  };

  const [open, setOpen] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const demoUser = { name: "Demo User", avatar: null };

//   const discountPercentage = ((demoCourse.estimatedPrice - demoCourse.price) / demoCourse.estimatedPrice * 100).toFixed(0);

  return (
    <div className="w-[90%] m-auto py-5">
      <div className="w-full flex flex-col 800px:flex-row gap-8">
        {/* Left Section */}
        <div className="w-full 800px:w-[65%]">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {demoCourse.name}
          </h1>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <Ratings rating={demoCourse.ratings} />
              <span className="text-gray-600 dark:text-gray-300">
                ({demoCourse.reviews.length} Reviews)
              </span>
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              1,234 Students
            </span>
          </div>
                  <div className="flex flex-col md:flex-row justify-start ">
                      
          <section className="my-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">
              What you'll learn
            </h2>
            <ul className="space-y-3">
              {demoCourse.benefits.map((item, index) => (
                <li key={index} className="flex items-center gap-2 dark:text-gray-200">
                  <span className="text-green-500">✓</span>
                  {item.title}
                </li>
              ))}
            </ul>
          </section>

          <section className="my-8 mx-20">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">
              Requirements
            </h2>
            <ul className="space-y-3">
              {demoCourse.prerequisites.map((item, index) => (
                <li key={index} className="flex items-center gap-2 dark:text-gray-200">
                  <span className="text-green-500">✓</span>
                  {item.title}
                </li>
              ))}
            </ul>
                      </section>
                      

                  </div>
                  
          <section className="my-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">
              Course Content
            </h2>
            <CourseContentList />
          </section>


          <section className="my-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {demoCourse.description}
            </p>
          </section>

          <section className="my-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">
              Reviews ({demoCourse.reviews.length})
            </h2>
            {demoCourse.reviews.map((review, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-4">
                  <Image
                    src={avatar}
                    alt="User avatar"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold dark:text-white">
                        {review.user.name}
                      </h3>
                      <Ratings rating={review.rating} />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {review.comment}
                    </p>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {review.createdAt}
                    </time>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="w-full 800px:w-[35%]">
          <div className="sticky top-20">
           <CourseImagePlayer 
             
            />
            
            {/* <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-blue-600">
                    ${demoCourse.price}
                  </span>
                  <span className="text-gray-500 line-through">
                    ${demoCourse.estimatedPrice}
                  </span>
                  <span className="text-green-500 font-bold">
                    {discountPercentage}% off
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsPurchased(!isPurchased)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isPurchased ? "Access Course" : "Enroll Now"}
              </button>

              <ul className="mt-6 space-y-3 text-gray-700 dark:text-gray-300">
                <li>🕒 Full lifetime access</li>
                <li>📁 Source code included</li>
                <li>📜 Certificate of completion</li>
                <li>💬 Premium support</li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;