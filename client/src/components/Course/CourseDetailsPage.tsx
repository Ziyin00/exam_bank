// FILE: app/ClientCourse/[id]/page.tsx

"use client";

import React, { useEffect, useState, useCallback, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation"; // useRouter can be helpful for navigation
import Link from "next/link"; // For "Go to Courses" button
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import Ratings from "@/utils/Ratings"; // Ensure this path is correct
import { FiDownloadCloud, FiAlertCircle, FiCheckCircle, FiShare2 } from "react-icons/fi";
import { BsBookmark, BsBookmarkFill, BsChatDots } from "react-icons/bs";
import { VscCommentDiscussion, VscBook } from "react-icons/vsc";
import { AiOutlineQuestionCircle, AiOutlineStar } from "react-icons/ai";
import { slideInFromBottom, fadeIn, staggerContainer } from "@/utils/motion"; // Ensure this path is correct

// --- Interface Definitions ---
interface CourseDetail {
  id: string;
  title: string;
  description: string;
  department: string;
  year: number;
  worksheets: WorksheetData[];
  benefits: string[];
  prerequisites: string[];
  courseContent: CourseContentItem[];
  reviews: ReviewData[];
  questions: QuestionData[];
  averageRating: number;
  totalStudents: number;
  image?: string | null;
  instructor?: { name: string; id?: string | number };
}

interface WorksheetData {
  id: string;
  title: string;
  pages: number;
  fileUrl: string;
  section: string;
  description?: string;
}

interface ReviewData {
  id: string;
  comment: string;
  rating: number;
  createdAt: string; // Expect ISO string or valid date string
  student: { name: string; id?: string | number };
}

interface QuestionData {
  id: string;
  text: string;
  answer?: string;
  createdAt: string; // Expect ISO string or valid date string
  student: { name: string; id?: string | number };
}

interface CourseContentItem {
  id: string | number;
  title: string;
  description: string;
}

// --- API & Asset Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3032";
const DEFAULT_COURSE_IMAGE = "/assets/image_1746528349753.jpg"; // Ensure 'public/assets/image_1746528349753.jpg' exists

const CourseDetailsPage = () => {
  const params = useParams();
  // const router = useRouter(); // If needed for programmatic navigation
  console.log("CourseDetailsPage: PARAMS RECEIVED:", params);
  const courseId = params?.id as string | undefined;
  console.log("CourseDetailsPage: courseId VARIABLE:", courseId);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newQuestionText, setNewQuestionText] = useState("");
  const [reviewCommentText, setReviewCommentText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getAuthToken = useCallback((): string | null => {
    return typeof window !== "undefined" ? localStorage.getItem('token') : null;
  }, []);

  const getRole = useCallback((): string | null => {
    return typeof window !== "undefined" ? localStorage.getItem('role') : null;
  }, []);

  const fetchCourseData = useCallback(async (isRetry = false) => {
    if (!courseId) {
      console.error("CourseDetailsPage: fetchCourseData - courseId is missing. Aborting fetch.");
      setError("Course ID is missing from URL. Cannot fetch data.");
      setLoading(false);
      return;
    }
    console.log(`CourseDetailsPage: fetchCourseData - START - courseId: ${courseId}, isRetry: ${isRetry}`);

    if (!isRetry) setLoading(true);
    setError(null);
    
    const token = getAuthToken();
    const baseHeaders: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      baseHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const role = getRole() || 'student';
      const qaHeaders: HeadersInit = { ...baseHeaders };
      if (role && token) {
        qaHeaders['role'] = role;
        qaHeaders[`${role}-token`] = token;
      }

      const [courseRes, questionsRes, ratingRes, bookmarkStatusRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/student/get-cours/${courseId}`, { headers: baseHeaders }),
        fetch(`${API_BASE_URL}/student/get-quation-answer/${courseId}`, { headers: qaHeaders }),
        fetch(`${API_BASE_URL}/student/rating/${courseId}`, { headers: baseHeaders }),
        token ? fetch(`${API_BASE_URL}/student/bookmark-status/${courseId}`, { headers: baseHeaders }) : Promise.resolve(null)
      ]);

      console.log("CourseDetailsPage: fetchCourseData - API Responses Settled:", { courseRes, questionsRes, ratingRes, bookmarkStatusRes });

      // --- Process Main Course Data (includes worksheets and reviews by assumption) ---
      if (courseRes.status === 'rejected' || (courseRes.status === 'fulfilled' && !courseRes.value.ok)) {
        const errorDetail = courseRes.status === 'fulfilled' 
          ? `(Status: ${courseRes.value.status}) ${await courseRes.value.json().then(j => j.message).catch(() => courseRes.value.statusText)}` 
          : courseRes.reason?.message;
        throw new Error(`Failed to fetch main course data. ${errorDetail || 'Unknown error from course endpoint'}`);
      }
      const courseApiResponse = courseRes.status === 'fulfilled' ? await courseRes.value.json() : null;
      if (!courseApiResponse || !courseApiResponse.data) {
        throw new Error("Core course data (mainCourseDataFromApi) is missing or invalid in API response from /get-cours.");
      }
      const mainCourseDataFromApi = courseApiResponse.data;
      console.log("CourseDetailsPage: fetchCourseData - Raw mainCourseDataFromApi:", mainCourseDataFromApi);

      // Check for worksheets and reviews within mainCourseDataFromApi
      const apiWorksheets = mainCourseDataFromApi.worksheets;
      const apiReviews = mainCourseDataFromApi.reviews;

      if (!apiWorksheets || !Array.isArray(apiWorksheets)) {
        console.warn("CourseDetailsPage: fetchCourseData - `worksheets` array not found or not an array in mainCourseDataFromApi. Assuming empty.");
      }
      if (!apiReviews || !Array.isArray(apiReviews)) {
        console.warn("CourseDetailsPage: fetchCourseData - `reviews` array not found or not an array in mainCourseDataFromApi. Assuming empty.");
      }
      
      // --- Process Questions ---
      let mappedQuestions: QuestionData[] = [];
      if (questionsRes.status === 'fulfilled' && questionsRes.value.ok) {
        const questionsApiResponse = await questionsRes.value.json();
        if (questionsApiResponse.data && Array.isArray(questionsApiResponse.data)) {
          mappedQuestions = questionsApiResponse.data.map((item: any): QuestionData => ({
            id: item.question_id?.toString() || `q-${Math.random()}`, // Fallback ID
            text: item.question || "No question text",
            answer: item.answer,
            createdAt: item.question_time,
            student: { name: item.student_name || "Anonymous" },
          }));
        }
        console.log("CourseDetailsPage: fetchCourseData - Mapped Q&A data (mappedQuestions):", mappedQuestions);
      } else if (questionsRes.status === 'rejected' || (questionsRes.status === 'fulfilled' && !questionsRes.value.ok)) {
        const qError = questionsRes.status === 'rejected' ? questionsRes.reason : await (questionsRes.status === 'fulfilled' && questionsRes.value.json())?.message;
        console.warn("CourseDetailsPage: Failed to fetch Q&A data:", qError || "Unknown Q&A fetch error. Questions will be empty.");
      }

      // --- Process Ratings ---
      let avgRating = 0;
      let totalRatingsVal = 0;
      if (ratingRes.status === 'fulfilled' && ratingRes.value.ok) {
        const ratingApiResponse = await ratingRes.value.json();
        avgRating = parseFloat(ratingApiResponse.average_rating) || 0;
        totalRatingsVal = parseInt(ratingApiResponse.total_ratings, 10) || 0;
      } else if (ratingRes.status === 'rejected' || (ratingRes.status === 'fulfilled' && !ratingRes.value.ok)) {
        const rError = ratingRes.status === 'rejected' ? ratingRes.reason : await (ratingRes.status === 'fulfilled' && ratingRes.value.json())?.message;
        console.warn("CourseDetailsPage: Failed to fetch rating data:", rError || "Unknown rating fetch error.");
      }
      
      // --- Process Bookmark Status ---
      if (bookmarkStatusRes && bookmarkStatusRes.status === 'fulfilled' && bookmarkStatusRes.value?.ok) {
        const bookmarkData = await bookmarkStatusRes.value.json();
        setIsBookmarked(bookmarkData.isBookmarked === true);
      } else if (bookmarkStatusRes && (bookmarkStatusRes.status === 'rejected' || (bookmarkStatusRes.status === 'fulfilled' && !bookmarkStatusRes.value?.ok))) {
          const bError = bookmarkStatusRes.status === 'rejected' ? bookmarkStatusRes.reason : await (bookmarkStatusRes.status === 'fulfilled' && bookmarkStatusRes.value?.json())?.message;
          console.warn("CourseDetailsPage: Failed to fetch bookmark status:", bError || "Unknown bookmark status error.");
      }

      // Map data with robust defaults
      const finalCourseData: CourseDetail = {
        id: mainCourseDataFromApi.id?.toString() || courseId || `temp-${Date.now()}`,
        title: mainCourseDataFromApi.title || "Untitled Course",
        description: mainCourseDataFromApi.description || "No description provided.",
        department: mainCourseDataFromApi.department_name || mainCourseDataFromApi.department || "N/A",
        year: mainCourseDataFromApi.year || new Date().getFullYear(),
        image: mainCourseDataFromApi.image || null,
        worksheets: (apiWorksheets || []).map((ws: any) => ({ 
            id: ws.id?.toString() || `ws-${Math.random()}`,
            title: ws.title || "Untitled Worksheet",
            pages: ws.pages || 0,
            fileUrl: ws.fileUrl || "", // Essential for download link
            section: ws.section || "General",
            description: ws.description || ""
        })),
        benefits: mainCourseDataFromApi.benefits || [],
        prerequisites: mainCourseDataFromApi.prerequisites || [],
        courseContent: (mainCourseDataFromApi.courseContent || []).map((cc: any) => ({ 
            id: cc.id?.toString() || `cc-${Math.random()}`,
            title: cc.title || "Untitled Content Item",
            description: cc.description || ""
        })),
        reviews: (apiReviews || []).map((r: any) => ({
            id: r.id?.toString() || r.review_id?.toString() || `rev-${Math.random()}`,
            comment: r.comment || "No comment",
            rating: Number(r.rating) || 0, // Ensure rating is a number
            createdAt: r.createdAt || r.review_date, // Expecting valid date string
            student: r.student || { name: r.student_name || "Anonymous" }
        })),
        questions: mappedQuestions,
        averageRating: avgRating,
        totalStudents: Number(mainCourseDataFromApi.total_students || mainCourseDataFromApi.totalStudents || totalRatingsVal) || 0,
        instructor: mainCourseDataFromApi.instructor ? { 
            name: mainCourseDataFromApi.instructor.name || "Instructor N/A", 
            id: mainCourseDataFromApi.instructor.id 
        } : undefined,
      };
      
      setCourse(finalCourseData);
      console.log("CourseDetailsPage: fetchCourseData - Successfully processed and set `course` state:", finalCourseData);

    } catch (err: any) {
      console.error(`CourseDetailsPage: CRITICAL ERROR in fetchCourseData for courseId ${courseId}:`, err);
      toast.error(err.message || "Failed to load course data. Check console for details.");
      setError(err.message || "Could not load course information.");
      if (!isRetry) setCourse(null);
    } finally {
      if (!isRetry) setLoading(false);
      console.log("CourseDetailsPage: fetchCourseData - END");
    }
  }, [courseId, getAuthToken, getRole]);

  useEffect(() => {
    console.log("CourseDetailsPage: useEffect[courseId, params] triggered. Current courseId:", courseId);
    if (courseId) {
      fetchCourseData();
    } else if (params && Object.keys(params).length > 0 && !courseId) {
      console.error("CourseDetailsPage: useEffect - Course ID is invalid in params (e.g., /ClientCourse/undefined).");
      setError("Course ID is invalid or missing from the URL.");
      setLoading(false);
    } else if (!params || Object.keys(params).length === 0) {
        console.log("CourseDetailsPage: useEffect - Params not yet available from router. Waiting for Next.js to provide params...");
    }
  }, [courseId, params, fetchCourseData]);


  const handleQuestionSubmit = async () => { /* ... (Keep implementation from previous full code) ... */ 
    if (!newQuestionText.trim()) { toast.error("Question cannot be empty."); return; }
    const token = getAuthToken();
    if (!token) { toast.error("Please log in to ask a question."); return; }
    
    const toastId = toast.loading("Submitting question...");
    try {
      const response = await fetch(`${API_BASE_URL}/student/ask-quation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ question: newQuestionText, courseId: courseId })
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.status) {
        throw new Error(responseData.message || 'Question submission failed');
      }
      toast.success("Question submitted successfully!", { id: toastId });
      setNewQuestionText("");
      fetchCourseData(true);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleReviewSubmit = async () => { /* ... (Keep implementation from previous full code) ... */ 
    if (reviewRating === 0) { toast.error("Please select a rating."); return; }
    if (!reviewCommentText.trim()) { toast.error("Review comment cannot be empty."); return; }
    const token = getAuthToken();
    if (!token) { toast.error("Please log in to submit a review."); return; }

    const toastId = toast.loading("Submitting review...");
    try {
      const [commentRes, ratingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/student/give-comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ comment: reviewCommentText, courseId: courseId })
        }),
        fetch(`${API_BASE_URL}/student/rateing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ rating: reviewRating, course_id: courseId })
        })
      ]);

      const commentData = await commentRes.json();
      const ratingData = await ratingRes.json();

      if (!commentRes.ok || !commentData.status) {
        throw new Error(commentData.message || 'Failed to submit comment.');
      }
      if (!ratingRes.ok || !ratingData.status) {
        throw new Error(ratingData.message || 'Failed to submit rating.');
      }

      toast.success("Review submitted successfully!", { id: toastId });
      setReviewCommentText("");
      setReviewRating(0);
      fetchCourseData(true);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const toggleBookmark = async () => { /* ... (Keep implementation from previous full code) ... */ 
    const token = getAuthToken();
    if (!token) { toast.error("Please log in to manage bookmarks."); return; }

    const toastId = toast.loading(isBookmarked ? "Removing bookmark..." : "Adding bookmark...");
    try {
      const response = await fetch(`${API_BASE_URL}/student/count-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ course_id: courseId })
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.status) {
        throw new Error(responseData.message || 'Bookmark update failed');
      }
      setIsBookmarked(!isBookmarked);
      toast.success(responseData.message || (isBookmarked ? "Course bookmarked!" : "Removed from bookmarks"), { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // --- Render Logic ---
  if (loading && !course) {
    console.log("CourseDetailsPage: Rendering - Full page loading state (loading && !course).");
    return ( /* ... Loading spinner ... */ 
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Course Details...</p>
      </div>
    );
  }

  if (error) {
    console.log("CourseDetailsPage: Rendering - Error state:", error);
    return ( /* ... Error display ... */ 
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 bg-gray-100 dark:bg-gray-900"
      >
        <FiAlertCircle className="w-16 h-16 text-red-500 mb-5" />
        <h2 className="text-2xl sm:text-3xl font-semibold text-red-600 dark:text-red-400 mb-3">Error Loading Course</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-md leading-relaxed">{error}</p>
        {courseId && (
            <button onClick={() => fetchCourseData()}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg">
            <FiCheckCircle /> Try Again
            </button>
        )}
      </motion.div>
    );
  }
  
  if (!course) {
    console.log("CourseDetailsPage: Rendering - Course is null (and not loading/error). CourseId:", courseId);
    return ( /* ... Course Not Found display ... */ 
         <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 bg-gray-100 dark:bg-gray-900"
        >
            <FiAlertCircle className="w-16 h-16 text-gray-400 mb-5" />
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-600 dark:text-gray-400 mb-3">Course Not Found</h2>
            <p className="text-gray-500 dark:text-gray-300 mb-8 max-w-md leading-relaxed">
             The course you are looking for could not be found. Please check the URL or try navigating from the main courses page.
            </p>
             <Link href="/courses" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg">
                Go to Courses
            </Link>
        </motion.div>
    );
  }

  console.log("CourseDetailsPage: Rendering - Course data IS available. Course title:", course.title);
  console.log("CourseDetailsPage: Rendering - Worksheets to render:", course.worksheets);
  console.log("CourseDetailsPage: Rendering - Questions to render:", course.questions);
  console.log("CourseDetailsPage: Rendering - Reviews to render:", course.reviews);


  const TABS = [ /* ... (Keep TABS definition) ... */ 
    { id: 'overview', label: 'Overview', icon: <VscBook className="mr-1.5 sm:mr-2" /> },
    { id: 'worksheets', label: 'Worksheets', icon: <FiDownloadCloud className="mr-1.5 sm:mr-2" /> },
    { id: 'qna', label: 'Q&A', icon: <VscCommentDiscussion className="mr-1.5 sm:mr-2" /> },
    { id: 'reviews', label: 'Reviews', icon: <AiOutlineStar className="mr-1.5 sm:mr-2" /> },
  ];

  const formatDate = (dateString: string | undefined): string => { /* ... (Keep formatDate definition) ... */ 
    if (!dateString) return "Date not available";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', hour12: true 
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid Date Format";
    }
  };


  return (
    <div className="w-[90%] 800px:w-[95%] max-w-7xl m-auto py-8 px-2 sm:px-4 dark:bg-gray-900 bg-gray-50">
      <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="visible">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* Left Column */}
          <div className="lg:w-[65%] xl:w-[70%] space-y-6 sm:space-y-8">
            <motion.header variants={slideInFromBottom} className="space-y-3 p-4 sm:p-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                <Ratings rating={course.averageRating} size={20}/>
                <span>({(course.reviews || []).length} Reviews)</span>
                <span>•</span>
                <span className="capitalize">{course.department}</span>
                <span>• Year {course.year}</span>
                {course.totalStudents > 0 && ( <><span>•</span><span>{course.totalStudents.toLocaleString()} Students</span></> )}
              </div>
              {course.instructor && course.instructor.name && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Instructor: <span className="font-medium text-gray-700 dark:text-gray-200">{course.instructor.name}</span>
                </p>
              )}
            </motion.header>

            <motion.nav variants={slideInFromBottom} className="sticky top-[60px] 800px:top-[80px] z-30 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm rounded-lg">
                 <div className="flex flex-wrap justify-start gap-1 sm:gap-2 p-1.5 sm:p-2">
                    {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-center text-xs sm:text-sm px-3 py-2 sm:px-5 sm:py-2.5 rounded-md font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 dark:focus:ring-offset-gray-900
                        ${activeTab === tab.id
                            ? "bg-indigo-600 text-white shadow-md"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60 hover:text-indigo-600 dark:hover:text-indigo-300"
                        }`}
                        aria-current={activeTab === tab.id ? "page" : undefined}
                    >
                        {tab.icon} {tab.label}
                    </button>
                    ))}
                </div>
            </motion.nav>

            {/* Tab Content Area */}
            <motion.div 
                key={activeTab} // Important for re-triggering animation on tab change
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6 sm:space-y-8">
                  <ContentSection title="Course Description" icon={<VscBook className="text-indigo-500 dark:text-indigo-400"/>}>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {course.description || "No description available."}
                    </p>
                  </ContentSection>
                  <ContentSection title="What You'll Learn" icon={<FiCheckCircle className="text-green-500 dark:text-green-400"/>}>
                    {(course.benefits && course.benefits.length > 0) ? (
                        <ul className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            {course.benefits.map((benefit, index) => (
                            <li key={`benefit-${index}`} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <span className="text-indigo-500 dark:text-indigo-400 mt-1 text-xl font-bold">✓</span>
                                <p className="pt-0.5">{benefit}</p>
                            </li>
                            ))}
                        </ul>
                    ) : <EmptyState Icon={FiCheckCircle} message="Learning outcomes will be listed here."/> }
                  </ContentSection>
                  {(course.courseContent && course.courseContent.length > 0) && (
                    <ContentSection title="Course Curriculum" icon={<VscBook className="text-purple-500 dark:text-purple-400"/>}>
                      <div className="space-y-4">
                        {course.courseContent.map(item => (
                          <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg shadow-sm">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">{item.title}</h4>
                            {item.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    </ContentSection>
                  )}
                   {(course.prerequisites && course.prerequisites.length > 0) && (
                    <ContentSection title="Prerequisites" icon={<FiAlertCircle className="text-yellow-500 dark:text-yellow-400"/>}>
                        <ul className="space-y-2">
                            {course.prerequisites.map((prerequisite, index) => (
                            <li key={`prereq-${index}`} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <span className="text-sm">•</span> {prerequisite}
                            </li>
                            ))}
                        </ul>
                    </ContentSection>
                  )}
                </div>
              )}

              {activeTab === 'worksheets' && (
                <ContentSection title="Worksheets" icon={<FiDownloadCloud className="text-teal-500 dark:text-teal-400"/>}>
                  {(course.worksheets && course.worksheets.length > 0) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                      {course.worksheets.map((worksheet) => (
                        <motion.div 
                            key={worksheet.id}
                            variants={fadeIn("up", "tween", 0, 0.3)}
                            className="p-5 bg-white dark:bg-gray-800/70 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col"
                        >
                          <div className="flex items-start gap-4 mb-3">
                            <div className="p-2.5 sm:p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-md flex-shrink-0">
                                <FiDownloadCloud className="text-xl sm:text-2xl text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-md sm:text-lg font-semibold text-gray-800 dark:text-white mt-1">{worksheet.title}</h3>
                          </div>
                          {worksheet.description && <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{worksheet.description}</p>}
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <p>Section: <span className="font-medium text-gray-700 dark:text-gray-300">{worksheet.section || 'General'}</span></p>
                            <p>Pages: <span className="font-medium text-gray-700 dark:text-gray-300">{worksheet.pages || 'N/A'}</span></p>
                          </div>
                          {worksheet.fileUrl ? ( // Only show download if fileUrl exists
                            <a
                                href={`${API_BASE_URL}/uploads/${worksheet.fileUrl}`}
                                download
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold mt-auto pt-4 text-sm"
                            >
                                <FiDownloadCloud size={16}/> Download Worksheet
                            </a>
                          ) : <p className="text-xs text-gray-400 dark:text-gray-500 mt-auto pt-4">Download not available</p>}
                        </motion.div>
                      ))}
                    </div>
                  ) : <EmptyState Icon={FiDownloadCloud} message="No worksheets available for this course yet."/>}
                </ContentSection>
              )}

              {activeTab === 'qna' && (
                <div className="space-y-6 sm:space-y-8">
                  <ContentSection title="Ask a Question" icon={<AiOutlineQuestionCircle className="text-orange-500 dark:text-orange-400"/>}>
                    {/* ... Q&A form ... */}
                     <div className="flex flex-col sm:flex-row gap-3">
                      <input type="text" value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} placeholder="Type your question here..." aria-label="Your question"
                        className="flex-1 p-3 sm:p-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
                      <button onClick={handleQuestionSubmit} disabled={!newQuestionText.trim()}
                        className="px-6 sm:px-7 py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-60">
                        Ask
                      </button>
                    </div>
                  </ContentSection>
                  <ContentSection title={`Questions & Answers (${(course.questions || []).length})`} icon={<VscCommentDiscussion className="text-cyan-500 dark:text-cyan-400"/>}>
                    {(course.questions && course.questions.length > 0) ? (
                      <div className="space-y-5 sm:space-y-6">
                        {course.questions.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((question) => (
                          <motion.div 
                            key={question.id} 
                            variants={fadeIn("up", "tween", 0, 0.3)}
                            className="p-4 sm:p-5 bg-white dark:bg-gray-800/70 rounded-xl shadow-sm"
                          >
                            <div className="flex items-start gap-3 sm:gap-4">
                              <VscCommentDiscussion className="text-xl sm:text-2xl text-indigo-500 dark:text-indigo-400 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-gray-800 dark:text-white font-medium text-sm sm:text-base">{question.text}</p>
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  Asked by <span className="font-semibold">{question.student.name}</span> • {formatDate(question.createdAt)}
                                </div>
                                {question.answer && (
                                  <div className="mt-2.5 sm:mt-3 pl-3 sm:pl-4 border-l-4 border-indigo-400 dark:border-indigo-500 py-1.5 sm:py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-r-md">
                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{question.answer}</p>
                                    <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Official Answer</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : <EmptyState Icon={VscCommentDiscussion} message="No questions have been asked yet. Be the first!"/>}
                  </ContentSection>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6 sm:space-y-8">
                  <ContentSection title="Share Your Experience" icon={<AiOutlineStar className="text-yellow-400"/>}>
                    {/* ... Review form ... */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Your Rating:</span>
                            <Ratings rating={reviewRating} setRating={setReviewRating} interactive size={28} />
                        </div>
                        <textarea value={reviewCommentText} onChange={(e) => setReviewCommentText(e.target.value)} placeholder="Write your review..." aria-label="Your review comment" rows={4}
                            className="w-full p-3 sm:p-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow min-h-[100px] sm:min-h-[120px]" />
                        <button onClick={handleReviewSubmit} disabled={!reviewCommentText.trim() || reviewRating === 0}
                            className="px-6 sm:px-7 py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-60">
                            Submit Review
                        </button>
                    </div>
                  </ContentSection>
                  <ContentSection title={`Student Reviews (${(course.reviews || []).length})`} icon={<AiOutlineStar className="text-yellow-500 dark:text-yellow-400"/>}>
                     {(course.reviews && course.reviews.length > 0) ? (
                        <div className="space-y-5 sm:space-y-6">
                            {course.reviews.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((review) => (
                            <motion.div 
                                key={review.id} 
                                variants={fadeIn("up", "tween", 0, 0.3)}
                                className="p-4 sm:p-5 bg-white dark:bg-gray-800/70 rounded-xl shadow-sm"
                            >
                                <div className="flex items-start gap-3 mb-2">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-base sm:text-lg flex-shrink-0">
                                        {(review.student.name || "A").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{review.student.name || "Anonymous"}</p>
                                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Ratings rating={review.rating} size={14} />
                                            <span>•</span>
                                            <span>{formatDate(review.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm pl-0 md:pl-[calc(2.5rem+0.75rem)] whitespace-pre-line">
                                    {review.comment}
                                </p>
                            </motion.div>
                            ))}
                        </div>
                     ) : <EmptyState Icon={AiOutlineStar} message="No reviews yet for this course."/>}
                  </ContentSection>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:w-[35%] xl:w-[30%]">
            {/* ... (Keep implementation from previous full code) ... */}
            <div className="sticky top-[80px] 800px:top-[100px] space-y-6 sm:space-y-8">
                <motion.div variants={slideInFromBottom} className="rounded-xl shadow-lg overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-gray-200 dark:bg-gray-700">
                    {course.image ? (
                        <Image src={`${API_BASE_URL}/uploads/${course.image}`} alt={`Promotional image for ${course.title}`} width={700} height={438}
                            className="w-full h-full object-cover" priority={false} onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COURSE_IMAGE; }} />
                    ) : (
                        <Image src={DEFAULT_COURSE_IMAGE} alt="Default course image" width={700} height={438} className="w-full h-full object-cover" />
                    )}
                </motion.div>
              
              <motion.div variants={slideInFromBottom} className="p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Course At a Glance</h3>
                <dl className="space-y-2.5 sm:space-y-3 text-sm">
                  <div className="flex justify-between items-center"> <dt className="text-gray-600 dark:text-gray-400">Department:</dt> <dd className="font-medium text-gray-800 dark:text-gray-200 text-right capitalize">{course.department}</dd> </div>
                  <div className="flex justify-between items-center"> <dt className="text-gray-600 dark:text-gray-400">Academic Year:</dt> <dd className="font-medium text-gray-800 dark:text-gray-200">Year {course.year}</dd> </div>
                  <div className="flex justify-between items-center"> <dt className="text-gray-600 dark:text-gray-400">Students Enrolled:</dt> <dd className="font-medium text-gray-800 dark:text-gray-200">{course.totalStudents > 0 ? course.totalStudents.toLocaleString() : "N/A"}</dd> </div>
                  <div className="flex justify-between items-center"> <dt className="text-gray-600 dark:text-gray-400">Average Rating:</dt> <dd className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1"> <AiOutlineStar className="text-yellow-400 text-base"/> {course.averageRating > 0 ? course.averageRating.toFixed(1) : "N/A"} </dd> </div>
                </dl>
              </motion.div>

              <motion.div variants={slideInFromBottom} className="p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-3 sm:space-y-4">
                <ActionButton icon={isBookmarked ? <BsBookmarkFill className="text-indigo-500" /> : <BsBookmark />} onClick={toggleBookmark} ariaLabel={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}>
                  {isBookmarked ? "Bookmarked" : "Bookmark Course"}
                </ActionButton>
                <ActionButton icon={<BsChatDots />} onClick={() => toast.info("Contact instructor feature coming soon!")}>
                  Contact Instructor
                </ActionButton>
                <ActionButton icon={<FiShare2 />} onClick={() => {
                        if (navigator.share) { navigator.share({ title: course.title, text: `Check out this course: ${course.title}`, url: window.location.href }).catch(console.error); } 
                        else { toast.info('Share not supported on this browser.'); }
                    }}>
                  Share Course
                </ActionButton>
              </motion.div>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
};

// Helper Components
const ContentSection: React.FC<{ title: string; icon?: ReactNode; children: ReactNode; className?: string }> = ({ title, icon, children, className = "" }) => (
    <motion.section 
        variants={fadeIn("up", "tween", 0.1, 0.4)}
        className={`p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}
    >
       <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 border-b dark:border-gray-700 pb-3">
        {icon && <span className="text-xl sm:text-2xl flex-shrink-0">{icon}</span>}
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
  
const EmptyState: React.FC<{ Icon: React.ElementType; message: string }> = ({ Icon, message }) => (
   <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
    className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400"
   >
    <Icon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-70" />
    <p className="text-sm sm:text-base">{message}</p>
    </motion.div>
);

const ActionButton: React.FC<{icon: ReactNode; onClick: () => void; children: ReactNode; ariaLabel?: string}> = ({icon, onClick, children, ariaLabel}) => (
  <button onClick={onClick} aria-label={ariaLabel}
    className="w-full flex items-center justify-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 bg-gray-100 dark:bg-gray-700/60 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800">
    {icon} {children}
  </button>
);

export default CourseDetailsPage;