// components/course/CourseData.tsx
'use client';
import { CourseFormData } from '@/src/types/course'; // Adjust path
import { motion } from 'framer-motion';
import { useToast } from '../../ui/use-toast'; // Assuming this path is correct

interface CourseDataProps {
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  onNext: () => void;
  onBack: () => void;
}

const CourseData: React.FC<CourseDataProps> = ({
  formData,
  setFormData,
  onNext,
  onBack,
}) => {
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow empty string or valid number
    setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
  };


  const validateAndNext = () => {
    if (!formData.benefit1.trim() || !formData.prerequisite1.trim() || !formData.year) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields (Primary Benefit, Primary Prerequisite, Year).',
      });
      return;
    }
    if (typeof formData.year === 'number' && (formData.year < 1900 || formData.year > new Date().getFullYear() + 5) ) {
      toast({
        variant: 'destructive',
        title: 'Invalid Year',
        description: `Please enter a valid year (e.g., ${new Date().getFullYear()}).`,
      });
      return;
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800"
    >
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        Course Details & Requirements
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="benefit1" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Primary Benefit <span className="text-red-500">*</span>
            </label>
            <input
              id="benefit1"
              name="benefit1"
              value={formData.benefit1}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Master modern JavaScript"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="benefit2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Secondary Benefit (Optional)
            </label>
            <input
              id="benefit2"
              name="benefit2"
              value={formData.benefit2 || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Build portfolio-ready projects"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="prerequisite1" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Primary Prerequisite <span className="text-red-500">*</span>
            </label>
            <input
              id="prerequisite1"
              name="prerequisite1"
              value={formData.prerequisite1}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Basic HTML & CSS knowledge"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prerequisite2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Secondary Prerequisite (Optional)
            </label>
            <input
              id="prerequisite2"
              name="prerequisite2"
              value={formData.prerequisite2 || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Familiarity with any programming language"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Course Year <span className="text-red-500">*</span>
          </label>
          <input
            id="year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleYearChange}
            className="w-full md:w-1/2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder={`e.g., ${new Date().getFullYear()}`}
            min="1900"
            max={new Date().getFullYear() + 5} // Allow a bit into the future
          />
        </div>


        <div className="flex justify-between pt-4">
          <button
            onClick={onBack}
            type="button"
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors text-sm font-medium"
          >
            Back
          </button>
          <button
            onClick={validateAndNext}
            type="button"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            Continue
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseData;