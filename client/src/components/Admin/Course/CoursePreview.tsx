import React, { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BsLink45Deg, BsChevronDoubleUp } from "react-icons/bs";
import { FiEdit, FiExternalLink } from "react-icons/fi";
import { RiLoader4Line } from "react-icons/ri";
import toast from "react-hot-toast";

const CoursePreview: FC<any> = ({
  active,
  setActive,
  courseData,
  handleCourseCreate,
  isEdit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [demoData, setDemoData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Demo data loader
  useEffect(() => {
    if (!courseData?.courseContent?.length) {
      setDemoData({
        courseContent: [
          // ... (same demo data structure as previous components)
        ]
      });
    }
  }, [courseData]);

  const groupedSections = (courseData?.courseContent || demoData?.courseContent)?.reduce((acc: any, item: any) => {
    // ... existing grouping logic
  }, {});

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await handleCourseCreate();
      toast.success(`Course ${isEdit ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      toast.error("Error processing request");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      // Update active section based on scroll position
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-[90%] max-w-7xl m-auto py-8 text-black dark:text-white">
      {/* Floating Actions */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-50">
        {showScrollTop && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={scrollToTop}
            className="p-3 bg-blue-500 text-white rounded-full shadow-lg"
          >
            <BsChevronDoubleUp className="text-xl" />
          </motion.button>
        )}
      </div>

      {/* Course Preview Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 gradient-text">
          {courseData?.name || "Course Preview"}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {courseData?.description || "Review your course before publishing"}
        </p>
      </motion.div>

      {/* Table of Contents */}
      <div className="sticky top-20 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 mb-8 z-40">
        <h3 className="text-lg font-semibold mb-3">Table of Contents</h3>
        <div className="flex flex-wrap gap-3">
          {Object.keys(groupedSections || {}).map((sectionTitle, index) => (
            <a
              key={sectionTitle}
              href={`#section-${index}`}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              Section {index + 1}: {sectionTitle}
            </a>
          ))}
        </div>
      </div>

      {/* Course Content */}
      {Object.entries(groupedSections || {}).map(([sectionTitle, contents], sectionIndex) => (
        <motion.section
          key={sectionIndex}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          id={`section-${sectionIndex}`}
          className="mb-16 scroll-mt-24"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              <span className="text-blue-500">Section {sectionIndex + 1}:</span> {sectionTitle}
            </h2>
            <button
              onClick={() => setActive(2)}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
            >
              <FiEdit /> Edit Section
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(contents as any[]).map((item, contentIndex) => (
              <motion.div
                key={contentIndex}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {item.imageUrl && (
                  <div className="mb-6 relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-56 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="text-white text-sm px-4 py-2 border rounded-lg hover:bg-white/10">
                        View Fullscreen
                      </button>
                    </div>
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line leading-relaxed">
                  {item.description}
                </p>

                {item.links?.map((link: any, linkIndex: number) => (
                  <div key={linkIndex} className="flex items-center mb-3 group">
                    <BsLink45Deg className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700"
                    >
                      {link.title}
                      <FiExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </motion.section>
      ))}

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 py-4 shadow-lg mt-12">
        <div className="max-w-4xl m-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setActive(active - 1)}
            className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FiEdit /> Edit Course
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RiLoader4Line className="animate-spin" />
                Processing...
              </>
            ) : isEdit ? (
              "Update Course"
            ) : (
              "Publish Course"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;