// CourseInformation.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiInfo, FiX, FiUploadCloud } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CourseInformationProps {
  formState: {
    name: string;
    description: string;
    price: string;
    estimatedPrice: string;
    tags: string[];
    level: string;
    category: string;
    demoUrl: string;
  };
  setFormState: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
}

const CourseInformation: React.FC<CourseInformationProps> = ({
  formState,
  setFormState,
  onNext
}) => {
  const [categories] = useState([
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'UI/UX Design'
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !formState.tags.includes(newTag)) {
        setFormState(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = formState.tags.filter((_, i) => i !== index);
    setFormState(prev => ({ ...prev, tags: newTags }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.tags.length || !formState.category || !formState.name) {
      setIsValid(false);
      toast.error('Please fill all required fields');
      return;
    }
    onNext();
  };

  const loadDemoData = () => {
    setFormState({
      name: 'Advanced Web Development',
      description: 'Master modern full-stack development with React, Node.js, and PostgreSQL',
      price: '199.99',
      estimatedPrice: '299.99',
      tags: ['React', 'TypeScript', 'Node.js'],
      level: 'Intermediate',
      category: 'Web Development',
      demoUrl: 'https://example.com/demo'
    });
    toast.success('Demo data loaded!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Information</h2>
        <button
          type="button"
          onClick={loadDemoData}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <FiUploadCloud /> Load Demo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Course Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter course name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={formState.name}
            onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Course Description
          </label>
          <textarea
            rows={4}
            placeholder="Describe your course..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={formState.description}
            onChange={e => setFormState(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags <span className="text-red-500">*</span>
          </label>
          <div className={`p-2 border ${
            isValid ? 'border-gray-300 dark:border-gray-600' : 'border-red-500'
          } rounded-lg transition-colors`}>
            <div className="flex flex-wrap gap-2 mb-2">
              {formState.tags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full"
                >
                  {tag}
                  <FiX
                    className="ml-2 cursor-pointer hover:text-blue-800"
                    onClick={() => removeTag(index)}
                  />
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type and press comma/enter to add tags..."
              className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleTagInput}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={formState.category}
            onChange={e => setFormState(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CourseInformation;