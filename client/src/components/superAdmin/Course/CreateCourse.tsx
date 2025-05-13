// pages/add-new-course.tsx
import { useState } from 'react';
import axios from 'axios';
import { CourseFormData } from '@/src/types/course';
import { useToast } from '../../ui/use-toast';
import CourseInformation from './CourseInformation';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3032'; // Replace or set in .env.local

const initialFormData: CourseFormData = {
  title: '',
  course_tag: '',
  // category_id and department_id removed from initial state
  benefit1: '',
  benefit2: '',
  prerequisite1: '',
  prerequisite2: '',
  description: '',
  links: [],
  year: '',
  image: null,
};

const CreateCourse = () => {
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitCourse = async () => {
    setIsSubmitting(true);

    const dataToSubmit = new FormData();
    // Append all formData fields
    dataToSubmit.append('title', formData.title);
    dataToSubmit.append('course_tag', formData.course_tag);
    dataToSubmit.append('benefit1', formData.benefit1);
    dataToSubmit.append('benefit2', formData.benefit2);
    dataToSubmit.append('prerequisite1', formData.prerequisite1);
    dataToSubmit.append('prerequisite2', formData.prerequisite2);
    dataToSubmit.append('description', formData.description);
    dataToSubmit.append('year', formData.year);

    // Hardcode category_id and department_id
    dataToSubmit.append('category_id', '1');
    dataToSubmit.append('department_id', '1');

    if (formData.image) {
      dataToSubmit.append('image', formData.image);
    }

    const backendReadyLinks = formData.links.map(l => ({ link_name: l.link_name, link: l.link }));
    if (backendReadyLinks.length > 0) {
        dataToSubmit.append('links', JSON.stringify(backendReadyLinks));
    }

    try {
      const response = await axios.post(`http://localhost:3032/teacher/add-cours`, dataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === true) {
        toast({
          title: 'Success!',
          description: response.data.message || 'Course added successfully.',
        });
        setFormData(initialFormData); // Reset form
      } else {
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: response.data.message || 'Could not add course.',
        });
      }
    } catch (error: any) {
      console.error('Error submitting course:', error);
      const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <CourseInformation
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmitCourse}
          isSubmitting={isSubmitting}
          isEditMode={false}
        />
      </div>
    </div>
  );
};

export default CreateCourse;