'use client'

import React, { useEffect, useState } from "react";
import Ratings from "@/utils/Ratings";
import CourseContentList from "./CourseContentList";
import Image from "next/image";
import avatar from "../../../public/assets/avatar.jpg";
import { VscVerifiedFilled, VscCommentDiscussion } from "react-icons/vsc";
import { BsBookmark, BsBookmarkFill, BsDownload, BsChatDots } from "react-icons/bs";
import CourseImagePlayer from "@/utils/CourseImage";

const CourseDetailsPage = () => {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState<{ [key: number]: string }>({});
  const [notes, setNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Replace with real API URL from .env
  const COURSE_API = process.env.NEXT_PUBLIC_GET_COURSE_PREVIEW_DATA;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await fetch(`${COURSE_API}?id=courseId123`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        setCourse(data);
        setReviews(data.reviews || []);
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Failed to load course data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, []);

  const handleReviewSubmit = () => {
    if (!isPurchased) return;

    const newReview = {
      user: { name: "Demo User", avatar: null },
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString().split('T')[0],
      commentReplies: [],
    };

    setReviews([...reviews, newReview]);
    setReviewRating(0);
    setReviewComment("");
  };

  const handleQuestionSubmit = () => {
    if (!isPurchased) return;

    const newQ = {
      id: questions.length + 1,
      user: { name: "Demo User", avatar: null },
      question: newQuestion,
      answers: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setQuestions([...questions, newQ]);
    setNewQuestion("");
  };

  const handleAnswerSubmit = (questionId: number) => {
    if (!isPurchased || !newAnswer[questionId]?.trim()) return;

    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: [
            ...q.answers,
            {
              user: { name: "Demo User", avatar: null },
              text: newAnswer[questionId],
              createdAt: new Date().toISOString().split('T')[0]
            }
          ]
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);
    setNewAnswer(prev => ({ ...prev, [questionId]: "" }));
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!course) return <div className="text-center py-10">Course not found</div>;

  const discountPercentage = Math.round(
    ((course.estimatedPrice - course.price) / course.estimatedPrice) * 100
  );

  return (
    <div className="w-[90%] m-auto py-5">
      <div className="w-full flex flex-col 800px:flex-row gap-8">
        <div className="w-full 800px:w-[65%]">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {course.name}
          </h1>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <Ratings rating={course.ratings} />
              <span className="text-gray-600 dark:text-gray-300">
                ({reviews.length} Reviews)
              </span>
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              {course.enrollmentCount || 0} Students
            </span>
          </div>

          <div className="my-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* You can pass course.courseData to <CourseContentList courseData={course.courseData} /> if needed */}
        </div>

        <div className="w-full 800px:w-[35%]">
          <div className="sticky top-20 space-y-6">
            <CourseImagePlayer videoUrl={course.demoUrl} />
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
