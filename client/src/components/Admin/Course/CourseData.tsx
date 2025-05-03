// CourseData.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoAddCircle, IoTrashOutline, IoCheckmarkCircle } from 'react-icons/io5';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CourseDataProps {
  benefits: { title: string }[];
  setBenefits: React.Dispatch<React.SetStateAction<{ title: string }[]>>;
  prerequisites: { title: string }[];
  setPrerequisites: React.Dispatch<React.SetStateAction<{ title: string }[]>>;
  onNext: () => void;
  onBack: () => void;
}

const CourseData: React.FC<CourseDataProps> = ({
  benefits,
  setBenefits,
  prerequisites,
  setPrerequisites,
  onNext,
  onBack
}) => {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleBenefitChange = (index: number, value: string) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index].title = value;
    setBenefits(updatedBenefits);
  };

  const handleAddBenefit = () => {
    if (benefits.some(b => !b.title.trim())) {
      toast.error('Please fill current benefit before adding new');
      return;
    }
    setBenefits([...benefits, { title: '' }]);
  };

  const handleRemoveBenefit = (index: number) => {
    if (benefits.length > 1) {
      const updatedBenefits = benefits.filter((_, i) => i !== index);
      setBenefits(updatedBenefits);
    }
  };

  const handlePrerequisiteChange = (index: number, value: string) => {
    const updatedPrerequisites = [...prerequisites];
    updatedPrerequisites[index].title = value;
    setPrerequisites(updatedPrerequisites);
  };

  const handleAddPrerequisite = () => {
    if (prerequisites.some(p => !p.title.trim())) {
      toast.error('Please fill current prerequisite before adding new');
      return;
    }
    setPrerequisites([...prerequisites, { title: '' }]);
  };

  const handleRemovePrerequisite = (index: number) => {
    if (prerequisites.length > 1) {
      const updatedPrerequisites = prerequisites.filter((_, i) => i !== index);
      setPrerequisites(updatedPrerequisites);
    }
  };

  const validateFields = () => {
    const errors = [];
    if (benefits.some(b => !b.title.trim())) errors.push('Please fill all benefits');
    if (prerequisites.some(p => !p.title.trim())) errors.push('Please fill all prerequisites');
    
    if (errors.length) {
      toast.error(errors.join('\n'));
      return false;
    }
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <div className="space-y-8">
        {/* Benefits Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Course Benefits</h3>
          <AnimatePresence>
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex items-center gap-3 group"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={`Benefit ${index + 1}`}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                    value={benefit.title}
                    onChange={e => handleBenefitChange(index, e.target.value)}
                  />
                  {benefits.length > 1 && (
                    <button
                      onClick={() => handleRemoveBenefit(index)}
                      className="absolute right-3 top-3 text-red-500 hover:text-red-700"
                    >
                      <IoTrashOutline />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <button
            onClick={handleAddBenefit}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
          >
            <IoAddCircle /> Add Benefit
          </button>
        </div>

        {/* Prerequisites Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Prerequisites</h3>
          <AnimatePresence>
            {prerequisites.map((prerequisite, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex items-center gap-3 group"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={`Prerequisite ${index + 1}`}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                    value={prerequisite.title}
                    onChange={e => handlePrerequisiteChange(index, e.target.value)}
                  />
                  {prerequisites.length > 1 && (
                    <button
                      onClick={() => handleRemovePrerequisite(index)}
                      className="absolute right-3 top-3 text-red-500 hover:text-red-700"
                    >
                      <IoTrashOutline />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <button
            onClick={handleAddPrerequisite}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
          >
            <IoAddCircle /> Add Prerequisite
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"
          >
            <FiArrowLeft /> Back
          </button>
          <button
            onClick={() => validateFields() && onNext()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Next <FiArrowRight />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseData;