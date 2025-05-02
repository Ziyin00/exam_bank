import React, { FC } from "react";
import { motion } from "framer-motion";
import { IoMdCheckmark } from "react-icons/io";
import { FiEdit } from "react-icons/fi";

const CourseOptions: FC<{ active: number; setActive: (active: number) => void }> = ({ 
  active, 
  setActive 
}) => {
  const steps = [
    { label: "Course Information", status: "completed" },
    { label: "Course Options", status: "current" },
    { label: "Course Content", status: "upcoming" },
    { label: "Course Preview", status: "upcoming" },
  ];

  const getStepState = (index: number) => {
    if (active > index) return "completed";
    if (active === index) return "current";
    return "upcoming";
  };

  const getStatusLabel = (index: number) => {
    const state = getStepState(index);
    const labels = {
      completed: "Completed",
      current: "Current Step",
      upcoming: "Upcoming",
    };
    return labels[state];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <nav aria-label="Progress">
        <ol className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = active > index;
            const isCurrent = active === index;
            const isUpcoming = active < index;

            return (
              <li 
                key={step.label}
                className="group relative cursor-pointer"
                onClick={() => setActive(index)}
              >
                {/* Vertical line */}
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 -ml-px h-8 w-0.5 transition-colors duration-300 ${
                      isCompleted ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-600"
                    }`}
                    aria-hidden="true"
                  />
                )}

                <div className="flex items-start">
                  {/* Step indicator */}
                  <span className="relative flex h-9 items-center">
                    <motion.span
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                        borderColor: isCompleted 
                          ? "#3B82F6" 
                          : isCurrent 
                          ? "#3B82F6" 
                          : "#E5E7EB",
                        backgroundColor: isCompleted 
                          ? "#3B82F6" 
                          : isCurrent 
                          ? "rgba(59, 130, 246, 0.1)" 
                          : "transparent",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                        isCompleted 
                          ? "bg-blue-500 border-blue-500" 
                          : isCurrent 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" 
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      {isCompleted ? (
                        <IoMdCheckmark className="h-5 w-5 text-white" />
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      )}
                    </motion.span>
                  </span>

                  {/* Step content */}
                  <div className="ml-4 flex flex-col space-y-1">
                    <span
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isCompleted 
                          ? "text-blue-600 dark:text-blue-400" 
                          : isCurrent 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      {getStatusLabel(index)}
                    </span>
                  </div>

                  {/* Edit button for completed steps */}
                  {isCompleted && (
                    <button
                      className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(index);
                      }}
                    >
                      <FiEdit className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Progress status */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Progress</span>
        <span>{Math.round((active / steps.length) * 100)}% Complete</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <motion.div
          animate={{ width: `${(active / steps.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 300 }}
          className="h-full rounded-full bg-blue-500"
        />
      </div>
    </motion.div>
  );
};

export default CourseOptions;