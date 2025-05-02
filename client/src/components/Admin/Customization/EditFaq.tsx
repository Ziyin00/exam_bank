import { style } from "@/src/styles/style";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineDelete } from "react-icons/ai";
import { HiMinus, HiPlus } from "react-icons/hi";
import { IoMdAddCircleOutline } from "react-icons/io";
import { v4 as uuidv4 } from "uuid";

interface Question {
  id: string;
  question: string;
  answer: string;
  active: boolean;
}

interface EditFaqProps {
  initialQuestions?: Question[];
  onSave: (questions: Question[]) => Promise<void>;
}

const EditFaq = ({ initialQuestions = [], onSave }: EditFaqProps) => {
  const [questions, setQuestions] = useState<Question[]>(() =>
    initialQuestions.map(q => ({ ...q, id: q.id || uuidv4() }))
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialQuestions.length === 0) {
      newFaqHandler();
    }
  }, [initialQuestions]);

  const toggleQuestion = (id: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, active: !q.active } : q))
    );
  };

  const handleQuestionChange = (id: string, value: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, question: value } : q))
    );
  };

  const handleAnswerChange = (id: string, value: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, answer: value } : q))
    );
  };

  const newFaqHandler = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: uuidv4(),
        question: "",
        answer: "",
        active: true,
      },
    ]);
  };

  const deleteQuestion = (id: string) => {
    if (questions.length === 1) {
      toast.error("You must have at least one FAQ item");
      return;
    }
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const hasChanges = () => {
    return JSON.stringify(initialQuestions) !== JSON.stringify(questions);
  };

  const hasEmptyFields = () => {
    return questions.some(q => !q.question.trim() || !q.answer.trim());
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      toast.error("No changes to save");
      return;
    }
    if (hasEmptyFields()) {
      toast.error("Please fill all question and answer fields");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(questions);
      toast.success("FAQs saved successfully!");
    } catch (error) {
      toast.error("Failed to save FAQs");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-[90%] 800px:w-[80%] m-auto mt-8 p-6 dark:bg-gray-800 bg-white rounded-lg shadow-lg">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center dark:text-white text-gray-800">
          Manage FAQs
        </h2>

        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="border dark:border-gray-700 border-gray-200 rounded-lg p-4 transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <input
                  className={`${style.input} flex-1 border-none bg-transparent text-lg font-medium`}
                  value={q.question}
                  onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                  placeholder="Enter your question..."
                  aria-label="Question"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleQuestion(q.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    aria-label={q.active ? "Collapse" : "Expand"}
                  >
                    {q.active ? (
                      <HiMinus className="h-5 w-5" />
                    ) : (
                      <HiPlus className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                    aria-label="Delete question"
                  >
                    <AiOutlineDelete className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {q.active && (
                <div className="mt-4 pl-2 border-l-4 border-blue-500">
                  <textarea
                    className={`${style.input} w-full border-none bg-transparent`}
                    value={q.answer}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Enter your answer..."
                    rows={3}
                    aria-label="Answer"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={newFaqHandler}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
            aria-label="Add new FAQ"
          >
            <IoMdAddCircleOutline className="h-6 w-6" />
            <span className="font-medium">Add New FAQ</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges() || hasEmptyFields() || isSaving}
            className={`${style.button} ${
              (!hasChanges() || hasEmptyFields() || isSaving)
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white px-6 py-2 rounded-lg transition-colors`}
            aria-label="Save changes"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFaq;