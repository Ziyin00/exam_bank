'use client';
import React, { FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CourseInformation from "./CourseInformation";
import CourseOptions from "./CourseOptions";
import CourseData from "./CourseData";
import CourseContent from "./CourseContent";
import CoursePreview from "./CoursePreview";

import { useRouter } from "next/navigation";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { useToast } from "../../ui/use-toast";
import { ProgressBar } from "../../ui/progress";
import { ConfirmationModal } from "../../ui/confirmation-modal";

type Props = {
  id: string;
};

const EditCourse: FC<Props> = ({ id }) => {
  const { toast } = useToast();
  const router = useRouter();
 
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  // Consolidated form state
  const [formData, setFormData] = useState({
    courseInfo: {
      name: "",
      description: "",
      price: "",
      estimatedPrice: "",
      tags: [] as string[],
      level: "",
      demoUrl: "",
    },
    benefits: [{ title: "" }],
    prerequisites: [{ title: "" }],
    courseContent: [{
      videoUrl: "",
      title: "",
      description: "",
      videoSection: "Untitled Section",
      links: [{ title: "", url: "" }],
      suggestion: "",
    }]
  });

  // Load course data
  useEffect(() => {
    const editCourseData = data?.find((i: any) => i._id === id);
    if (editCourseData) {
      setFormData({
        courseInfo: {
          name: editCourseData.name,
          description: editCourseData.description,
          price: editCourseData.price,
          estimatedPrice: editCourseData.estimatedPrice,
          tags: editCourseData.tags,
          level: editCourseData.level,
          demoUrl: editCourseData.demoUrl,
        },
        benefits: editCourseData.benefits || [{ title: "" }],
        prerequisites: editCourseData.prerequisites || [{ title: "" }],
        courseContent: editCourseData.courseData || [{
          videoUrl: "",
          title: "",
          description: "",
          videoSection: "Untitled Section",
          links: [{ title: "", url: "" }],
          suggestion: "",
        }]
      });
    }
  }, [data, id]);

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
        if (content.videoUrl) filledFields++;
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

  // Handle API responses
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Course Updated Successfully",
        description: "Your changes have been saved",
      });
      router.push("/admin/courses");
      refetch();
    }
    if (error) {
      toast({
        variant: "destructive",
        title: "Update Error",
        description: "There was an error updating the course",
      });
    }
  }, [isSuccess, error, router, refetch, toast]);

  // Form validation
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
          c => !c.title.trim() || !c.description.trim() || !c.videoUrl
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

  // Handle step navigation
  const handleNextStep = () => {
    if (validateStep(active)) {
      setActive(prev => Math.min(prev + 1, 3));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const formattedData = {
      ...formData.courseInfo,
      benefits: formData.benefits,
      prerequisites: formData.prerequisites,
      courseData: formData.courseContent.map(content => ({
        ...content,
        links: content.links.map(link => ({
          title: link.title,
          url: link.url
        }))
      }))
    };

    try {
      await editCourse({ id, data: formattedData });
    } catch (err) {
      console.error("Update error:", err);
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
                    Edit Course: {formData.courseInfo.name}
                  </h1>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={progress} className="w-[200px]" />
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progress)}% Complete
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.refresh()}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <FiRefreshCw className="h-4 w-4" />
                  Refresh Data
                </button>
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
                      handleSubmit={handleSubmit}
                    />
                  )}

                  {active === 3 && (
                    <CoursePreview
                      courseData={formData}
                      handleCourseCreate={() => setShowConfirmation(true)}
                      isEdit
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
              
              <div className="mt-4 p-3 bg-warning/10 rounded-lg flex items-center gap-2">
                <FiAlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm text-warning">
                  Auto-save enabled - {Math.round(progress)}% complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleSubmit}
        title="Confirm Course Update"
        description="Are you sure you want to save these changes?"
        // confirmText={isLoading ? "Saving..." : "Confirm Update"}
        // isLoading={isLoading}
      />
    </motion.div>
  );
};

export default EditCourse;