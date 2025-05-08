// pages/teacher/courses/create.tsx
import { CourseFormData } from '@/src/types/course';
import { useState } from 'react';
import CourseInformation from './CourseInformation';
import CourseData from './CourseData';
import CourseContent from './CourseContent';
import CoursePreview from './CoursePreview';


const CreateCourse = () => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    categoryId: 0,
    departmentId: 0,
    tag: '',
    benefit1: '',
    benefit2: '',
    prerequisite1: '',
    prerequisite2: '',
    courseContent: [{
      section: 'Section 1',
      description: '',
      links: []
    }]
  });

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      // Implement your API call here
      console.log('Publishing course:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Course published successfully!');
    } catch (error) {
      alert('Error publishing course');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      {step === 0 && (
        <CourseInformation
          formData={formData}
          setFormData={setFormData}
          onNext={() => setStep(1)}
        />
      )}
      
      {step === 1 && (
        <CourseData
          formData={formData}
          setFormData={setFormData}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      
      {step === 2 && (
        <CourseContent
          formData={formData}
          setFormData={setFormData}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      
      {step === 3 && (
        <CoursePreview
          formData={formData}
          onBack={() => setStep(2)}
          isLoading={isLoading}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
};

export default CreateCourse;