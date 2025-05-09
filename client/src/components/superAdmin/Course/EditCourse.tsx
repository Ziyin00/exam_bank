'use client';
import { FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "../../ui/use-toast";
import { ProgressBar } from "../../ui/progress";
import { ConfirmationModal } from "../../ui/confirmation-modal";
import CourseInformation from "./CourseInformation";
import CourseData from "./CourseData";
import CourseContent from "./CourseContent";
import CoursePreview from "./CoursePreview";
import { CourseFormData } from "@/src/types/course";

interface EditCourseProps {
  id: string;
}

const EditCourse: FC<EditCourseProps> = ({ id }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    categoryId: 0,
    departmentId: 0,
    tag: "",
    benefit1: "",
    benefit2: "",
    prerequisite1: "",
    prerequisite2: "",
    imageFile: undefined,
    courseContent: [{
      section: "Section 1",
      description: "",
      links: []
    }]
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        const data = response.data;
        
        setFormData({
          title: data.title,
          description: data.description,
          categoryId: data.category_id,
          departmentId: data.department_id,
          tag: data.course_tag,
          benefit1: data.benefit1,
          benefit2: data.benefit2,
          prerequisite1: data.prerequisite1,
          prerequisite2: data.prerequisite2,
          courseContent: data.courseContent.map((section: any) => ({
            section: section.section,
            description: section.description,
            links: section.links
          }))
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Loading Course",
          description: "Failed to fetch course data"
        });
      }
    };

    fetchCourseData();
  }, [id, toast]);

  const calculateProgress = () => {
    const requiredFields = [
      formData.title,
      formData.description,
      formData.categoryId,
      formData.departmentId,
      formData.tag,
      formData.benefit1,
      formData.prerequisite1,
      formData.courseContent[0]?.section,
      formData.courseContent[0]?.description
    ];

    const filledFields = requiredFields.filter(field => 
      field !== undefined && field !== null && field !== ""
    ).length;

    setProgress(Math.round((filledFields / requiredFields.length) * 100));
  };

  useEffect(() => {
    calculateProgress();
  }, [formData]);

  const handleUpdateCourse = async () => {
    setIsLoading(true);
    try {
      const form = new FormData();
      
      // Append updated fields
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("category_id", formData.categoryId.toString());
      form.append("department_id", formData.departmentId.toString());
      form.append("course_tag", formData.tag);
      form.append("benefit1", formData.benefit1);
      form.append("benefit2", formData.benefit2);
      form.append("prerequisite1", formData.prerequisite1);
      form.append("prerequisite2", formData.prerequisite2);

      if (formData.imageFile) {
        form.append("image", formData.imageFile);
      }

      // Process links
      const allLinks = formData.courseContent.flatMap(section => 
        section.links.map(link => ({
          link_name: link.title,
          link: link.url
        }))
      );
      form.append("links", JSON.stringify(allLinks));

      await axios.put(`/api/courses/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast({
        title: "Course Updated",
        description: "Your changes have been saved successfully"
      });
      router.push("/teacher/courses");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Error saving course changes"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        if (!formData.title || !formData.categoryId || !formData.departmentId) {
          toast({
            variant: "destructive",
            title: "Missing Required Fields",
            description: "Please fill in all basic course information"
          });
          return false;
        }
        return true;
      case 1:
        if (!formData.benefit1 || !formData.prerequisite1) {
          toast({
            variant: "destructive",
            title: "Missing Requirements",
            description: "Please fill at least one benefit and prerequisite"
          });
          return false;
        }
        return true;
      case 2:
        if (formData.courseContent.some(section => 
          !section.section || !section.description
        )) {
          toast({
            variant: "destructive",
            title: "Incomplete Sections",
            description: "All sections must have a title and description"
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Course: {formData.title}</h1>
        <div className="mt-4 flex items-center gap-4">
          <ProgressBar value={progress} className="w-48" />
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {activeStep === 0 && (
            <CourseInformation
              formData={formData}
              setFormData={setFormData}
              onNext={handleNextStep}
              isEditMode
            />
          )}

          {activeStep === 1 && (
            <CourseData
              formData={formData}
              setFormData={setFormData}
              onNext={handleNextStep}
              onBack={handlePrevStep}
            />
          )}

          {activeStep === 2 && (
            <CourseContent
              formData={formData}
              setFormData={setFormData}
              onNext={handleNextStep}
              onBack={handlePrevStep}
            />
          )}

          {activeStep === 3 && (
            <CoursePreview
              formData={formData}
              onBack={handlePrevStep}
              isLoading={isLoading}
              onPublish={() => setShowConfirmation(true)}
              isEdit
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-4">Edit Progress</h3>
            <div className="space-y-2">
              {["Basic Info", "Requirements", "Content", "Preview"].map((label, index) => (
                <button
                  key={label}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-2 rounded ${
                    activeStep === index
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleUpdateCourse}
        title="Confirm Course Updates"
        description="Are you sure you want to save these changes?"
        confirmText={isLoading ? "Saving..." : "Confirm Changes"}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditCourse;