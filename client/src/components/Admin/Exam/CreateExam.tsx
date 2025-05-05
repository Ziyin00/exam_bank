// components/CreateExam.tsx
"use client";
import React, { useState, useCallback, useEffect } from "react";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { MdOutlineUpload } from "react-icons/md";
import toast from "react-hot-toast";
import { style } from "@/src/styles/style";
// import { createExam, updateExam, deleteExam, getExams } from "@/api/examApi";

interface Exam {
  id: string;
  title: string;
  description: string;
  sheetImage: string;
  createdAt: Date;
}

const CreateExam: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Partial<Exam>>({});
  const [imageUploadMethod, setImageUploadMethod] = useState<"url" | "file">("url");

  // Fetch exams from the backend
  const fetchExams = useCallback(async () => {
    try {
      const data = await getExams();
      setExams(data);
    } catch (error) {
      toast.error("Error fetching exams");
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      return toast.error("Please upload a valid image file");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCurrentExam(prev => ({ ...prev, sheetImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentExam.title || !currentExam.description) {
      return toast.error("Please fill all required fields");
    }

    const newExam: Exam = {
      id: currentExam.id || Date.now().toString(),
      title: currentExam.title!,
      description: currentExam.description!,
      sheetImage: currentExam.sheetImage || "",
      createdAt: new Date(),
    };

    try {
      if (currentExam.id) {
        await updateExam(currentExam.id, newExam);
        toast.success("Exam updated");
      } else {
        await createExam(newExam);
        toast.success("Exam created");
      }
      fetchExams(); // Re-fetch the exams after update/create
      setCurrentExam({});
    } catch (error) {
      toast.error("Error saving exam");
    }
  }, [currentExam, fetchExams]);

  const handleEdit = useCallback((exam: Exam) => {
    setCurrentExam(exam);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = useCallback(async (examId: string) => {
    try {
      await deleteExam(examId);
      toast.success("Exam deleted");
      fetchExams(); // Re-fetch the exams after deletion
    } catch (error) {
      toast.error("Error deleting exam");
    }
  }, [fetchExams]);

  return (
    <div className="w-[90%] m-auto py-8 text-black dark:text-white">
      {/* Exam Creation Form */}
      <form onSubmit={handleSubmit} className="bg-[#cdc8c817] p-6 rounded-xl mb-12 shadow-lg">
        <h2 className="text-3xl font-bold mb-8 border-b-2 pb-4">
          {currentExam.id ? "Edit Exam" : "Create New Exam"}
        </h2>

        <div className="grid gap-6 mb-8">
          <div>
            <label className={style.label}>Exam Title</label>
            <input
              type="text"
              className={style.input}
              value={currentExam.title || ""}
              onChange={(e) => setCurrentExam(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label className={style.label}>Exam Description</label>
            <textarea
              rows={4}
              className={`${style.input} !h-min`}
              value={currentExam.description || ""}
              onChange={(e) => setCurrentExam(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className={style.label}>Sheet Image</label>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                className={`px-4 py-2 rounded ${
                  imageUploadMethod === "url" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
                }`}
                onClick={() => setImageUploadMethod("url")}
              >
                Image URL
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded ${
                  imageUploadMethod === "file" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
                }`}
                onClick={() => setImageUploadMethod("file")}
              >
                Upload Image
              </button>
            </div>

            {imageUploadMethod === "url" ? (
              <input
                type="text"
                placeholder="Paste image URL here..."
                className={style.input}
                value={currentExam.sheetImage || ""}
                onChange={(e) => setCurrentExam(prev => ({ ...prev, sheetImage: e.target.value }))}
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="sheet-upload"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
                <label htmlFor="sheet-upload" className="cursor-pointer">
                  <MdOutlineUpload className="text-4xl mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Drag and drop image or click to upload</p>
                </label>
              </div>
            )}

            {currentExam.sheetImage && (
              <div className="mt-4">
                <p className={style.label}>Preview:</p>
                <img
                  src={currentExam.sheetImage}
                  alt="Sheet preview"
                  className="mt-2 w-full max-w-xs h-48 object-contain rounded-lg border dark:border-gray-600"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <AiOutlinePlus className="mr-2" />
            {currentExam.id ? "Update Exam" : "Create Exam"}
          </button>

          {currentExam.id && (
            <button
              type="button"
              onClick={() => setCurrentExam({})}
              className="bg-gray-300 dark:bg-gray-700 px-6 py-3 rounded-lg hover:opacity-80 transition-opacity"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Exam Bank */}
      <div className="bg-[#cdc8c817] p-6 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-8 border-b-2 pb-4">Exam Bank</h2>

        {exams.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No exams created yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {exam.sheetImage && (
                  <img
                    src={exam.sheetImage}
                    alt="Exam sheet thumbnail"
                    className="w-full h-48 object-contain mb-4 rounded-lg border dark:border-gray-600"
                  />
                )}
                <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {exam.description}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleEdit(exam)}
                    className="text-blue-600 dark:text-blue-400 hover:opacity-80"
                  >
                    <AiOutlineEdit size={24} />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="text-red-600 dark:text-red-400 hover:opacity-80"
                  >
                    <AiOutlineDelete size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateExam;
