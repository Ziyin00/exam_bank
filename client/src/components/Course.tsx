"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom } from "@/utils/motion";
import { CardBody, CardContainer } from "./ui/3d-card";
import Image from "next/image";
import axios from "axios";

type CourseType = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  department_name: string;
  year: number;
};

const ThreeDCardDemo = ({
  title,
  description,
  image,
  department_name,
}: CourseType) => (
  <CardContainer className="inter-var w-full">
    <motion.div whileHover={{ scale: 1.05 }} className="h-full">
      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-indigo-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border">
        <div className="flex flex-col h-full">
          <Image
            src={image ? `http://localhost:3032/uploads/${image}` : "/fallback.jpg"}
            height={400}
            width={400}
            className="h-48 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt={title}
            priority
          />
          <div className="mt-4 flex-1">
            <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
              {department_name.trim()} • Year 
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
              {description}
            </p>
          </div>
          <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
            <a href="/ClientCourse">View Course</a>
          </button>
        </div>
      </CardBody>
    </motion.div>
  </CardContainer>
);

const Course = () => {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3032/student/get-all-course");
        const coursesData = response.data.data || [];
        
        // Process departments
        const uniqueDepartments = Array.from(
          new Set(
            coursesData.map(course => course.department_name.trim())
          )
        ).sort((a, b) => a.localeCompare(b));

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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-center font-Poppins text-[25px] leading-[35px] sm:text-3xl lg:text-4xl dark:text-white 800px:leading-[60px] text-[#000] font-[700] tracking-tight mb-8">
        Expand Your Career <ColourfulText text="Opportunity" /> <br />
        With Our Courses
      </h1>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-500 text-lg mb-8"
        >
          {error}
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto mb-12">
        <input
          type="text"
          placeholder="Search courses..."
          className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        {departments.map((department) => (
          <motion.button
            key={department}
            variants={slideInFromBottom}
            onClick={() => setSelectedDepartment(department === "all" ? "all" : department)}
            className={`px-6 py-2 rounded-full border-2 transition-all duration-300 ${
              selectedDepartment === department
                ? "border-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : "border-gray-300 hover:border-indigo-400 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
          >
            {department === "all" ? "All Departments" : department}
          </motion.button>
        ))}
      </motion.div>

      {loading ? (
        <div className="text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4">Loading courses...</p>
        </div>
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0 mx-auto max-w-7xl"
          >
            {filteredCourses.map((course) => (
              <motion.div 
                key={course.id} 
                variants={slideInFromBottom}
                className="w-full h-full"
              >
                <ThreeDCardDemo {...course} />
              </motion.div>
            ))}
          </motion.div>

          {filteredCourses.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 text-xl mt-12"
            >
              No courses found matching your criteria
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