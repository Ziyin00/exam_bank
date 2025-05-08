'use client'

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Ratings from "@/utils/Ratings";
import CourseContentList from "./CourseContentList";
import { FiDownloadCloud } from "react-icons/fi";
import { BsChevronDown, BsChevronUp, BsBookmark, BsBookmarkFill, BsChatDots } from "react-icons/bs";
import { VscCommentDiscussion } from "react-icons/vsc";
import { toast } from "react-hot-toast";

interface CourseData {
  id: string;
  title: string;
  description: string;
  department: string;
  year: number;
  worksheets: Worksheet[];
  benefits: string[];
  prerequisites: string[];
  courseContent: any[];
  reviews: Review[];
  questions: Question[];
  averageRating: number;
  totalStudents: number;
}

interface Worksheet {
  id: string;
  title: string;
  pages: number;
  fileUrl: string;
  section: string;
}

interface Review {
  id: string;
  comment: string;
  createdAt: string;
  student: { name: string };
}

interface Question {
  question_id: string;
  question: string;
  answer?: string;
  question_time: string;
  student_name: string;
  teacher_name?: string;
}

const CourseDetailsPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [newQuestion, setNewQuestion] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchCourseData = async () => {
    try {
      // Get the user role from localStorage for the QA API
      const role = localStorage.getItem('role') || 'student';

      const [courseRes, questionsRes, ratingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/get-cours/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/get-quation-answer/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'role': role,
            [`${role}-token`]: localStorage.getItem('token')
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/rating/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Handle HTTP errors
      if (!courseRes.ok) throw new Error('Failed to fetch course');
      if (!questionsRes.ok) throw new Error('Failed to fetch questions');
      if (!ratingRes.ok) throw new Error('Failed to fetch ratings');

      // Parse responses
      const courseData = await courseRes.json();
      const questionsData = await questionsRes.json();
      const ratingData = await ratingRes.json();

      // Map backend data to frontend format
      const questionsMapped = questionsData.data.map((item: any) => ({
        id: item.question_id,
        text: item.question,
        answer: item.answer,
        createdAt: item.question_time,
        student: { name: item.student_name }
      }));

      // Set course data with correctly mapped backend responses
      setCourse({
        ...courseData.data,
        questions: questionsMapped || [],
        averageRating: parseFloat(ratingData.average_rating) || 0,
        reviews: courseData.data.reviews || [],
        worksheets: courseData.data.worksheets || [],
        totalStudents: courseData.data.totalStudents || ratingData.total_ratings || 0
      });

    } catch (err: any) {
      toast.error(err.message || "Failed to load course data");
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleQuestionSubmit = async () => {
    if (!newQuestion.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/ask-quation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          question: newQuestion,  // Changed from 'text' to 'question' to match backend
          courseId: id
        })
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.status) {  // Changed from 'success' to 'status' to match backend
        throw new Error(responseData.message || 'Question submission failed');
      }

      toast.success("Question submitted!");
      setNewQuestion("");
      await fetchCourseData();

    } catch (err: any) {
      toast.error(err.message || "Failed to submit question");
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const [reviewResponse, ratingResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/give-comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            comment: reviewComment,
            courseId: id
          })
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/rateing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            rating: rating,
            course_id: id  // Changed to course_id to match the backend
          })
        })
      ]);

      const reviewData = await reviewResponse.json();
      const ratingData = await ratingResponse.json();

      if (!reviewResponse.ok || !ratingResponse.ok || !reviewData.status || !ratingData.status) {
        throw new Error('Review submission failed');
      }

      toast.success("Review submitted!");
      setReviewComment("");
      setRating(0);
      await fetchCourseData();

    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    }
  };

  const toggleBookmark = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/count-answer`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ course_id: id })  // Changed from courseId to course_id
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.status) {  // Changed from success to status
        throw new Error(responseData.message || 'Bookmark update failed');
      }

      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? "Removed from bookmarks" : "Bookmarked course");

    } catch (err: any) {
      toast.error(err.message || "Bookmark update failed");
    }
  };

  if (loading) return <div className="text-center py-20">Loading Course...</div>;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <div className="w-[90%] m-auto py-8">
      <div className="w-full flex flex-col lg:flex-row gap-8">
        {/* Main Content Section */}
        <div className="lg:w-[65%] space-y-8">
          {/* Header Section */}
          <header className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {course.title}
            </h1>
            <div className="flex items-center gap-4">
              <Ratings rating={course.averageRating} />
              <span className="text-gray-600 dark:text-gray-300">
                ({course.reviews.length} Reviews)
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {course.department} • Year {course.year}
              </span>
            </div>
          </header>

          {/* Tabs Navigation */}
          <nav className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-6">
              {['content', 'worksheets', 'qna', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 border-b-2 ${activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </nav>

          {/* Dynamic Tab Content */}
          {activeTab === 'content' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Course Description</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {course.description}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Learning Outcomes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-green-500 mt-1">✓</span>
                      <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'worksheets' && (
            <div className="space-y-6">
              {course.worksheets.map((worksheet) => (
                <div key={worksheet.id} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-24 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        <FiDownloadCloud className="text-3xl text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 dark:text-white">{worksheet.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{worksheet.pages} pages</span>
                        <span>•</span>
                        <span>{worksheet.section}</span>
                      </div>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${worksheet.fileUrl}`}
                        download
                        className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <FiDownloadCloud />
                        Download Worksheet
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Q&A Section */}
          {activeTab === 'qna' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Ask a Question</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                  />
                  <button
                    onClick={handleQuestionSubmit}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ask
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {course.questions.map((question) => (
                  <div key={question.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <div className="flex items-start gap-4">
                      <VscCommentDiscussion className="text-2xl text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">{question.text}</p>
                        {question.answer && (
                          <div className="mt-3 pl-4 border-l-4 border-blue-500">
                            <p className="text-gray-600 dark:text-gray-300">{question.answer}</p>
                            <div className="mt-2 text-sm text-blue-500">Official Answer</div>
                          </div>
                        )}
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Asked by {question.student.name} • {new Date(question.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Share Your Experience</h3>
                <div className="space-y-4">
                  <Ratings rating={rating} setRating={setRating} />
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
                    rows={4}
                  />
                  <button
                    onClick={handleReviewSubmit}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {course.reviews.map((review) => (
                  <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300">
                          {review.student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{review.student.name}</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Section */}
        <div className="lg:w-[35%]">
          <div className="sticky top-20 space-y-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Course Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Department</dt>
                  <dd className="text-gray-900 dark:text-white">{course.department}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Academic Year</dt>
                  <dd className="text-gray-900 dark:text-white">Year {course.year}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Total Students</dt>
                  <dd className="text-gray-900 dark:text-white">{course.totalStudents.toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm space-y-4">
              <button
                onClick={toggleBookmark}
                className="w-full flex items-center justify-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isBookmarked ? (
                  <><BsBookmarkFill className="text-blue-500" /> Bookmarked</>
                ) : (
                  <><BsBookmark className="text-gray-600 dark:text-gray-300" /> Bookmark Course</>
                )}
              </button>

              <button className="w-full flex items-center justify-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <BsChatDots className="text-gray-600 dark:text-gray-300" />
                Contact Instructor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;