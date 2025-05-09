"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom, staggerContainer } from "@/utils/motion"; // Assuming motion utils are in @/utils/motion
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { CardBody, CardContainer } from './ui/3d-card';

type CourseType = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  department_name: string;
  year: number;
};

const API_BASE_URL_CONFIG = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3032";

const ThreeDCardDemo = ({
  id,
  title,
  description,
  image,
  department_name,
  year,
}: CourseType) => (
  <CardContainer className="inter-var w-full">
    <motion.div whileHover={{ scale: 1.05 }} className="h-full">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-indigo-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border">
        <div className="flex flex-col h-full">
          <div className="relative h-48 w-full rounded-xl overflow-hidden group-hover/card:shadow-xl mb-4">
            <Image
              src={image ? `${API_BASE_URL_CONFIG}/image/${image}` : "/fallback.jpg"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              alt={title}
              priority={false} // Set to true only for above-the-fold images if needed
              onError={(e) => { (e.target as HTMLImageElement).src = '/fallback.jpg'; }}
            />
          </div>
          <div className="flex-1">
            <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
              {department_name.trim()} • Year {year}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
              {description}
            </p>
          </div>
          <Link
            href={`/ClientCourse/${id}`}
            className="mt-6 block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg transition-colors font-semibold"
            aria-label={`View details for ${title}`}
          >
            View Course
          </Link>
        </div>
      </CardBody>
    </motion.div>
  </CardContainer>
);

const Course = () => { // Renamed from Course to avoid conflict with React.Course
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL_CONFIG}/student/get-all-course`);
        const coursesData = response.data.data || [];
        
        const uniqueDepartments = Array.from(
          new Set(
            coursesData.map((course: CourseType) => course.department_name.trim())
          )
        ).sort((a: string, b: string) => a.localeCompare(b));

        setCourses(coursesData);
        setDepartments(["all", ...uniqueDepartments]);
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesDepartment = selectedDepartment === "all" || 
      course.department_name.trim() === selectedDepartment;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <motion.div variants={staggerContainer()} initial="hidden" animate="visible">
        <motion.h1
          variants={slideInFromBottom}
          className="text-center font-Poppins text-[25px] leading-[35px] sm:text-3xl lg:text-4xl dark:text-white 800px:leading-[60px] text-slate-900 font-[700] tracking-tight mb-8"
        >
          Expand Your Career <ColourfulText text="Opportunity" /> <br />
          With Our Courses
        </motion.h1>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-red-500 text-lg mb-8 p-4 bg-red-100 dark:bg-red-900/30 rounded-md"
          >
            {error}
          </motion.div>
        )}

        <motion.div variants={slideInFromBottom} className="max-w-4xl mx-auto mb-12">
          <input
            type="text"
            placeholder="Search courses by title or description..."
            className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1, 0.3)} // Stagger buttons, delay group start
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12"
        >
          {departments.map((department) => (
            <motion.button
              key={department}
              variants={slideInFromBottom} // Individual button animation
              onClick={() => setSelectedDepartment(department === "all" ? "all" : department)}
              className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-full border-2 transition-all duration-300 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                selectedDepartment === department
                  ? "border-indigo-600 bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 shadow-md"
                  : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              {department === "all" ? "All Departments" : department}
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-lg">Loading courses...</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer(0.15, 0.5)} // Stagger cards, delay group start
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0 mx-auto max-w-7xl"
            >
              {filteredCourses.map((course) => (
                <motion.div 
                  key={course.id} 
                  variants={slideInFromBottom} // Individual card animation
                  className="w-full h-full flex" // Added flex for consistent height if cards vary
                >
                  <ThreeDCardDemo {...course} />
                </motion.div>
              ))}
            </motion.div>

            {filteredCourses.length === 0 && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-600 dark:text-gray-400 text-xl mt-16 py-10"
              >
                No courses found matching your criteria.
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Course;

export const ColourfulText = ({ text }: { text: string }) => {
  return (
    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
      {text}
    </span>
  );
};