// components/course/CourseInformation.tsx
'use client';
// useEffect, useState for categories/departments removed
import { motion } from 'framer-motion';
// axios for categories/departments removed
import { FiUploadCloud, FiImage, FiPlusCircle, FiTrash2, FiPaperclip } from 'react-icons/fi';
import { CourseFormData, CourseLink } from '@/src/types/course'; // Category, Department removed
import { useToast } from '../../ui/use-toast';

interface CourseInformationProps {
  formData: CourseFormData;
  setFormData: (data: CourseFormData | ((prevData: CourseFormData) => CourseFormData)) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

const CourseInformation = ({
  formData,
  setFormData,
  onSubmit,
  isSubmitting = false,
  isEditMode = false,
}: CourseInformationProps) => {
  const { toast } = useToast();
  // Removed state for categories, departments, loadingDropdowns
  // Removed useEffect for fetching dropdown data

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> // HTMLSelectElement removed as no dropdowns
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // handleNumericSelectChange removed

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload an image (PNG, JPG, GIF, WEBP).' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ variant: 'destructive', title: 'File Too Large', description: 'Image must be less than 10MB.' });
        e.target.value = '';
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { id: `link_${Date.now()}`, link_name: '', link: '' }],
    }));
  };

  const updateLink = (index: number, field: 'link_name' | 'link', value: string) => {
    setFormData(prev => {
      const newLinks = prev.links.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, links: newLinks };
    });
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleValidationAndSubmit = () => {
    const { title, course_tag, description, image, year, links, benefit1, prerequisite1 } = formData;
    // Removed category_id, department_id from local validation as they are not in formData anymore
    if (!title.trim() || !course_tag.trim() || !description.trim() || !year.trim() || !benefit1.trim() || !prerequisite1.trim()) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill all required fields (*).' });
      return;
    }
    if (!image && !isEditMode) {
      toast({ variant: 'destructive', title: 'Image Required', description: 'Please upload a course image.' });
      return;
    }
    for (const link of links) {
      if (!link.link_name.trim() || !link.link.trim()) {
        toast({ variant: 'destructive', title: 'Incomplete Link', description: `A link is missing its name or URL. Please complete or remove it.` });
        return;
      }
      try {
        new URL(link.link);
      } catch (_) {
        toast({ variant: 'destructive', title: 'Invalid Link URL', description: `The URL "${link.link}" for link "${link.link_name}" is not valid.` });
        return;
      }
    }
    onSubmit();
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-70";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  // Removed loadingDropdowns skeleton
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800"
    >
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        {isEditMode ? 'Edit Course Details' : 'Add New Course'}
      </h2>

      {/* Course Meta Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className={labelClass}>Course Title <span className="text-red-500">*</span></label>
          <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} className={inputClass} placeholder="e.g., Advanced JavaScript" disabled={isSubmitting}/>
        </div>
        <div>
          <label htmlFor="course_tag" className={labelClass}>Course Tag <span className="text-red-500">*</span></label>
          <input type="text" name="course_tag" id="course_tag" value={formData.course_tag} onChange={handleInputChange} className={inputClass} placeholder="e.g., JSADV01" disabled={isSubmitting}/>
        </div>
        {/* Category and Department dropdowns removed */}
        <div>
          <label htmlFor="year" className={labelClass}>Year <span className="text-red-500">*</span></label>
          <input type="text" name="year" id="year" value={formData.year} onChange={handleInputChange} className={inputClass} placeholder="e.g., 2024 or 1st Year" disabled={isSubmitting}/>
        </div>
      </div>

      {/* Course Image Upload */}
      <div>
        <label htmlFor="image" className={labelClass}>
            Course Image <span className="text-red-500">{isEditMode && formData.image ? "" : "*"}</span>
        </label>
        <div className="mt-1 flex items-center justify-center w-full">
            <label
            htmlFor="image"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
            {formData.image ? (
                <div className="text-center p-4">
                <FiImage className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                    {formData.image.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    ({(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <span className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">Click to change image</span>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiUploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF, WEBP (MAX. 10MB)
                </p>
                </div>
            )}
            <input
                id="image"
                name="image"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isSubmitting}
            />
            </label>
        </div>
        {isEditMode && !formData.image && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Current image will be kept if no new image is uploaded.</p>}
      </div>
      
      {/* Course Description */}
      <div>
        <label htmlFor="description" className={labelClass}>Description <span className="text-red-500">*</span></label>
        <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} className={inputClass} rows={5} placeholder="Detailed course description..." disabled={isSubmitting}></textarea>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Course Benefits</h3>
        <div>
          <label htmlFor="benefit1" className={labelClass}>Benefit 1 <span className="text-red-500">*</span></label>
          <input type="text" name="benefit1" id="benefit1" value={formData.benefit1} onChange={handleInputChange} className={inputClass} placeholder="Key benefit of taking this course" disabled={isSubmitting}/>
        </div>
        <div>
          <label htmlFor="benefit2" className={labelClass}>Benefit 2 (Optional)</label>
          <input type="text" name="benefit2" id="benefit2" value={formData.benefit2} onChange={handleInputChange} className={inputClass} placeholder="Another benefit" disabled={isSubmitting}/>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Prerequisites</h3>
        <div>
          <label htmlFor="prerequisite1" className={labelClass}>Prerequisite 1 <span className="text-red-500">*</span></label>
          <input type="text" name="prerequisite1" id="prerequisite1" value={formData.prerequisite1} onChange={handleInputChange} className={inputClass} placeholder="Required knowledge or skills" disabled={isSubmitting}/>
        </div>
        <div>
          <label htmlFor="prerequisite2" className={labelClass}>Prerequisite 2 (Optional)</label>
          <input type="text" name="prerequisite2" id="prerequisite2" value={formData.prerequisite2} onChange={handleInputChange} className={inputClass} placeholder="Additional prerequisite" disabled={isSubmitting}/>
        </div>
      </div>

      {/* Course Links */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <FiPaperclip className="mr-2"/> Relevant Links (Optional)
          </h3>
          <button
            type="button"
            onClick={addLink}
            disabled={isSubmitting}
            className="px-3 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <FiPlusCircle /> Add Link
          </button>
        </div>
        {formData.links.map((link, index) => (
          <div key={link.id} className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label htmlFor={`link_name_${index}`} className={`${labelClass} text-xs`}>Link Name</label>
                <input
                  type="text"
                  id={`link_name_${index}`}
                  value={link.link_name}
                  onChange={(e) => updateLink(index, 'link_name', e.target.value)}
                  className={`${inputClass} text-sm`}
                  placeholder="e.g., Official Documentation"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor={`link_url_${index}`} className={`${labelClass} text-xs`}>URL</label>
                <input
                  type="url"
                  id={`link_url_${index}`}
                  value={link.link}
                  onChange={(e) => updateLink(index, 'link', e.target.value)}
                  className={`${inputClass} text-sm`}
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>
             <button
                type="button"
                onClick={() => removeLink(index)}
                disabled={isSubmitting}
                className="mt-2 px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <FiTrash2 /> Remove
              </button>
          </div>
        ))}
      </div>

      {/* Submission Button */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleValidationAndSubmit}
          type="button"
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-base font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed min-w-[150px]"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : isEditMode ? 'Save Changes' : 'Add Course'}
        </button>
      </div>
    </motion.div>
  );
};

export default CourseInformation;