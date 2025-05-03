"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiUploadCloud } from "react-icons/fi";
import { Card, CardContent, CardHeader } from "@mui/material";
import { Button } from "../../ui/button";
import { ProgressBar } from "../../ui/progress";
import CourseInformation from "./CourseInformation";
import CourseOptions from "./CourseOptions";
import CourseData from "./CourseData";
import CourseContent from "./CourseContent";
import CoursePreview from "./CoursePreview";
import toast from "react-hot-toast";

type FormState = {
  name: string;
  description: string;
  price: string;
  estimatedPrice: string;
  tags: string[];
  level: string;
  category: string;
  demoUrl: string;
};

type CourseContentType = {
  imageUrl: string;
  title: string;
  description: string;
  section: string;
  links: Array<{ title: string; url: string }>;
  suggestion?: string;
};

const CreateCourse = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Main form states
  const [formState, setFormState] = useState<FormState>({
    name: "",
    description: "",
    price: "",
    estimatedPrice: "",
    tags: [],
    level: "",
    category: "",
    demoUrl: "",
  });

  const [benefits, setBenefits] = useState([{ title: "" }]);
  const [prerequisites, setPrerequisites] = useState([{ title: "" }]);
  const [courseContent, setCourseContent] = useState<CourseContentType[]>([{
    imageUrl: "",
    title: "",
    description: "",
    section: "Introduction",
    links: [{ title: "", url: "" }],
  }]);

  // Progress calculation
  useEffect(() => {
    const calculateProgress = () => {
      let filledFields = 0;
      const totalFields = 21; // Adjust based on your actual required fields

      // Course Information
      filledFields += formState.name ? 1 : 0;
      filledFields += formState.description ? 1 : 0;
      filledFields += formState.tags.length;
      filledFields += formState.category ? 1 : 0;
      filledFields += formState.level ? 1 : 0;
      filledFields += formState.demoUrl ? 1 : 0;

      // Benefits & Prerequisites
      filledFields += benefits.filter(b => b.title.trim()).length;
      filledFields += prerequisites.filter(p => p.title.trim()).length;

      // Course Content
      courseContent.forEach(content => {
        filledFields += content.title ? 1 : 0;
        filledFields += content.description ? 1 : 0;
        filledFields += content.links.filter(link => 
          link.title && link.url
        ).length;
      });

      setProgress(Math.round((filledFields / totalFields) * 100));
    };

    calculateProgress();
  }, [formState, benefits, prerequisites, courseContent]);

  // Demo data loader
  const loadDemoData = () => {
    setFormState({
      name: "Advanced Web Development",
      description: "Master modern full-stack development with React, Node.js, and PostgreSQL",
      price: "199.99",
      estimatedPrice: "299.99",
      tags: ["React", "TypeScript", "Node.js"],
      level: "Intermediate",
      category: "Web Development",
      demoUrl: "https://example.com/demo",
    });
    
    setBenefits([
      { title: "Build production-ready applications" },
      { title: "Implement CI/CD pipelines" },
      { title: "Master TypeScript best practices" }
    ]);
    
    setPrerequisites([
      { title: "Basic JavaScript knowledge" },
      { title: "Familiarity with HTML/CSS" }
    ]);

    setCourseContent([{
      imageUrl: "/default-course-image.jpg",
      title: "Modern JavaScript Fundamentals",
      description: "Deep dive into ES6+ features and TypeScript basics",
      section: "Getting Started",
      links: [
        { title: "Exercise Files", url: "https://example.com/exercises" },
        { title: "Resources", url: "https://example.com/resources" }
      ],
      suggestion: "Complete JavaScript basics first"
    }]);

    toast.success("Demo data loaded!");
  };

  // Form validation
  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        if (!formState.name.trim() || 
            !formState.category.trim() || 
            formState.tags.length === 0) {
          toast.error("Please fill all required fields");
          return false;
        }
        return true;
      case 1:
        if (benefits.some(b => !b.title.trim()) || 
            prerequisites.some(p => !p.title.trim())) {
          toast.error("Please fill all benefit and prerequisite fields");
          return false;
        }
        return true;
      case 2:
        if (courseContent.some(c => !c.title.trim() || !c.description.trim())) {
          toast.error("Please complete all course content sections");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Step navigation
  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  // Form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const courseData = {
        ...formState,
        benefits: benefits.filter(b => b.title.trim()),
        prerequisites: prerequisites.filter(p => p.title.trim()),
        courseContent: courseContent.map(content => ({
          ...content,
          links: content.links.filter(link => link.title.trim() && link.url.trim())
        }))
      };

      console.log("Submitting course:", courseData);
      toast.success("Course created successfully!");
      router.push("/admin/courses");
    } catch (error) {
      toast.error("Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-7xl mx-auto">
        <CardHeader className="border-b p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Create New Course</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={loadDemoData}
                className="gap-2"
              >
                <FiUploadCloud className="h-4 w-4" />
                Load Demo
              </Button>
              <ProgressBar value={progress} className="w-32" />
              <span className="text-sm text-muted-foreground">
                {progress}% Complete
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeStep === 0 && (
                    <CourseInformation
                      formState={formState}
                      setFormState={setFormState}
                      onNext={handleNextStep}
                    />
                  )}

                  {activeStep === 1 && (
                    <CourseData
                      benefits={benefits}
                      setBenefits={setBenefits}
                      prerequisites={prerequisites}
                      setPrerequisites={setPrerequisites}
                      onNext={handleNextStep}
                      onBack={handlePrevStep}
                    />
                  )}

                  {activeStep === 2 && (
                    <CourseContent
                      content={courseContent}
                      setContent={setCourseContent}
                      onNext={handleNextStep}
                      onBack={handlePrevStep}
                    />
                  )}

                  {activeStep === 3 && (
                    <CoursePreview
                      data={{ ...formState, benefits, prerequisites, courseContent }}
                      onSubmit={handleSubmit}
                      onBack={handlePrevStep}
                      isLoading={isLoading}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <CourseOptions
                activeStep={activeStep}
                setActiveStep={setActiveStep}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourse;