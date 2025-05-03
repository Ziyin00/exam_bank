// CoursePreview.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiEdit, FiExternalLink } from 'react-icons/fi';
import { BsLink45Deg } from 'react-icons/bs';

interface CoursePreviewProps {
  data: any;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({
  data,
  onSubmit,
  onBack,
  isLoading
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Preview</h2>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
          >
            <FiEdit /> Edit
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{data.name}</h3>
            <p className="text-gray-600 dark:text-gray-300">{data.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Price</h4>
              <p>${data.price} (Est. ${data.estimatedPrice})</p>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2">Category</h4>
              <p>{data.category}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Benefits</h4>
            <ul className="list-disc pl-6 space-y-2">
              {data.benefits.map((benefit: any, index: number) => (
                <li key={index}>{benefit.title}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Prerequisites</h4>
            <ul className="list-disc pl-6 space-y-2">
              {data.prerequisites.map((prerequisite: any, index: number) => (
                <li key={index}>{prerequisite.title}</li>
              ))}
            </ul>
          </div>

          {data.courseContent.map((section: any, index: number) => (
            <div key={index} className="space-y-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">{section.section}</h4>
                {section.imageUrl && (
                  <img
                    src={section.imageUrl}
                    alt={section.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
              </div>
              <p>{section.description}</p>
              {section.links.map((link: any, linkIndex: number) => (
                <div key={linkIndex} className="flex items-center gap-2">
                  <BsLink45Deg />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    {link.title} <FiExternalLink />
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"
          >
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
          >
            {isLoading ? (
              'Publishing...'
            ) : (
              <>
                <FiCheckCircle /> Publish Course
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CoursePreview;