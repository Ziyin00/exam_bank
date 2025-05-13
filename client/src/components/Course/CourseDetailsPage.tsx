"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { AiOutlineStar } from 'react-icons/ai';
import { BsChatDots } from 'react-icons/bs';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownloadCloud,
  FiShare2,
} from 'react-icons/fi';
import {
  VscBook,
  VscCommentDiscussion,
} from 'react-icons/vsc';
import { format } from 'timeago.js';

import Ratings from '@/utils/Ratings';
import {
  Avatar,
  CircularProgress,
} from '@mui/material';

interface CourseListItemFromApi {
  id: string | number;
  title: string;
  description?: string;
  image?: string | null;
  department_name?: string;
  year?: number | string;
  course_tag?: string;
  total_students?: number | string;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  department: string;
  year: number | string;
  worksheets: WorksheetData[];
  benefits: string[];
  prerequisites: string[];
  courseContent: CourseContentItem[];
  reviews: ReviewData[];
  questions: QuestionData[];
  averageRating: number;
  totalStudents: number;
  image?: string | null;
  instructor?: {
    name: string;
    id?: string | number;
    instructor_id?: string | number;
  };
  course_tag?: string;
}

interface WorksheetData {
  id: string;
  title: string;
  pages?: number;
  fileUrl: string;
  section?: string;
  description?: string;
}

interface ReviewData {
  id: string;
  comment: string;
  rating: number;
  createdAt: string;
  student: {
    name: string;
    id?: string | number;
    student_id?: string | number;
    avatar?: string;
  };
}

interface QuestionData {
  id: string;
  text: string;
  answer?: string;
  createdAt: string;
  student: { name: string; id?: string | number; student_id?: string | number };
}

interface CourseContentItem {
  id: string | number;
  title: string;
  description: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3032";
const DEFAULT_COURSE_IMAGE = "/assets/worksheet1.jpg";
const UPLOADS_BASE_PATH = "/image/";

const ImageViewerModal = ({ imageUrl, onClose, title }: { imageUrl: string; onClose: () => void; title: string }) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl relative max-w-5xl max-h-[90vh] w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold truncate pr-2" title={title}>{title}</h3>
          <div className="flex items-center gap-x-1 sm:gap-x-2 flex-shrink-0">
            <button onClick={handleZoomIn} className="px-2 py-1.5 hover:bg-gray-200 rounded text-sm" title="Zoom In">Zoom In</button>
            <button onClick={handleZoomOut} className="px-2 py-1.5 hover:bg-gray-200 rounded text-sm" title="Zoom Out">Zoom Out</button>
            <button onClick={handleResetZoom} className="px-2 py-1.5 hover:bg-gray-200 rounded text-sm" title="Reset Zoom">Reset</button>
            <button onClick={onClose} className="px-2 py-1.5 hover:bg-red-100 text-red-600 rounded text-sm" title="Close (Esc)">Close</button>
          </div>
        </div>
        <div
          className="flex-grow overflow-auto p-1 sm:p-2"
        >
          <div
            className="flex items-center justify-center min-h-full"
          >
            <img
              src={imageUrl}
              alt={title}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
                transition: 'transform 0.15s ease-out',
                maxWidth: '100%',
                maxHeight: 'calc(90vh - 70px)',
                display: 'block',
              }}
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
};


const CourseDetailsPage = () => {
  const params = useParams();
  const courseIdFromParams = params?.id as string | undefined;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [reviewCommentText, setReviewCommentText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const getAuthInfo = useCallback(() => {
    if (typeof window === "undefined")
      return { token: null, role: null, userId: null };
    // This logic assumes 'student-token' is a specific key, 
    // or 'token' is a generic one.
    // For the backend provided, it will use the `role` to form `${role}-token` header name.
    const token =
      localStorage.getItem("token") || localStorage.getItem("student-token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("user-id");
    return { token, role, userId };
  }, []);

  const fetchCourseData = useCallback(
    async (idToFetch: string, isRetry = false) => {
      if (!isRetry) {
        setLoading(true);
        setError(null);
        setCourse(null);
      }

      const { token, role: userRole } = getAuthInfo(); 
      const baseHeaders: HeadersInit = { "Content-Type": "application/json" };
      // For GET requests, if they also need this new auth scheme, they'd need similar header adjustments.
      // For now, assuming GET requests might use a different auth or are public.
      // The original code used 'Authorization: Bearer ${token}' for GETs.
      // If GETs ALSO need the new header format:
      if (token && userRole) {
        baseHeaders["role"] = userRole;
        baseHeaders[`${userRole}-token`] = token;
      } else if (token) { // Fallback to Bearer if role-specific is not fully set up but token exists
        baseHeaders["Authorization"] = `Bearer ${token}`;
      }


      try {
        const allCoursesUrl = `${API_BASE_URL}/student/get-all-course`;
        const [allCoursesRes, questionsRes, ratingRes] =
          await Promise.allSettled([
            fetch(allCoursesUrl, { headers: baseHeaders }),
            fetch(`${API_BASE_URL}/student/get-quation-answer/${idToFetch}`, {
              headers: baseHeaders, // Uses the same headers as above
            }),
            fetch(`${API_BASE_URL}/student/rating/${idToFetch}`, {
              headers: baseHeaders, // Uses the same headers as above
            }),
          ]);

        let targetCourseFromList: CourseListItemFromApi | undefined;
        if (allCoursesRes.status === "fulfilled" && allCoursesRes.value.ok) {
          const allCoursesApiResponse = await allCoursesRes.value.json();
          const coursesListFromApi: CourseListItemFromApi[] = Array.isArray(
            allCoursesApiResponse
          )
            ? allCoursesApiResponse
            : allCoursesApiResponse.data || [];

          targetCourseFromList = coursesListFromApi.find(
            (c) => c.id?.toString() === idToFetch.toString()
          );

          if (!targetCourseFromList) {
            throw new Error(`Course with ID "${idToFetch}" not found in the general list.`);
          }
        } else if (allCoursesRes.status === 'rejected' || (allCoursesRes.status === 'fulfilled' && !allCoursesRes.value.ok)) {
             throw new Error(`Failed to fetch course list: ${allCoursesRes.status === 'rejected' ? allCoursesRes.reason : (allCoursesRes.value ? await allCoursesRes.value.text() : 'Unknown error')}`);
        }


        let mappedQuestions: QuestionData[] = [];
        if (questionsRes.status === "fulfilled" && questionsRes.value.ok) {
          const qData = await questionsRes.value.json();
          const qArray = Array.isArray(qData.data) ? qData.data : (Array.isArray(qData) ? qData : []);
          mappedQuestions = qArray.map((item: any) => ({
            id: item.question_id?.toString() || item.id?.toString() || Math.random().toString(),
            text: item.question || "N/A",
            answer: item.answer,
            createdAt: item.question_time || new Date().toISOString(),
            student: { name: item.student_name || "Anonymous" },
          }));
        }

        let avgRating = 0;
        let fetchedReviews: ReviewData[] = [];
        if (ratingRes.status === "fulfilled" && ratingRes.value.ok) {
          const rData = await ratingRes.value.json();
          avgRating = parseFloat(rData.average_rating) || 0;
        }
        
        if (!targetCourseFromList) {
            throw new Error(`Course with ID "${idToFetch}" not found.`);
        }

        const finalCourseData: CourseDetail = {
          id: targetCourseFromList.id.toString(),
          title: targetCourseFromList.title || "Untitled Course",
          description:
            targetCourseFromList.description || "No description available.",
          department: targetCourseFromList.department_name || "N/A",
          year: targetCourseFromList.year || "N/A",
          image: targetCourseFromList.image || null,
          worksheets: (targetCourseFromList as any).worksheets || [],
          benefits: (targetCourseFromList as any).benefits || [],
          prerequisites: (targetCourseFromList as any).prerequisites || [],
          courseContent: (targetCourseFromList as any).courseContent || [],
          reviews: (targetCourseFromList as any).reviews || fetchedReviews,
          questions: mappedQuestions,
          averageRating: avgRating,
          totalStudents: Number(targetCourseFromList.total_students || 0),
          course_tag: targetCourseFromList.course_tag,
        };

        setCourse(finalCourseData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching course data:", err);
        toast.error(err.message || "Failed to load course details");
        setError(err.message || "Could not load course information");
      } finally {
        setLoading(false);
      }
    },
    [getAuthInfo]
  );

  useEffect(() => {
    if (courseIdFromParams) {
      fetchCourseData(courseIdFromParams);
    }
  }, [courseIdFromParams, fetchCourseData]);

  const handleQuestionSubmit = async () => {
    if (!courseIdFromParams || !newQuestionText.trim()) {
      toast.error("Question text cannot be empty.");
      return;
    }

    try {
      const { token, role: userRole } = getAuthInfo(); // Get token and role

      if (!token || !userRole) { // Check if both token and role exist
        toast.error("Authentication information is missing. Please log in again.");
        return;
      }

      // Construct headers according to the backend's expectation
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "role": userRole, // Send the role header
      };
      headers[`${userRole}-token`] = token; // Send the token under the dynamic header name (e.g., "student-token")


      const response = await fetch(`${API_BASE_URL}/student/ask-quation`, {
        method: "POST",
        headers: headers, // Use the constructed headers
        body: JSON.stringify({
          question: newQuestionText,
          course_id: courseIdFromParams,
        }),
      });

      if (!response.ok) {
        // Try to parse error message from backend, otherwise use a default
        const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
        throw new Error(errorData.message || "Server error during question submission.");
      }
      
      toast.success("Question submitted successfully!");
      setNewQuestionText("");
      fetchCourseData(courseIdFromParams, true); 
    } catch (error: any) {
      toast.error(error.message || "Failed to submit question");
      console.error("Question submission error:", error);
    }
  };

  const handleReviewSubmit = async () => {
    if (!courseIdFromParams || !reviewCommentText.trim() || reviewRating === 0) {
      toast.error("Please provide a rating and a comment for your review.");
      return;
    }
    
    try {
      const { token, role: userRole } = getAuthInfo(); // Get token and role
      if (!token || !userRole) {
        toast.error("You must be logged in to submit a review.");
        return;
      }

      // Construct headers for review and rating submissions
      // Assuming these endpoints also use the new authentication scheme
      const reviewHeaders: HeadersInit = {
        "Content-Type": "application/json",
        "role": userRole,
      };
      reviewHeaders[`${userRole}-token`] = token;

      await Promise.all([
        fetch(`${API_BASE_URL}/student/give-comment`, {
          method: "POST",
          headers: reviewHeaders,
          body: JSON.stringify({ comment: reviewCommentText, course_id: courseIdFromParams, rating: reviewRating }),
        }),
        fetch(`${API_BASE_URL}/student/rateing`, {
          method: "POST",
          headers: reviewHeaders, 
          body: JSON.stringify({ rating: reviewRating, course_id: courseIdFromParams }),
        }),
      ]);

      toast.success("Review submitted successfully!");
      setReviewCommentText("");
      setReviewRating(0);
      fetchCourseData(courseIdFromParams, true); 
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
      console.error("Review submission error:", error);
    }
  };

  // --- Rest of the component remains the same ---
  // (Loading states, error states, JSX structure, etc.)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <CircularProgress size={50} />
        <p className="mt-4 text-lg text-gray-700">Loading Course Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-100">
        <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-600 mb-3">
          Error Loading Course
        </h2>
        <p className="text-gray-700 mb-6 max-w-md">{error}</p>
        {courseIdFromParams && (
          <button
            onClick={() => fetchCourseData(courseIdFromParams, true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        )}
        <Link href="/courses" className="mt-4 text-indigo-600 hover:underline">
          View Other Courses
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-100">
        <VscBook className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-3">
          Course Not Found
        </h2>
        <Link
          href="/courses"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  const courseImageUrl = course.image
    ? course.image.startsWith("http")
      ? course.image
      : `${API_BASE_URL}${UPLOADS_BASE_PATH}${course.image}`
    : DEFAULT_COURSE_IMAGE;
  
  const hasSpecificCourseImage = !!course.image;


  const TABS = [
    { id: "overview", label: "Overview", icon: <VscBook className="mr-2" /> },
    {
      id: "worksheets",
      label: `Worksheets`,
      icon: <FiDownloadCloud className="mr-2" />,
    },
    {
      id: "qna",
      label: `Q&A (${course.questions.length})`,
      icon: <VscCommentDiscussion className="mr-2" />,
    },
    {
      id: "reviews",
      label: `Reviews (${course.reviews.length})`,
      icon: <AiOutlineStar className="mr-2" />,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/courses"
          className="text-indigo-600 hover:underline flex items-center mb-6 text-sm"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
          Back to Courses
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
                {course.averageRating > 0 && (
                  <div className="flex items-center">
                    <Ratings rating={course.averageRating} />
                    <span className="ml-1">({course.averageRating.toFixed(1)})</span>
                  </div>
                )}
                <span>{course.reviews.length} reviews</span>
                <span>•</span>
                <span>{course.department}</span>
                <span>•</span>
                <span>Year {course.year}</span>
              </div>

              <div className="sticky top-0 bg-white z-20 border-b mb-6 shadow-sm">
                <div className="flex gap-1 sm:gap-2 overflow-x-auto py-2 px-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 sm:px-4 rounded-md flex items-center text-sm font-medium whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                {activeTab === "overview" && (
                  <>
                    <section>
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Course Description
                      </h2>
                      <div className="prose max-w-none text-gray-700 leading-relaxed">
                        {course.description || "No description provided."}
                      </div>
                    </section>

                    {course.benefits && course.benefits.length > 0 && (
                      <section>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                          What You'll Learn
                        </h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                          {course.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <FiCheckCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                              <p className="text-gray-700">{benefit}</p>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </>
                )}

                {activeTab === "worksheets" && (
                  <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Worksheet</h2>
                    {hasSpecificCourseImage ? (
                      <div className="mb-6 p-4 border rounded-lg shadow-md bg-white">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">{course.title} - Main Worksheet</h3>
                        <div className="relative w-full h-64 md:h-96 bg-gray-100 rounded-md overflow-hidden mb-4 border">
                          <Image
                            src={courseImageUrl}
                            alt={`${course.title} worksheet preview`}
                            layout="fill"
                            objectFit="contain"
                            className="cursor-pointer transition-transform duration-300 hover:scale-105"
                            onClick={() => setIsImageViewerOpen(true)}
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COURSE_IMAGE; }}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => setIsImageViewerOpen(true)}
                            className="flex-1 sm:flex-none justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                          >
                            <FiDownloadCloud /> View & Zoom
                          </button>
                          <a
                            href={courseImageUrl}
                            download={`${course.title}_worksheet.${courseImageUrl.split('?')[0].split('.').pop() || 'jpg'}`}
                            className="flex-1 sm:flex-none justify-center text-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                          >
                            <FiDownloadCloud /> Download Worksheet
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg bg-gray-50 text-center text-gray-500">
                        <VscBook size={24} className="mx-auto mb-2" />
                        No main worksheet image available for this course.
                      </div>
                    )}
                    {course.worksheets && course.worksheets.length > 0 && (
                      <>
                        <h2 className="text-xl font-semibold my-6 text-gray-800">Additional Downloadable Files</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {course.worksheets.map((ws) => (
                            <div key={ws.id} className="bg-white p-4 rounded-lg shadow border">
                              <div className="flex items-start gap-3 mb-2">
                                <FiDownloadCloud className="text-indigo-600 text-xl mt-1 flex-shrink-0" />
                                <div>
                                  <h3 className="font-semibold text-gray-900">{ws.title}</h3>
                                  {ws.section && <p className="text-xs text-indigo-500">{ws.section}</p>}
                                  {ws.description && <p className="text-sm text-gray-600 mt-1">{ws.description}</p>}
                                </div>
                              </div>
                              <a
                                href={ws.fileUrl}
                                download
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                              >
                                <FiDownloadCloud size={16} /> Download File
                              </a>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </section>
                )}

                {activeTab === "qna" && (
                  <div className="space-y-8">
                    <section className="bg-white p-4 sm:p-6 rounded-lg shadow border">
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Ask a Question
                      </h2>
                      <div className="flex flex-col gap-3">
                        <textarea
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          placeholder="Type your question here..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows={4}
                        />
                        <button
                          onClick={handleQuestionSubmit} // This now uses the updated header format
                          disabled={!newQuestionText.trim()}
                          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          Submit Question
                        </button>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Questions & Answers ({course.questions.length})
                      </h2>
                      {course.questions.length > 0 ? (
                        <div className="space-y-4">
                          {course.questions.map((question) => (
                            <div
                              key={question.id}
                              className="bg-white p-4 rounded-lg shadow border"
                            >
                              <p className="font-medium text-gray-900">
                                {question.text}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Asked by {question.student.name} • {format(new Date(question.createdAt))}</p>
                              {question.answer && (
                                <div className="mt-3 pt-3 pl-3 border-l-4 border-indigo-400 bg-indigo-50/50">
                                  <p className="text-sm font-semibold text-indigo-700 mb-1">
                                    Instructor's Answer:
                                  </p>
                                  <p className="text-gray-700 text-sm">
                                    {question.answer}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                         <div className="p-4 border rounded-lg bg-gray-50 text-center text-gray-500">
                            No questions asked yet. Be the first!
                         </div>
                      )}
                    </section>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-8">
                    <section className="bg-white p-4 sm:p-6 rounded-lg shadow border">
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Write a Review
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <span className="font-medium text-gray-700">Your Rating:</span>
                          <Ratings
                            rating={reviewRating}
                            setRating={setReviewRating}
                            interactive
                            size={24}
                          />
                        </div>
                        <textarea
                          value={reviewCommentText}
                          onChange={(e) => setReviewCommentText(e.target.value)}
                          placeholder="Share your thoughts about this course..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows={4}
                        />
                        <button
                          onClick={handleReviewSubmit} // This also uses the updated header format
                          disabled={!reviewCommentText.trim() || reviewRating === 0}
                          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          Submit Review
                        </button>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Student Reviews ({course.reviews.length})
                      </h2>
                       {course.reviews.length > 0 ? (
                        <div className="space-y-4">
                          {course.reviews.map((review) => (
                            <div
                              key={review.id}
                              className="bg-white p-4 rounded-lg shadow border"
                            >
                              <div className="flex items-start gap-3 mb-2">
                                <Avatar className="bg-indigo-100 text-indigo-600 w-10 h-10">
                                  {review.student.name?.[0]?.toUpperCase() || 'S'}
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {review.student.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Ratings rating={review.rating} size={16} />
                                    <span>
                                      {format(new Date(review.createdAt))}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                       ) : (
                         <div className="p-4 border rounded-lg bg-gray-50 text-center text-gray-500">
                            No reviews yet for this course.
                         </div>
                       )}
                    </section>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <aside className="lg:w-1/3">
            <div className="sticky top-8 space-y-6">
              <div className="rounded-xl overflow-hidden aspect-video bg-gray-200 border shadow-lg">
                <Image
                  src={courseImageUrl}
                  alt={course.title}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_COURSE_IMAGE;
                  }}
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Course Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Department</dt>
                    <dd className="text-gray-900 font-medium">{course.department}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Year</dt>
                    <dd className="text-gray-900 font-medium">{course.year}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Enrolled Students</dt>
                    <dd className="text-gray-900 font-medium">{course.totalStudents}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Average Rating</dt>
                    <dd className="flex items-center gap-1 text-gray-900 font-medium">
                      <AiOutlineStar className="text-yellow-400" />
                      {course.averageRating > 0 ? course.averageRating.toFixed(1) : "N/A"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  <BsChatDots /> Contact Instructor
                </button>
                <button className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  <FiShare2 /> Share Course
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
      {isImageViewerOpen && hasSpecificCourseImage && (
        <ImageViewerModal
          imageUrl={courseImageUrl}
          onClose={() => setIsImageViewerOpen(false)}
          title={`${course.title} - Worksheet`}
        />
      )}
    </div>
  );
};

export default CourseDetailsPage;