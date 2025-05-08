// components/course/CoursePreview.tsx
import { CourseFormData } from '@/src/types/course';
import { motion } from 'framer-motion';

interface CoursePreviewProps {
  formData: CourseFormData;
  onBack: () => void;
  isLoading: boolean;
  onPublish: () => Promise<void>;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({
  formData,
  onBack,
  isLoading,
  onPublish
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold">Course Preview</h2>
      
      <div className="space-y-6">
        {/* Preview all course data */}
        <div>
          <h3>{formData.title}</h3>
          <p>{formData.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>Category: {formData.categoryId}</div>
          <div>Department: {formData.departmentId}</div>
        </div>

        <div>
          <h4>Benefits</h4>
          <ul>
            <li>{formData.benefit1}</li>
            {formData.benefit2 && <li>{formData.benefit2}</li>}
          </ul>
        </div>

        <div>
          <h4>Prerequisites</h4>
          <ul>
            <li>{formData.prerequisite1}</li>
            {formData.prerequisite2 && <li>{formData.prerequisite2}</li>}
          </ul>
        </div>

        {formData.courseContent.map((section, idx) => (
          <div key={idx} className="p-4 border rounded">
            <h5>{section.section}</h5>
            <p>{section.description}</p>
            {section.links.map((link, linkIdx) => (
              <a key={linkIdx} href={link.url} target="_blank" rel="noreferrer">
                {link.title}
              </a>
            ))}
          </div>
        ))}

        <div className="flex justify-between">
          <button onClick={onBack} disabled={isLoading}>
            Back
          </button>
          <button onClick={onPublish} disabled={isLoading}>
            {isLoading ? 'Publishing...' : 'Publish Course'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CoursePreview;