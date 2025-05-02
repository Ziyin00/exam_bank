
"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CourseInformation from "./CourseInformation";
import CourseOptions from "./CourseOptions";
import CourseData from "./CourseData";
import CourseContent from "./CourseContent";
import CoursePreview from "./CoursePreview";
import { useTheme } from "next-themes";
import { useToast } from "../../ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { ProgressBar } from "../../ui/progress";
import { Button } from "@mui/material";
import { Badge } from "../../ui/badge";
import { Toaster } from "../../ui/toaster";
import { FiAlertTriangle, FiUploadCloud } from "react-icons/fi";
import { ConfirmationModal } from "../../ui/confirmation-modal";



const CreateCourse = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [progress, setProgress] = useState(0);

  // Main form state
  const [active, setActive] = useState(0);
  const [formData, setFormData] = useState({
    courseInfo: {
      name: "",
      description: "",
      price: "",
      estimatedPrice: "",
      tags: [],
      level: "",
      categories: "",
      demoUrl: "",
    },
    benefits: [{ title: "" }],
    prerequisites: [{ title: "" }],
    courseContent: [{
      imageUrl: "",
      title: "",
      description: "",
      imageSection: "Untitled Section",
      links: [{ title: "", url: "" }],
      suggestion: "",
    }]
  });

  // Progress calculation
  useEffect(() => {
    const calculateProgress = () => {
      let filledFields = 0;
      let totalFields = 0;

      // Course Info
      Object.values(formData.courseInfo).forEach(value => {
        totalFields++;
        if (value) filledFields++;
      });

      // Benefits & Prerequisites
      [formData.benefits, formData.prerequisites].forEach(array => {
        array.forEach(item => {
          totalFields++;
          if (item.title) filledFields++;
        });
      });

      // Course Content
      formData.courseContent.forEach(content => {
        totalFields += 4;
        if (content.title) filledFields++;
        if (content.description) filledFields++;
        if (content.imageUrl) filledFields++;
        content.links.forEach(link => {
          totalFields += 2;
          if (link.title) filledFields++;
          if (link.url) filledFields++;
        });
      });

      setProgress((filledFields / totalFields) * 100);
    };

    calculateProgress();
  }, [formData]);

  // Draft handling
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (progress > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [progress]);

  // Demo data with real-world examples
  const handleDemoData = () => {
    setFormData({
      courseInfo: {
        name: "Full-Stack Web Development",
        description: "Master modern web development with React, Node.js, and PostgreSQL",
        price: "199.99",
        estimatedPrice: "299.99",
        tags: ["React", "TypeScript", "Node.js", "PostgreSQL"],
        level: "Intermediate",
        categories: "Web Development",
        demoUrl: "https://acme.com/course-preview",
      },
      benefits: [
        { title: "Build production-ready applications" },
        { title: "Implement CI/CD pipelines" },
        { title: "Master TypeScript best practices" }
      ],
      prerequisites: [
        { title: "Basic JavaScript knowledge" },
        { title: "Familiarity with HTML/CSS" }
      ],
      courseContent: [{
        imageUrl: "/assets/course-module-1.jpg",
        title: "Modern JavaScript Fundamentals",
        description: "Deep dive into ES6+ features and TypeScript basics",
        imageSection: "Getting Started",
        links: [
          { title: "Exercise Files", url: "https://acme.com/exercises/module1" },
          { title: "Additional Resources", url: "https://acme.com/resources/module1" }
        ],
        suggestion: "Complete Codecademy JavaScript Path first"
      }]
    });
    
    toast({
      title: "Demo Loaded Successfully",
      description: "Explore the demo course structure and edit as needed",
      action: (
        <ToastAction 
          altText="Reset form" 
          onClick={() => window.location.reload()}
        >
          Reset Form
        </ToastAction>
      ),
    });
  };

  // Enhanced validation with specific feedback
  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        if (!formData.courseInfo.name.trim()) {
          toast({ 
            variant: "destructive",
            title: "Missing Course Name",
            description: "Please provide a title for your course",
          });
          return false;
        }
        return true;
      case 1:
        const emptyBenefits = formData.benefits.filter(b => !b.title.trim());
        const emptyPrereqs = formData.prerequisites.filter(p => !p.title.trim());
        
        if (emptyBenefits.length > 0 || emptyPrereqs.length > 0) {
          toast({
            variant: "destructive",
            title: "Incomplete Fields",
            description: `Please fill ${emptyBenefits.length} benefit and ${emptyPrereqs.length} prerequisite fields`,
          });
          return false;
        }
        return true;
      case 2:
        const invalidContent = formData.courseContent.filter(
          c => !c.title.trim() || !c.description.trim() || !c.imageUrl
        );
        
        if (invalidContent.length > 0) {
          toast({
            variant: "destructive",
            title: "Incomplete Content",
            description: `${invalidContent.length} modules need attention`,
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-card rounded-2xl shadow-xl p-6 mb-6 border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {draftSaved ? "Continue Course Creation" : "New Course"}
                  </h1>
                  <ProgressBar value={progress} className="mt-2 w-[200px]" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDemoData}
                    className="gap-2"
                  >
                    <FiUploadCloud className="h-4 w-4" />
                    Load Demo
                  </Button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {active === 0 && (
                    <CourseInformation
                      courseInfo={formData.courseInfo}
                      setCourseInfo={(data) => setFormData(prev => ({
                        ...prev,
                        courseInfo: { ...prev.courseInfo, ...data }
                      }))}
                      handleNextStep={handleNextStep}
                    />
                  )}

                  {active === 1 && (
                    <CourseData
                      benefits={formData.benefits}
                      setBenefits={(data) => setFormData(prev => ({
                        ...prev, benefits: data
                      }))}
                      prerequisites={formData.prerequisites}
                      setPrerequisites={(data) => setFormData(prev => ({
                        ...prev, prerequisites: data
                      }))}
                      handleNextStep={handleNextStep}
                    />
                  )}

                  {active === 2 && (
                    <CourseContent
                      courseContentData={formData.courseContent}
                      setCourseContentData={(data) => setFormData(prev => ({
                        ...prev, courseContent: data
                      }))}
                      // handleSubmit={handleSubmit}
                    />
                  )}

                  {active === 3 && (
                    <CoursePreview
                      courseData={formData}
                      handleCourseCreate={() => setShowConfirmation(true)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Progress Sidebar */}
          <div className="lg:w-80 lg:mt-24">
            <div className="sticky top-24 bg-card rounded-2xl shadow-xl p-6 border">
              <CourseOptions active={active} setActive={setActive} />
              
              {draftSaved && (
                <div className="mt-4 p-3 bg-warning/10 rounded-lg flex items-center gap-2">
                  <FiAlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm text-warning">
                    Draft autosaved - {Math.round(progress)}% complete
                  </span>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium">Course Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.courseInfo.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        onClose={() => setShowConfirmation(false)}

        onConfirm={handleSubmit}
        title="Publish Course"
        description="This will make your course available to students worldwide"
        isOpen={showConfirmation}
        confirmText="Confirmed"
      />

      <Toaster />
    </motion.div>
  );
};

export default CreateCourse;