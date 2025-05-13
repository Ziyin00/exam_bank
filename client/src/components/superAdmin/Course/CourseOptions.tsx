// components/course/CourseOptions.tsx
import { Progress } from '@react-three/drei';
import { motion } from 'framer-motion';

interface CourseOptionsProps {
  active: number;
  setActive: (step: number) => void;
  progress: number;
}

const steps = [
  { title: 'Basic Info', description: 'Course fundamentals' },
  { title: 'Requirements', description: 'Benefits & prerequisites' },
  { title: 'Content', description: 'Course structure' },
  { title: 'Preview', description: 'Final review' }
];

const CourseOptions = ({ active, setActive, progress }: CourseOptionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Course Progress</h3>
        <Progress value={progress} className="h-2 bg-gray-200 dark:bg-gray-800" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {Math.round(progress)}% complete
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Steps</h3>
        <nav className="space-y-2">
          {steps.map((step, index) => (
            <button
              key={step.title}
              onClick={() => setActive(index)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                active === index
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="font-medium">{step.title}</div>
              <div className="text-sm">{step.description}</div>
            </button>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default CourseOptions;