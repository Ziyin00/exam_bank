// CourseContent.tsx
import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineCloudUpload, AiOutlineDelete } from 'react-icons/ai';
import { BsLink45Deg } from 'react-icons/bs';
import { FiArrowLeft, FiArrowRight, FiEdit, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CourseContentProps {
  content: any[];
  setContent: React.Dispatch<React.SetStateAction<any[]>>;
  onNext: () => void;
  onBack: () => void;
}

const CourseContent: React.FC<CourseContentProps> = ({
  content,
  setContent,
  onNext,
  onBack
}) => {
  const [activeSection, setActiveSection] = useState(0);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');

  const handleImageUpload = useCallback((index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const updated = [...content];
      updated[index].imageUrl = reader.result;
      setContent(updated);
    };
    reader.readAsDataURL(file);
  }, [content, setContent]);

  const addNewSection = () => {
    setContent([...content, {
      imageUrl: '',
      title: '',
      description: '',
      section: `Section ${content.length + 1}`,
      links: [{ title: '', url: '' }]
    }]);
    setActiveSection(content.length);
  };

  const validateSection = (index: number) => {
    const section = content[index];
    if (!section.title.trim() || !section.description.trim()) {
      toast.error('Please fill all required fields in current section');
      return false;
    }
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Content</h2>
          <button
            onClick={addNewSection}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
          >
            <FiPlus /> New Section
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {content.map((section, index) => (
            <button
              key={index}
              onClick={() => setActiveSection(index)}
              className={`px-4 py-2 rounded-lg ${
                activeSection === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            >
              Section {index + 1}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {content.map((section, index) => activeSection === index && (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Section Title
                </label>
                <input
                  type="text"
                  placeholder="Enter section title"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                  value={section.title}
                  onChange={e => {
                    const updated = [...content];
                    updated[index].title = e.target.value;
                    setContent(updated);
                  }}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Section Image
                </label>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setImageInputMode('upload')}
                    className={`px-4 py-2 rounded-lg ${
                      imageInputMode === 'upload'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    Upload Image
                  </button>
                  <button
                    onClick={() => setImageInputMode('url')}
                    className={`px-4 py-2 rounded-lg ${
                      imageInputMode === 'url'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {imageInputMode === 'upload' ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="file-upload"
                      onChange={e => e.target.files?.[0] && handleImageUpload(index, e.target.files[0])}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <AiOutlineCloudUpload className="text-4xl" />
                      {section.imageUrl ? 'Change Image' : 'Upload Section Image'}
                    </label>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter image URL"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                    value={section.imageUrl}
                    onChange={e => {
                      const updated = [...content];
                      updated[index].imageUrl = e.target.value;
                      setContent(updated);
                    }}
                  />
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Section Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe this section..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                  value={section.description}
                  onChange={e => {
                    const updated = [...content];
                    updated[index].description = e.target.value;
                    setContent(updated);
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Resources & Links</h3>
                  <button
                    onClick={() => {
                      const updated = [...content];
                      updated[index].links.push({ title: '', url: '' });
                      setContent(updated);
                    }}
                    className="flex items-center gap-2 text-blue-500"
                  >
                    <FiPlus /> Add Link
                  </button>
                </div>

                {section.links.map((link: any, linkIndex: number) => (
                  <div key={linkIndex} className="flex items-center gap-4">
                    <BsLink45Deg className="text-xl" />
                    <input
                      type="text"
                      placeholder="Link title"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                      value={link.title}
                      onChange={e => {
                        const updated = [...content];
                        updated[index].links[linkIndex].title = e.target.value;
                        setContent(updated);
                      }}
                    />
                    <input
                      type="url"
                      placeholder="https://example.com"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                      value={link.url}
                      onChange={e => {
                        const updated = [...content];
                        updated[index].links[linkIndex].url = e.target.value;
                        setContent(updated);
                      }}
                    />
                    <button
                      onClick={() => {
                        const updated = [...content];
                        updated[index].links.splice(linkIndex, 1);
                        setContent(updated);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <AiOutlineDelete />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"
          >
            <FiArrowLeft /> Back
          </button>
          <button
            onClick={() => validateSection(activeSection) && onNext()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Next <FiArrowRight />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseContent;