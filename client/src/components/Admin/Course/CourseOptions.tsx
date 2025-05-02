// CourseOptions.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface CourseOptionsProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
}

const CourseOptions: React.FC<CourseOptionsProps> = ({ activeStep, setActiveStep }) => {
  const steps = [
    'Course Information',
    'Course Data',
    'Course Content',
    'Preview & Publish'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      <h3 className="text-lg font-semibold mb-4">Creation Progress</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step}
            onClick={() => index < activeStep && setActiveStep(index)}
            className={`cursor-pointer ${index < activeStep ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  index <= activeStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {index < activeStep ? '✓' : index + 1}
              </div>
              <span className={`${
                index === activeStep
                  ? 'font-medium text-blue-500'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-8 ml-4 border-l ${
                index < activeStep ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CourseOptions;