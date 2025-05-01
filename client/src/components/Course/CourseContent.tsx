import React, { useState } from "react";
// import Heading from "@/app/utils/Heading";
import CourseContentMedia from "./CourseContentMedia";
// import Header from "../Header";
import CourseContentList from "./CourseContentList";
import Navbar from "../Navbar";

// Static demo data
const demoContent = [
  {
    _id: "1",
    title: "Introduction to Web Development",
    description: "Learn the basics of web development",
    videoUrl: "https://example.com/video1.mp4",
    tags: ["web", "development", "beginner"],
    links: [
      { title: "PDF Notes", url: "#" },
      { title: "Source Code", url: "#" }
    ],
    questions: [],
    reviews: []
  },
  {
    _id: "2",
    title: "HTML Fundamentals",
    description: "Master HTML basics",
    videoUrl: "https://example.com/video2.mp4",
    tags: ["HTML", "web"],
    links: [
      { title: "Cheat Sheet", url: "#" }
    ],
    questions: [],
    reviews: []
  }
];

const CourseContentDemo = () => {
  const [open, setOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);

  return (
    <div className="w-full">
      <Navbar />
      <div className="w-full grid 800px:grid-cols-10">
        {/* <Heading
          title={demoContent[activeVideo]?.title}
          description="Interactive demo course content"
          keywords={demoContent[activeVideo]?.tags.join(", ")}
        /> */}
        
        <div className="col-span-7">
          <CourseContentMedia
           
          />
        </div>
        
        <div className="hidden 800px:block 800px:col-span-3">
          <CourseContentList 
          
          />
        </div>
      </div>
    </div>
  );
};

export default CourseContentDemo;