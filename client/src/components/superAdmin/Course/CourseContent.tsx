'use client'

// components/course/CourseContent.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiLink } from 'react-icons/fi';
import { useToast } from '../../ui/use-toast';
import { useState } from 'react';

interface CourseContentProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const CourseContent = ({ formData, setFormData, onNext, onBack }: CourseContentProps) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState(0);

  const addSection = () => {
    setFormData({
      ...formData,
      courseContent: [
        ...formData.courseContent,
        {
          section: `Section ${formData.courseContent.length + 1}`,
          description: '',
          links: []
        }
      ]
    });
    setActiveSection(formData.courseContent.length);
  };

  const validateSection = () => {
    const current = formData.courseContent[activeSection];
    if (!current.section.trim() || !current.description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill all required section fields'
      });
      return false;
    }
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Course Content</h2>
        <button
          onClick={addSection}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          New Section
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {formData.courseContent.map((section: any, index: number) => (
          <button
            key={index}
            onClick={() => setActiveSection(index)}
            className={`px-4 py-2 rounded-lg flex-shrink-0 ${
              activeSection === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Section {index + 1}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {formData.courseContent.map((section: any, index: number) => (
          activeSection === index && (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Section Title *
                </label>
                <input
                  value={section.section}
                  onChange={(e) => {
                    const updated = [...formData.courseContent];
                    updated[index].section = e.target.value;
                    setFormData({ ...formData, courseContent: updated });
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Section Description *
                </label>
                <textarea
                  value={section.description}
                  onChange={(e) => {
                    const updated = [...formData.courseContent];
                    updated[index].description = e.target.value;
                    setFormData({ ...formData, courseContent: updated });
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                    Resources & Links
                  </h3>
                  <button
                    onClick={() => {
                      const updated = [...formData.courseContent];
                      updated[index].links.push({ title: '', url: '' });
                      setFormData({ ...formData, courseContent: updated });
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <FiPlus className="h-4 w-4" />
                    Add Resource
                  </button>
                </div>

                {section.links.map((link: any, linkIndex: number) => (
                  <div key={linkIndex} className="flex gap-4 items-center">
                    <FiLink className="text-gray-500 dark:text-gray-400" />
                    <input
                      value={link.title}
                      onChange={(e) => {
                        const updated = [...formData.courseContent];
                        updated[index].links[linkIndex].title = e.target.value;
                        setFormData({ ...formData, courseContent: updated });
                      }}
                      placeholder="Resource Title"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white"
                    />
                    <input
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...formData.courseContent];
                        updated[index].links[linkIndex].url = e.target.value;
                        setFormData({ ...formData, courseContent: updated });
                      }}
                      placeholder="https://example.com"
                      type="url"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white"
                    />
                    <button
                      onClick={() => {
                        const updated = [...formData.courseContent];
                        updated[index].links.splice(linkIndex, 1);
                        setFormData({ ...formData, courseContent: updated });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
        >
          Back
        </button>
        <button
          onClick={() => validateSection() && onNext()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default CourseContent;