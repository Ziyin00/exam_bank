import React, { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiInfo, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const CourseInformation: FC<any> = ({
  courseInfo,
  setCourseInfo,
  active,
  setActive,
}) => {
  const [demoCategories] = useState([
    { _id: "1", title: "Web Development" },
    { _id: "2", title: "Mobile Development" },
    { _id: "3", title: "Data Science" },
    { _id: "4", title: "Machine Learning" },
    { _id: "5", title: "UI/UX Design" },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (courseInfo.tags?.length > 0) {
      setIsValid(true);
    }
  }, [courseInfo.tags]);

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", "Tab"].includes(e.key)) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !courseInfo.tags?.includes(newTag)) {
        setCourseInfo({
          ...courseInfo,
          tags: [...(courseInfo.tags || []), newTag],
        });
      }
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    const newTags = courseInfo.tags.filter((_: string, i: number) => i !== index);
    setCourseInfo({ ...courseInfo, tags: newTags });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseInfo.tags?.length || !courseInfo.category) {
      setIsValid(false);
      toast.error("Please fill all required fields");
      return;
    }
    setActive(active + 1);
  };

  const loadDemoData = () => {
    setCourseInfo({
      tags: ["React", "TypeScript", "Next.js"],
      category: "1",
    });
    toast.success("Demo data loaded!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Course Information
        </h2>
        <button
          type="button"
          onClick={loadDemoData}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          Load Demo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tags Input */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Course Tags
            <span className="text-red-500 ml-1">*</span>
          </label>
          
          <div className={`p-2 border ${
            isValid ? "border-gray-300 dark:border-gray-600" : "border-red-500"
          } rounded-lg transition-colors`}>
            <div className="flex flex-wrap gap-2 mb-2">
              {courseInfo.tags?.map((tag: string, index: number) => (
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
          
          {!isValid && (
            <p className="flex items-center text-sm text-red-500">
              <FiInfo className="mr-1" />
              At least one tag is required
            </p>
          )}
        </div>

        {/* Category Select */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Course Category
            <span className="text-red-500 ml-1">*</span>
          </label>
          
          <select
            className={`w-full px-4 py-3 rounded-lg border ${
              isValid ? "border-gray-300 dark:border-gray-600" : "border-red-500"
            } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all`}
            value={courseInfo.category}
            onChange={(e) => setCourseInfo({ ...courseInfo, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {demoCategories.map((item) => (
              <option key={item._id} value={item._id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => setActive(active - 1)}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors ${
              (!courseInfo.tags?.length || !courseInfo.category)
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-lg hover:shadow-blue-500/20"
            }`}
            disabled={!courseInfo.tags?.length || !courseInfo.category}
          >
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CourseInformation;