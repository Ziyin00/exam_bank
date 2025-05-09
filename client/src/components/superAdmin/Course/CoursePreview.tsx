// components/course/CoursePreview.tsx
'use client';
import { CourseFormData } from '@/src/types/course'; // Adjust path
import { motion } from 'framer-motion';
import { FiImage, FiLink, FiLoader, FiCheckCircle } from 'react-icons/fi'; // FiLoader for loading state

interface CoursePreviewProps {
  formData: CourseFormData;
  onBack: () => void;
  isLoading: boolean;
  onPublish: () => Promise<void>;
  categoriesMap: Map<number, string>; // Pass down maps for display
  departmentsMap: Map<number, string>; // Pass down maps for display
}

const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-md text-gray-800 dark:text-white">{value || 'N/A'}</p>
  </div>
);

const CoursePreview: React.FC<CoursePreviewProps> = ({
  formData,
  onBack,
  isLoading,
  onPublish,
  categoriesMap,
  departmentsMap
}) => {
  const categoryName = categoriesMap.get(Number(formData.categoryId)) || `ID: ${formData.categoryId}`;
  const departmentName = departmentsMap.get(Number(formData.departmentId)) || `ID: ${formData.departmentId}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800"
    >
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Course Preview & Publish</h2>
      
      <div className="space-y-6">
        {/* Course Information Summary */}
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
          <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{formData.title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{formData.description}</p>
          
          {formData.imageFile && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Thumbnail:</p>
              <img 
                src={URL.createObjectURL(formData.imageFile)} 
                alt="Thumbnail Preview" 
                className="max-w-xs max-h-48 rounded-md border border-gray-300 dark:border-gray-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formData.imageFile.name}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            <DetailItem label="Course Tag" value={formData.tag} />
            <DetailItem label="Category" value={categoryName} />
            <DetailItem label="Department" value={departmentName} />
            <DetailItem label="Year" value={formData.year} />
          </div>
        </div>

        {/* Benefits & Prerequisites */}
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white">Benefits</h4>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
            <li>{formData.benefit1}</li>
            {formData.benefit2 && <li>{formData.benefit2}</li>}
          </ul>

          <h4 className="text-xl font-semibold text-gray-800 dark:text-white mt-4">Prerequisites</h4>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
            <li>{formData.prerequisite1}</li>
            {formData.prerequisite2 && <li>{formData.prerequisite2}</li>}
          </ul>
        </div>

        {/* Course Content Sections */}
        <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Course Content</h3>
            {formData.courseContent.map((section, idx) => (
            <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h5 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-2">{section.section}</h5>
                <p className="text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-wrap">{section.description}</p>
                {section.links.length > 0 && (
                <div>
                    <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Resources:</h6>
                    <ul className="list-none space-y-1">
                    {section.links.map((link, linkIdx) => (
                        link.url && link.title && ( // Only display if both title and URL exist
                            <li key={linkIdx} className="flex items-center gap-2">
                                <FiLink className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                                title={link.url}
                                >
                                {link.title}
                                </a>
                            </li>
                        )
                    ))}
                    </ul>
                </div>
                )}
            </div>
            ))}
            {formData.courseContent.length === 0 && (
                 <p className="text-gray-500 dark:text-gray-400">No course content sections have been added yet.</p>
            )}
        </div>


        <div className="flex justify-between pt-6">
          <button 
            onClick={onBack} 
            disabled={isLoading}
            type="button"
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            Back to Edit Content
          </button>
          <button 
            onClick={onPublish} 
            disabled={isLoading}
            type="button"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin h-5 w-5" />
                Publishing...
              </>
            ) : (
              <>
                <FiCheckCircle className="h-5 w-5" />
                Publish Course
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CoursePreview;