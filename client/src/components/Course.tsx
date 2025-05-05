"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom } from "@/utils/motion";
import { CardBody, CardContainer } from "./ui/3d-card";
import Image from "next/image";
import axios from "axios";

type CourseType = {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
};

const categories = ["all", "Computer Science", "Information Science", "Cyber Security"];

const ThreeDCardDemo = ({
  title,
  description,
  imageUrl,
  category,
}: CourseType) => (
  <CardContainer className="inter-var w-full">
    <motion.div whileHover={{ scale: 1.05 }} className="h-full">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-indigo-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border">
        <div className="flex flex-col h-full">
          <Image
            src={imageUrl || "/fallback.jpg"}
            height={400}
            width={400}
            className="h-48 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt={title}
          />
          <div className="mt-4 flex-1">
            <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
              {category}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
              {description}
            </p>
          </div>
          <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
            <a href="/ClientCourse">Work Sheets</a>
          </button>
        </div>
      </CardBody>
    </motion.div>
  </CardContainer>
);

const Course = () => {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:3032/student/get-all-course");
        setCourses(res.data?.courses || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = selectedCategory === "all"
    ? courses
    : courses.filter((course) => course.category === selectedCategory);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-center font-Poppins text-[25px] leading-[35px] sm:text-3xl lg:text-4xl dark:text-white 800px:leading-[60px] text-[#000] font-[700] tracking-tight mb-8">
        Expand Your Career <ColourfulText text="Opportunity" /> <br />
        With Our Courses
      </h1>

      <motion.div 
        initial="hidden"
        animate="visible"
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            variants={slideInFromBottom}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full border-2 transition-all duration-300 ${
              selectedCategory === category
                ? "border-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : "border-gray-300 hover:border-indigo-400 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {loading ? (
        <p className="text-center text-gray-500">Loading courses...</p>
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0 mx-auto max-w-7xl"
          >
            {filteredCourses.map((course) => (
              <motion.div 
                key={course._id} 
                variants={slideInFromBottom}
                className="w-full h-full"
              >
                <ThreeDCardDemo {...course} imageUrl={course.imageUrl} />
              </motion.div>
            ))}
          </motion.div>

          {filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 text-xl mt-12"
            >
              No courses found in this category.
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Course;

export const ColourfulText = ({ text }: { text: string }) => {
  return (
    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      {text}
    </span>
  );
};
