// components/course/CourseData.tsx
import { CourseFormData } from '@/src/types/course';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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
  onBack
}) => {
  const validateFields = () => {
    return !!formData.benefit1 && !!formData.prerequisite1;
  };

  const handleNext = () => {
    if (!validateFields()) {
      toast.error('Please fill required fields');
      return;
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold">Course Requirements</h2>
      
      <div className="space-y-6">
        <div>
          <label>Primary Benefit *</label>
          <input
            value={formData.benefit1}
            onChange={e => setFormData(p => ({ ...p, benefit1: e.target.value }))}
            required
          />
        </div>

        <div>
          <label>Secondary Benefit</label>
          <input
            value={formData.benefit2}
            onChange={e => setFormData(p => ({ ...p, benefit2: e.target.value }))}
          />
        </div>

        <div>
          <label>Primary Prerequisite *</label>
          <input
            value={formData.prerequisite1}
            onChange={e => setFormData(p => ({ ...p, prerequisite1: e.target.value }))}
            required
          />
        </div>

        <div>
          <label>Secondary Prerequisite</label>
          <input
            value={formData.prerequisite2}
            onChange={e => setFormData(p => ({ ...p, prerequisite2: e.target.value }))}
          />
        </div>

        <div className="flex justify-between">
          <button onClick={onBack}>Back</button>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseData;