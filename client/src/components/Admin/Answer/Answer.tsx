"use client";

import * as React from 'react';
import {
  useCallback,
  useEffect,
} from 'react';

import {
  AlertCircle,
  CheckCircle2,
  ListChecks,
  Loader2,
  MessageSquareText,
  Send,
  User2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { cn } from '@/src/lib/utils'; // Assuming this path is correct
import {
  TextareaAutosize,
  Tooltip,
} from '@mui/material'; // Assuming @mui/material is installed

import { Button } from '../../ui/button'; // Assuming this path is correct

// Interface for what /teacher/get-all-course returns for each course
interface CourseFromApi {
  id: string | number;
  title: string;
  description?: string;
  image?: string;
  category_id?: string | number;
  department_id?: string | number;
}

// Interface for what /teacher/get-QA/:course_id returns for each Q&A item
interface QAItemFromApi {
  question_id: string | number;
  question: string;
  student_name?: string;
  question_time: string;
  answer?: string | null;
  answer_time?: string | null;
  teacher_name?: string | null;
}

// Frontend's internal Question structure
interface Question {
  id: string | number;
  title: string;
  content: string;
  author: string;
  date: string;
  status: "answered" | "pending";
  courseId: string | number;
  courseName?: string;
  backendAnswer?: string | null;
  answerTime?: string | null;
  teacherName?: string | null;
}

const createTitleFromContent = (content: string, maxLength = 40): string => {
  if (!content) return "Untitled Question";
  const firstLine = content.split('\n')[0];
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.substring(0, maxLength - 3) + "...";
};

const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return "Invalid Date";
  }
};


export default function Answer() {
  const [selectedQuestion, setSelectedQuestion] = React.useState<Question | null>(null);
  const [answer, setAnswer] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = React.useState(true);
  const [totalQuestionsCount, setTotalQuestionsCount] = React.useState<number | null>(null);

  const teacherApiBaseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3032'}/teacher`;

  const fetchData = useCallback(async () => {
    setIsLoadingQuestions(true);
    console.log("[DEBUG] AnswerPage - Starting fetchData...");
    let allFetchedQuestions: Question[] = [];

    // Retrieve role and token for fetchData if needed for these GET requests
    // Some APIs might require authentication even for GET
    const roleForFetch = localStorage.getItem("role"); // Using "role"
    const tokenKeyForFetch = roleForFetch ? `${roleForFetch}-token` : null;
    const tokenForFetch = tokenKeyForFetch ? localStorage.getItem(tokenKeyForFetch) : null;
    const authHeadersForFetch: Record<string,string> = {};
    if (roleForFetch && tokenForFetch) {
        authHeadersForFetch['role'] = roleForFetch;
        authHeadersForFetch[tokenKeyForFetch] = tokenForFetch;
    }

    try {
      const coursesApiEndpoint = `${teacherApiBaseUrl}/get-all-course`;
      console.log("[DEBUG] AnswerPage - Fetching courses from:", coursesApiEndpoint);
      const coursesResponse = await fetch(coursesApiEndpoint, { headers: authHeadersForFetch });


      if (!coursesResponse.ok) {
        let errorData = { message: `HTTP error ${coursesResponse.status}`};
        try {
          errorData = await coursesResponse.json();
        } catch (e) {
          const textError = await coursesResponse.text();
          console.error("[DEBUG] AnswerPage - Non-JSON error response from /get-all-course:", textError);
        }
        throw new Error(errorData.message || `Failed to fetch courses. Status: ${coursesResponse.status}`);
      }
      const coursesResult = await coursesResponse.json();
      console.log("[DEBUG] AnswerPage - Raw coursesResult:", coursesResult);


      let coursesData: CourseFromApi[] = [];
      if (coursesResult && coursesResult.status === true && Array.isArray(coursesResult.data)) {
          coursesData = coursesResult.data;
      } else if (Array.isArray(coursesResult)) {
          coursesData = coursesResult;
      } else {
          console.warn("[DEBUG] AnswerPage - Unexpected data structure for all courses:", coursesResult);
          toast.error(coursesResult?.message || "Could not process course data from API.");
      }
      console.log("[DEBUG] AnswerPage - Extracted coursesData:", coursesData);

      if (Array.isArray(coursesData) && coursesData.length > 0) {
        const questionPromises = coursesData.map(async (course: CourseFromApi) => {
          if (!course || typeof course.id === 'undefined') {
            console.warn("[DEBUG] AnswerPage - Skipping course with missing id:", course);
            return [];
          }
          const courseIdForQA = course.id;
          const courseTitleForQA = course.title;

          try {
            const qaApiEndpoint = `${teacherApiBaseUrl}/get-QA/${courseIdForQA}`;
            console.log(`[DEBUG] AnswerPage - Fetching Q&A for course ID: ${courseIdForQA} from ${qaApiEndpoint}`);
            const qaResponse = await fetch(qaApiEndpoint, { headers: authHeadersForFetch }); // Added auth headers
            if (!qaResponse.ok) {
              console.warn(`[DEBUG] AnswerPage - Failed to fetch Q&A for course ${courseTitleForQA} (ID: ${courseIdForQA}): Status ${qaResponse.status}`);
              return [];
            }
            const qaResult = await qaResponse.json();
            console.log(`[DEBUG] AnswerPage - Raw qaResult for course ID ${courseIdForQA}:`, qaResult);

            let qaItemsArray: QAItemFromApi[] = [];
            if (qaResult && qaResult.status === true && Array.isArray(qaResult.data)) {
                qaItemsArray = qaResult.data;
            } else if (Array.isArray(qaResult)) {
                qaItemsArray = qaResult;
            } else {
                console.warn(`[DEBUG] AnswerPage - Unexpected Q&A data structure for course ${courseTitleForQA} (ID: ${courseIdForQA}):`, qaResult);
            }

            if (Array.isArray(qaItemsArray)) {
              return qaItemsArray.map((item: QAItemFromApi) => ({
                id: item.question_id,
                title: createTitleFromContent(item.question),
                content: item.question,
                author: item.student_name || "Unknown Student",
                date: item.question_time,
                status: item.answer ? "answered" : "pending",
                courseId: courseIdForQA,
                courseName: courseTitleForQA,
                backendAnswer: item.answer,
                answerTime: item.answer_time,
                teacherName: item.teacher_name,
              }));
            }
            return [];
          } catch (error) {
            console.error(`[DEBUG] AnswerPage - Error fetching Q&A for course ${courseTitleForQA} (ID: ${courseIdForQA}):`, error);
            return [];
          }
        });

        const results = await Promise.all(questionPromises);
        results.forEach(courseQs => {
          allFetchedQuestions = allFetchedQuestions.concat(courseQs);
        });
      } else if (Array.isArray(coursesData) && coursesData.length === 0) {
        toast.info("No courses found for you. This may be due to no courses assigned or an error fetching them.");
      }
      setQuestions(allFetchedQuestions);
      console.log("[DEBUG] AnswerPage - Final combined questions:", allFetchedQuestions);

      try {
        const countApiEndpoint = `${teacherApiBaseUrl}/get-quations-count`; // Typo "quations"?
        console.log("[DEBUG] AnswerPage - Fetching question count from:", countApiEndpoint);
        const countResponse = await fetch(countApiEndpoint, { headers: authHeadersForFetch }); // Added auth headers
        if (countResponse.ok) {
          const countData = await countResponse.json();
          setTotalQuestionsCount(countData.total_questions ?? countData.total ?? (typeof countData === 'number' ? countData : null));
          console.log("[DEBUG] AnswerPage - Total questions count:", countData);
        } else {
          const errorData = await countResponse.json().catch(() => ({message: `HTTP error ${countResponse.status}`}));
          console.error("[DEBUG] AnswerPage - Failed to fetch question count:", errorData.message || countResponse.statusText);
          toast.error(`Error fetching question count: ${errorData.message || 'Unknown error'}`);
        }
      } catch (countError: any) {
        console.error("[DEBUG] AnswerPage - Error fetching question count (catch):", countError);
        toast.error("Could not retrieve total question count.");
      }

    } catch (error: any) {
      console.error("[DEBUG] AnswerPage - Error in outer fetchData try block:", error);
      toast.error(error.message || "Error fetching initial data for questions page.");
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
      console.log("[DEBUG] AnswerPage - fetchData finished.");
    }
  }, [teacherApiBaseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) {
      toast.error("No question selected to answer.");
      return;
    }
    if (!answer.trim()) {
      toast.error("Answer cannot be empty.");
      return;
    }
    setStatus("submitting");

    // ***** THE CRITICAL FIX IS HERE *****
    const role = localStorage.getItem("role"); // Changed "userRole" to "role"
    // ***** END OF CRITICAL FIX *****

    const tokenKey = role ? `${role}-token` : null;
    const token = tokenKey ? localStorage.getItem(tokenKey) : null;

    console.log("[DEBUG] handleSubmit - Role from localStorage (key 'role'):", role);
    console.log("[DEBUG] handleSubmit - Token Key derived:", tokenKey);
    console.log("[DEBUG] handleSubmit - Token from localStorage (key based on role):", token);

    if (!role || !token) {
      toast.error("Authentication details (role or token) are missing. Please log in again.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
      return;
    }

    const payload = {
      question_id: selectedQuestion.id,
      answer: answer,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "role": role,
    };
    if (tokenKey) {
      headers[tokenKey] = token;
    }

    const apiEndpoint = `${teacherApiBaseUrl}/answer-quation`; // Typo "quation"?
    console.log("[DEBUG] handleSubmit - API Endpoint for answering:", apiEndpoint);
    console.log("[DEBUG] handleSubmit - Request Headers:", JSON.stringify(headers));
    console.log("[DEBUG] handleSubmit - Request Payload:", JSON.stringify(payload));

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      // It's good practice to check if the response is actually JSON before parsing
      const contentType = response.headers.get("content-type");
      let responseData;
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const textResponse = await response.text();
        console.error("[DEBUG] handleSubmit - Non-JSON response from server:", textResponse);
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }
      
      console.log("[DEBUG] handleSubmit - API Response Status:", response.status);
      console.log("[DEBUG] handleSubmit - API Response Data:", responseData);

      if (response.ok && responseData.status === true) {
        setStatus("success");
        toast.success(responseData.message || "Answer submitted successfully!");
        const updatedQuestions = questions.map(q =>
          q.id === selectedQuestion.id && q.courseId === selectedQuestion.courseId
            ? { ...q, status: "answered" as const, backendAnswer: answer, answerTime: new Date().toISOString(), teacherName: responseData.teacherName || "You" }
            : q
        );
        setQuestions(updatedQuestions);
        setSelectedQuestion(prev =>
          prev && prev.id === selectedQuestion.id && prev.courseId === selectedQuestion.courseId
            ? { ...prev, status: "answered" as const, backendAnswer: answer, answerTime: new Date().toISOString(), teacherName: responseData.teacherName || "You" }
            : null
        );
        setAnswer("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        const errorMessage = responseData.message || `Error ${response.status}: ${response.statusText}. Please try again.`;
        toast.error(errorMessage);
        console.error("[DEBUG] handleSubmit - API Error Response:", responseData);
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (error: any) {
      setStatus("error");
      const catchMessage = error.message || "A network or unexpected error occurred. Please check your connection and try again.";
      toast.error(catchMessage);
      console.error("[DEBUG] handleSubmit - Catch Error:", error);
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  useEffect(() => {
    if (selectedQuestion) {
      if (selectedQuestion.status === 'answered' && selectedQuestion.backendAnswer) {
        setAnswer(selectedQuestion.backendAnswer);
      } else {
        setAnswer("");
      }
    } else {
      setAnswer("");
    }
  }, [selectedQuestion]);


  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/30 backdrop-blur-lg text-gray-900 dark:text-white mt-20">
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <MessageSquareText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl md:text-3xl font-bold">
              Student Questions
            </h1>
          </div>
          {totalQuestionsCount !== null && (
            <div className="flex items-center gap-2 p-2 px-3 bg-blue-50 dark:bg-gray-700/80 rounded-lg text-blue-700 dark:text-blue-300 w-full sm:w-auto justify-center">
              <ListChecks className="h-5 w-5" />
              <span className="text-sm font-medium">
                Total Questions: <span className="font-bold">{totalQuestionsCount}</span>
              </span>
            </div>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
          Review and respond to questions submitted by students from your courses. Prioritize pending questions.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions List Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                Questions Queue
              </h2>
              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                {isLoadingQuestions ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
                    <span className="mt-3">Loading questions...</span>
                  </div>
                ) : questions.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-10 px-3">
                    No questions found. This could be an issue fetching data or no questions are pending.
                  </p>
                ) : (
                  [...questions]
                    .sort((a, b) => {
                      if (a.status === 'pending' && b.status === 'answered') return -1;
                      if (a.status === 'answered' && b.status === 'pending') return 1;
                      return new Date(b.date).getTime() - new Date(a.date).getTime();
                    })
                    .map((question) => (
                    <div
                      key={`${question.courseId}-${question.id}`}
                      onClick={() => setSelectedQuestion(question)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedQuestion(question);}}}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedQuestion?.id === question.id && selectedQuestion?.courseId === question.courseId}
                      className={cn(
                        "p-3.5 rounded-lg cursor-pointer transition-all duration-150 ease-in-out",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-gray-800",
                        "hover:bg-blue-50 dark:hover:bg-gray-700/70",
                        selectedQuestion?.id === question.id && selectedQuestion?.courseId === question.courseId
                          ? "bg-blue-100 dark:bg-gray-700 border-l-4 border-blue-600 dark:border-blue-500 shadow-lg"
                          : "bg-gray-50 dark:bg-gray-800/60 border border-transparent dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600",
                        question.status === "answered" && "opacity-60 hover:opacity-80"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-medium text-gray-800 dark:text-white truncate max-w-[calc(100%-90px)]" title={question.content}>
                          {question.title}
                        </h3>
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm",
                            question.status === "answered"
                              ? "bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300 animate-pulse"
                          )}
                        >
                          {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                        </span>
                      </div>
                      {question.courseName && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1.5 font-medium">
                          {question.courseName}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 leading-snug">
                        {question.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <User2 className="h-3.5 w-3.5" />
                          <span>{question.author}</span>
                        </div>
                        <Tooltip title={formatDate(question.date)}>
                           <span>{formatDate(question.date)}</span>
                        </Tooltip>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Answer Area Column */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 min-h-[400px] border dark:border-gray-700">
              {selectedQuestion ? (
                <>
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b dark:border-gray-700">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <MessageSquareText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Respond to Question
                    </h2>
                  </div>
                   {selectedQuestion.courseName && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-4 font-semibold bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border dark:border-blue-300/30">
                          Regarding course: <span className="font-bold">{selectedQuestion.courseName}</span>
                        </p>
                      )}
                  <div className="mb-6 space-y-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50 shadow-inner">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100" title={selectedQuestion.content}>
                      Q: {selectedQuestion.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedQuestion.content}
                    </p>
                    {selectedQuestion.status === 'answered' && selectedQuestion.backendAnswer && (
                        <div className="mt-4 pt-3 border-t border-dashed dark:border-gray-600">
                            <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1.5">
                                Your Answer {selectedQuestion.teacherName ? `(by ${selectedQuestion.teacherName})` : ''} {selectedQuestion.answerTime ? `• ${formatDate(selectedQuestion.answerTime)}` : ''}:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-200 whitespace-pre-wrap bg-green-50/30 dark:bg-green-800/20 p-3 rounded">
                                {selectedQuestion.backendAnswer}
                            </p>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-dashed dark:border-gray-600 mt-3">
                        <div className="flex items-center gap-2"> <User2 className="h-4 w-4" /> <span>From: {selectedQuestion.author}</span> </div>
                        <Tooltip title={formatDate(selectedQuestion.date)}><span>{formatDate(selectedQuestion.date)}</span></Tooltip>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <label htmlFor="answerTextarea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {selectedQuestion.status === 'answered' ? "Update Your Answer:" : "Your Answer:"}
                    </label>
                    <TextareaAutosize
                      id="answerTextarea"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your detailed answer here..."
                      className={cn(
                        "w-full p-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                        "bg-white dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm",
                        "focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none resize-y",
                        "min-h-[20px] mb-4"
                      )}
                      minRows={5}
                    />
                    <div className="flex justify-end gap-3">
                      <Button
                        type="submit"
                        disabled={status === "submitting" || !answer.trim() || !selectedQuestion}
                        className="gap-2 min-w-[150px] justify-center"
                      >
                        {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {status === "submitting" ? "Submitting..." : (selectedQuestion.status === 'answered' ? "Update Answer" : "Submit Answer")}
                      </Button>
                    </div>
                  </form>

                  {status === "success" && (
                    <div className="mt-4 p-3 bg-green-100 dark:bg-green-700/30 rounded-lg flex items-center gap-2 text-sm text-green-800 dark:text-green-200 border border-green-200 dark:border-green-600">
                      <CheckCircle2 className="h-5 w-5" /> Answer submitted successfully!
                    </div>
                  )}
                  {status === "error" && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-700/30 rounded-lg flex items-center gap-2 text-sm text-red-800 dark:text-red-200 border border-red-200 dark:border-red-600">
                      <AlertCircle className="h-5 w-5" /> Error submitting answer. Please see console for details.
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500 dark:text-gray-400">
                  <MessageSquareText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium">
                    Select a question to start answering.
                  </h3>
                  <p className="text-sm mt-1">
                    If no questions are visible, there might have been an issue loading them.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}