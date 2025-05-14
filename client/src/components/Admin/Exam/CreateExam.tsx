// components/CreateExam.tsx
"use client";
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import toast from 'react-hot-toast';
import {
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePlus,
} from 'react-icons/ai'; // Added AiOutlineClose
import { MdOutlineUpload } from 'react-icons/md';

import {
  createExam as apiCreateExam,
  deleteExam as apiDeleteExam,
  Exam,
  getExams as apiGetExams,
  updateExam as apiUpdateExam,
} from '@/src/api/examApi';
import { style } from '@/src/styles/style';

const CreateExam: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Partial<Exam>>({});
  const [imageUploadMethod, setImageUploadMethod] = useState<"url" | "file">("url");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Image Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiGetExams();
      setExams(data);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Error fetching exams. See console for details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleImageUpload = useCallback((file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, GIF, WEBP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
        toast.error("Image is too large (max 2MB for this demo).");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentExam(prev => ({ ...prev, sheetImage: reader.result as string }));
      toast.success("Image preview updated.");
    };
    reader.onerror = () => {
        toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentExam.title?.trim() || !currentExam.description?.trim()) {
      toast.error("Exam Title and Description are required.");
      setIsSubmitting(false);
      return;
    }

    const examDataPayload = {
        title: currentExam.title!,
        description: currentExam.description!,
        sheetImage: currentExam.sheetImage || "",
    };

    try {
      if (currentExam.id) {
        await apiUpdateExam(currentExam.id, examDataPayload);
        toast.success("Exam updated successfully!");
      } else {
        await apiCreateExam(examDataPayload);
        toast.success("Exam created successfully!");
      }
      fetchExams();
      setCurrentExam({});
      setImageUploadMethod("url");
    } catch (error: any) {
      console.error("Error saving exam:", error);
      toast.error(error.message || "Error saving exam. See console for details.");
    } finally {
        setIsSubmitting(false);
    }
  }, [currentExam, fetchExams]);

  const handleEdit = useCallback((exam: Exam) => {
    setCurrentExam({ ...exam, sheetImage: exam.sheetImage });
    setImageUploadMethod(exam.sheetImage && exam.sheetImage.startsWith('data:image') ? "file" : "url");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = useCallback(async (examId: string) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) {
        return;
    }
    setIsSubmitting(true);
    try {
      await apiDeleteExam(examId);
      toast.success("Exam deleted successfully!");
      fetchExams();
      if (currentExam.id === examId) {
        setCurrentExam({});
      }
    } catch (error: any) {
      console.error("Error deleting exam:", error);
      toast.error(error.message || "Error deleting exam. See console for details.");
    } finally {
        setIsSubmitting(false);
    }
  }, [fetchExams, currentExam.id]);

  // Modal Handler Functions
  const openImageModal = useCallback((src: string) => {
    if (src) {
      setModalImageSrc(src);
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  }, []);

  const closeImageModal = useCallback(() => {
    setIsModalOpen(false);
    setModalImageSrc(null);
    document.body.style.overflow = 'auto'; // Restore background scrolling
  }, []);

  // Effect to handle Escape key for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeImageModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, closeImageModal]);

  return (
    <>
      <div className="w-[90%] 800px:w-[80%] m-auto py-8 text-black dark:text-white">
        {/* Exam Creation Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl mb-12 shadow-lg border dark:border-gray-700">
          <h2 className="text-2xl 800px:text-3xl font-bold mb-8 border-b-2 dark:border-gray-700 pb-4">
            {currentExam.id ? "Edit Exam" : "Create New Exam"}
          </h2>

          <div className="grid gap-6 mb-8">
            {/* Title and Description Inputs (unchanged) */}
            <div>
              <label htmlFor="examTitle" className={style.label}>Exam Title <span className="text-red-500">*</span></label>
              <input
                id="examTitle" type="text" className={style.input} value={currentExam.title || ""}
                onChange={(e) => setCurrentExam(prev => ({ ...prev, title: e.target.value }))}
                disabled={isSubmitting} placeholder="e.g., Midterm Physics Test"
              />
            </div>
            <div>
              <label htmlFor="examDescription" className={style.label}>Exam Description <span className="text-red-500">*</span></label>
              <textarea
                id="examDescription" rows={4} className={`${style.input} !h-min resize-y`}
                value={currentExam.description || ""}
                onChange={(e) => setCurrentExam(prev => ({ ...prev, description: e.target.value }))}
                disabled={isSubmitting} placeholder="Details about the exam, topics covered, etc."
              />
            </div>

            {/* Image Upload Section (modified for clickable preview) */}
            <div>
              <label className={style.label}>Sheet Image (Optional)</label>
              <div className="flex gap-4 mb-3">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    imageUploadMethod === "url" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setImageUploadMethod("url")} disabled={isSubmitting}
                >
                  Use Image URL
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    imageUploadMethod === "file" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setImageUploadMethod("file")} disabled={isSubmitting}
                >
                  Upload Image File
                </button>
              </div>

              {imageUploadMethod === "url" ? (
                <input
                  type="url" placeholder="https://example.com/image.png" className={style.input}
                  value={currentExam.sheetImage || ""}
                  onChange={(e) => setCurrentExam(prev => ({ ...prev, sheetImage: e.target.value }))}
                  disabled={isSubmitting}
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <input
                    type="file" accept="image/png, image/jpeg, image/gif, image/webp" className="hidden"
                    id="sheet-upload" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="sheet-upload" className={`cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <MdOutlineUpload className="text-5xl text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag & drop or <span className="text-blue-600 dark:text-blue-400 font-semibold">click to browse</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 2MB (PNG, JPG, GIF, WEBP)</p>
                  </label>
                </div>
              )}

              {currentExam.sheetImage && (
                <div className="mt-6">
                  <p className={`${style.label} mb-2`}>Image Preview (Click to enlarge):</p>
                  <img
                    src={currentExam.sheetImage}
                    alt="Sheet preview"
                    className="w-full max-w-md h-auto max-h-80 object-contain rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openImageModal(currentExam.sheetImage!)}
                    onContextMenu={(e) => e.preventDefault()} // Deterrent for form preview
                    draggable="false" // Deterrent for form preview
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit and Cancel Buttons (unchanged) */}
          <div className="flex flex-wrap gap-4 pt-4 border-t dark:border-gray-700">
            <button
              type="submit" disabled={isSubmitting}
              className="flex items-center bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px] justify-center"
            >
              {isSubmitting ? (
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : <AiOutlinePlus className="mr-2" /> }
              {isSubmitting ? "Saving..." : (currentExam.id ? "Update Exam" : "Create Exam")}
            </button>
            {currentExam.id && (
              <button
                type="button" onClick={() => { setCurrentExam({}); setImageUploadMethod("url");}}
                disabled={isSubmitting}
                className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-6 py-2.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Exam Bank (modified for clickable images) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
          <h2 className="text-2xl 800px:text-3xl font-bold mb-8 border-b-2 dark:border-gray-700 pb-4">Exam Bank</h2>
          {isLoading && exams.length === 0 ? (
              <div className="text-center py-12">
                   <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">Loading exams...</p>
              </div>
          ) : !isLoading && exams.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-xl mb-2">No exams created yet.</p>
              <p>Use the form above to add your first exam!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 1200px:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow border dark:border-gray-700 flex flex-col"
                >
                  {exam.sheetImage && (
                    <img
                      src={exam.sheetImage}
                      alt={`${exam.title} sheet (Click to enlarge)`}
                      className="w-full h-48 object-contain mb-4 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(exam.sheetImage!)}
                      onContextMenu={(e) => e.preventDefault()} // Deterrent for list view
                      draggable="false" // Deterrent for list view
                    />
                  )}
                  <div className="flex-grow">
                      <h3 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100">{exam.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          Created: {new Date(exam.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                      {exam.description}
                      </p>
                  </div>
                  <div className="flex justify-end items-center gap-3 pt-3 border-t dark:border-gray-700 mt-auto">
                    <button
                      onClick={() => handleEdit(exam)} title="Edit Exam" disabled={isSubmitting}
                      className="text-blue-600 dark:text-blue-400 hover:opacity-70 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                    >
                      <AiOutlineEdit size={22} />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)} title="Delete Exam" disabled={isSubmitting}
                      className="text-red-600 dark:text-red-400 hover:opacity-70 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      <AiOutlineDelete size={22} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && modalImageSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={closeImageModal} // Close on backdrop click
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-modal-title"
        >
          <div
            className="relative bg-white dark:bg-gray-900 p-2 sm:p-4 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside content
          >
            <h3 id="image-modal-title" className="sr-only">Enlarged Exam Sheet Image</h3>
            <button
              onClick={closeImageModal}
              className="absolute -top-3 -right-3 sm:top-2 sm:right-2 z-10 text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 p-2 rounded-full transition-colors"
              aria-label="Close image preview"
            >
              <AiOutlineClose size={20} />
            </button>
            <div className="flex-grow flex items-center justify-center overflow-hidden">
              <img
                src={modalImageSrc}
                alt="Enlarged exam sheet"
                className="max-w-full max-h-[calc(90vh-60px)] object-contain select-none"
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
                style={{ WebkitTouchCallout: 'none' }} // For iOS Safari to disable callout on long press
              />
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
                Image viewing is protected. Please do not attempt to copy or distribute.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateExam;