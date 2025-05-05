"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Clock, MessageSquareText, Send, User2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { TextareaAutosize } from "@mui/material";
import { Button } from "../../ui/button";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Answer() {
  const [selectedQuestion, setSelectedQuestion] = React.useState(null);
  const [answer, setAnswer] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [questions, setQuestions] = React.useState<any[]>([]);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        toast.error("Error fetching questions.");
      }
    };
    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      // Simulate API call to submit answer
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submit-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          answer,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setAnswer("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        toast.error(data.message || "Error submitting answer");
      }
    } catch (error) {
      setStatus("error");
      toast.error("Error submitting answer.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/30 backdrop-blur-lg">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquareText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Questions
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                Recent Questions
              </h2>
              <div className="space-y-3">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    onClick={() => setSelectedQuestion(question)}
                    className={cn(
                      "p-4 rounded-lg cursor-pointer transition-all",
                      "hover:bg-blue-50/50 dark:hover:bg-gray-700/50",
                      selectedQuestion?.id === question.id
                        ? "bg-blue-100/50 dark:bg-gray-700 border-l-4 border-blue-600"
                        : "bg-gray-100/30 dark:bg-gray-800/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {question.title}
                      </h3>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          question.status === "answered"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        )}
                      >
                        {question.status === "answered" ? "Answered" : "Pending"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {question.content}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <User2 className="h-4 w-4" />
                      <span>{question.author}</span>
                      <span>•</span>
                      <span>{question.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Answer Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              {selectedQuestion ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MessageSquareText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Answer Question
                    </h2>
                  </div>

                  <div className="mb-6 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedQuestion.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedQuestion.content}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <User2 className="h-4 w-4" />
                      <span>{selectedQuestion.author}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <TextareaAutosize
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Write your detailed answer here..."
                      className="min-h-[200px] mb-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />

                    <div className="flex justify-end gap-3">
                      <Button
                        type="submit"
                        disabled={status === "submitting" || !answer.trim()}
                        className="gap-2"
                      >
                        {status === "submitting" ? (
                          <Clock className="h-4 w-4 animate-pulse" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {status === "submitting" ? "Submitting..." : "Submit Answer"}
                      </Button>
                    </div>
                  </form>

                  {/* Status Messages */}
                  {status === "success" && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      Answer submitted successfully!
                    </div>
                  )}
                  {status === "error" && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      Error submitting answer. Please try again.
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <MessageSquareText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                    Select a question to start answering
                  </h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
