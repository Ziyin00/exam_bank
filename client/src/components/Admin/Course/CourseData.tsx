import React, { FC, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { IoAddCircle, IoTrashOutline, IoCheckmarkCircle } from "react-icons/io5";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { style } from "@/src/styles/style";

type Props = {
  benefits: { title: string }[];
  setBenefits: (benefits: { title: string }[]) => void;
  prerequisites: { title: string }[];
  setPrerequisites: (prerequisites: { title: string }[]) => void;
  active: number;
  setActive: (active: number) => void;
};

const CourseData: FC<Props> = ({
  benefits,
  setBenefits,
  prerequisites,
  setPrerequisites,
  active,
  setActive,
}) => {
  const [demoDataAdded, setDemoDataAdded] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (benefits.some(b => b.title) || prerequisites.some(p => p.title)) {
      setDemoDataAdded(false);
    }
  }, [benefits, prerequisites]);

  const handleBenefitChange = (index: number, value: string) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index].title = value;
    setBenefits(updatedBenefits);
    setTouchedFields(prev => new Set(prev.add(`benefit-${index}`)));
  };

  const handleAddBenefit = () => {
    if (benefits.some(b => !b.title.trim())) {
      return toast.error("Please fill all benefits before adding new");
    }
    setBenefits([...benefits, { title: "" }]);
  };

  const handleRemoveBenefit = (index: number) => {
    if (benefits.length > 1) {
      const updatedBenefits = benefits.filter((_, i) => i !== index);
      setBenefits(updatedBenefits);
      toast.success("Benefit removed", { icon: "🗑️" });
    }
  };

  const handlePrerequisitesChange = (index: number, value: string) => {
    const updatedPrerequisites = [...prerequisites];
    updatedPrerequisites[index].title = value;
    setPrerequisites(updatedPrerequisites);
    setTouchedFields(prev => new Set(prev.add(`prerequisite-${index}`)));
  };

  const handleAddPrerequisites = () => {
    if (prerequisites.some(p => !p.title.trim())) {
      return toast.error("Please fill all prerequisites before adding new");
    }
    setPrerequisites([...prerequisites, { title: "" }]);
  };

  const handleRemovePrerequisite = (index: number) => {
    if (prerequisites.length > 1) {
      const updatedPrerequisites = prerequisites.filter((_, i) => i !== index);
      setPrerequisites(updatedPrerequisites);
      toast.success("Prerequisite removed", { icon: "🗑️" });
    }
  };

  const addDemoData = () => {
    const newBenefits = [
      ...benefits.filter(b => b.title),
      { title: "Build full-stack LMS platforms" },
      { title: "Master advanced authentication systems" },
      { title: "Learn professional project deployment" },
    ];
    
    const newPrerequisites = [
      ...prerequisites.filter(p => p.title),
      { title: "Basic JavaScript knowledge" },
      { title: "Familiarity with React" },
      { title: "Understanding of Node.js fundamentals" },
    ];

    setBenefits(newBenefits);
    setPrerequisites(newPrerequisites);
    setDemoDataAdded(true);
    toast.success("Demo data added!", { icon: "✨" });
  };

  const validateFields = () => {
    const errors: string[] = [];

    benefits.forEach((b, i) => {
      if (!b.title.trim()) errors.push(`Benefit ${i + 1} is required`);
    });

    prerequisites.forEach((p, i) => {
      if (!p.title.trim()) errors.push(`Prerequisite ${i + 1} is required`);
    });

    if (errors.length > 0) {
      toast.error(errors.join("\n"), { duration: 4000 });
      return false;
    }
    return true;
  };

  const prevStep = () => setActive(active - 1);

  const handleNextStep = () => {
    if (!validateFields()) return;
    toast.success("Step validated! Moving to next step");
    setActive(active + 1);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const countFilled = (items: { title: string }[]) => 
    items.filter(item => item.title.trim()).length;

  return (
    <div className="w-[90%] max-w-2xl mx-auto mt-12 p-6 dark:bg-gray-900 bg-white rounded-xl shadow-lg">
      <div className="mb-8 flex justify-between items-center">
        <button
          type="button"
          onClick={addDemoData}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 
            rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          {demoDataAdded ? (
            <>
              <IoCheckmarkCircle /> Demo Data Loaded
            </>
          ) : (
            <>
              <span className="text-lg">✨</span>
              Load Demo Data
            </>
          )}
        </button>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Filled: {countFilled(benefits)}/{benefits.length} benefits · 
          {countFilled(prerequisites)}/{prerequisites.length} prerequisites
        </div>
      </div>

      <div className="space-y-10">
        {/* Benefits Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Course Benefits
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              (What students will learn)
            </span>
          </div>
          
          <AnimatePresence>
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex items-center gap-3 group"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={`Benefit #${index + 1}`}
                    className={`${style.input} !pl-10 !pr-10 transition-all
                      ${benefit.title.trim() ? '!border-green-500' : touchedFields.has(`benefit-${index}`) ? '!border-red-500' : ''}`}
                    value={benefit.title}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddBenefit()}
                  />
                  <span className="absolute left-3 top-3 text-gray-500">🎯</span>
                  {benefit.title.trim() && (
                    <span className="absolute right-10 top-3 text-green-500">
                      <IoCheckmarkCircle />
                    </span>
                  )}
                  {benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      className="absolute right-3 top-3 text-red-500 hover:text-red-700
                        opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleAddBenefit}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 
              transition-colors w-full justify-center py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          >
            <IoAddCircle size={22} />
            Add Benefit
          </button>
        </div>

        {/* Prerequisites Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Requirements
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              (What students should know)
            </span>
          </div>

          <AnimatePresence>
            {prerequisites.map((prerequisite, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex items-center gap-3 group"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={`Requirement #${index + 1}`}
                    className={`${style.input} !pl-10 !pr-10 transition-all
                      ${prerequisite.title.trim() ? '!border-green-500' : touchedFields.has(`prerequisite-${index}`) ? '!border-red-500' : ''}`}
                    value={prerequisite.title}
                    onChange={(e) => handlePrerequisitesChange(index, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPrerequisites()}
                  />
                  <span className="absolute left-3 top-3 text-gray-500">📚</span>
                  {prerequisite.title.trim() && (
                    <span className="absolute right-10 top-3 text-green-500">
                      <IoCheckmarkCircle />
                    </span>
                  )}
                  {prerequisites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePrerequisite(index)}
                      className="absolute right-3 top-3 text-red-500 hover:text-red-700
                        opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleAddPrerequisites}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 
              transition-colors w-full justify-center py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          >
            <IoAddCircle size={22} />
            Add Requirement
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="mt-12 flex justify-between gap-4">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 
            dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={active === 0}
        >
          <FiArrowLeft />
          Previous
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white 
            rounded-lg transition-colors shadow-lg hover:shadow-blue-500/30 font-medium
            disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={!benefits.length || !prerequisites.length}
        >
          Next Step
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default CourseData;