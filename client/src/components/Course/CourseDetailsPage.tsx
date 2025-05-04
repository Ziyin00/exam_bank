'use client'

import React, { useState } from "react";
import Ratings from "@/utils/Ratings";
import CourseContentList from "./CourseContentList";
import Image from "next/image";
import avatar from "../../../public/assets/avatar.jpg";
import { VscVerifiedFilled, VscCommentDiscussion } from "react-icons/vsc";
import { BsBookmark, BsBookmarkFill, BsDownload, BsChatDots } from "react-icons/bs";
import CourseImagePlayer from "@/utils/CourseImage";

const CourseDetailsPage = () => {
  // Demo data
  const demoCourse = {
    name: "Data Structure and Algorithm Practical Questions",
    ratings: 4.5,
    reviews: [
      {
        user: { name: "John Doe", avatar: null },
        rating: 4,
        comment: "Great course for beginners!",
        createdAt: "2024-03-15",
        commentReplies: []
      }
    ],
    price: 29.99,
    estimatedPrice: 99.99,
    benefits: [
      { title: "Full-stack development skills" },
      { title: "Build real-world projects" }
    ],
    prerequisites: [
      { title: "Basic computer knowledge" },
      { title: "No coding experience required" }
    ],
    courseData: [
      { title: "Introduction to HTML", videoLength: 15 },
      { title: "CSS Fundamentals", videoLength: 25 }
    ],
    description: `Learn web development from scratch with this comprehensive bootcamp. 
    Build modern websites and applications using the latest technologies.`,
    demoUrl: "https://example.com/demo-video.mp4"
  };

  // State Management
  const [isPurchased, setIsPurchased] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [courseProgress, setCourseProgress] = useState(35);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState(demoCourse.reviews);
  const [questions, setQuestions] = useState([
    { 
      id: 1,
      user: { name: "Demo User", avatar: null },
      question: "How long does the course take to complete?",
      answers: [],
      createdAt: "2024-03-16"
    }
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState<{ [key: number]: string }>({});
  const [assignmentAnswer, setAssignmentAnswer] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const discountPercentage = Math.round(
    ((demoCourse.estimatedPrice - demoCourse.price) / demoCourse.estimatedPrice) * 100
  );

  // Handlers
  const handleReviewSubmit = () => {
    if (!isPurchased) return;
    
    const newReview = {
      user: { name: "Demo User", avatar: null },
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString().split('T')[0],
      commentReplies: []
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Components
  const RightSidebar = () => (
    <div className="sticky top-20 space-y-6">
      <CourseImagePlayer  />
      
      {/* Enrollment Section */}
     

      {/* Progress Tracker */}
    

      {/* Quick Actions */}
   

      {/* Live Help Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Need Help?</h3>
        <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
          <BsChatDots className="inline mr-2" /> Live Chat Support
        </button>
      </div>
    </div>
  );

  const InteractiveSections = () => (
    <div className="space-y-8">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {['content', 'qna', 'reviews', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 border-b-2 ${
                activeTab === tab 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {/* {activeTab === 'content' && <CourseContentList />} */}

      {activeTab === 'qna' && (
        <div className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Ask a Question</h3>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              rows={3}
            />
            <button
              onClick={handleQuestionSubmit}
              className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Question
            </button>
          </div>

          {questions.map((question) => (
            <div key={question.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-start gap-4">
                <Image
                  src={avatar}
                  alt="User avatar"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold dark:text-white">
                      {question.user.name}
                    </h3>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {question.createdAt}
                    </time>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {question.question}
                  </p>

                  <div className="mt-4 ml-8 space-y-4">
                    {question.answers.map((answer, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <Image
                          src={avatar}
                          alt="User avatar"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium dark:text-white">
                              {answer.user.name}
                            </h4>
                            <time className="text-sm text-gray-500 dark:text-gray-400">
                              {answer.createdAt}
                            </time>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {answer.text}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isPurchased && (
                      <div className="mt-4">
                        <input
                          type="text"
                          value={newAnswer[question.id] || ""}
                          onChange={(e) => setNewAnswer({
                            ...newAnswer,
                            [question.id]: e.target.value
                          })}
                          placeholder="Write your answer..."
                          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          onClick={() => handleAnswerSubmit(question.id)}
                          className="mt-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Post Answer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Write a Review</h3>
            <Ratings rating={reviewRating} setRating={setReviewRating} interactive />
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your course experience..."
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white mt-2"
              rows={4}
            />
            <button
              onClick={handleReviewSubmit}
              className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Review
            </button>
          </div>

          {reviews.map((review, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-start gap-4">
                <Image
                  src={avatar}
                  alt="User avatar"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold dark:text-white">
                      {review.user.name}
                    </h3>
                    <Ratings rating={review.rating} />
                    <time className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      {review.createdAt}
                    </time>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Current Assignment</h3>
            <h4 className="text-md font-medium dark:text-white mb-2">Week 1: HTML/CSS Project</h4>
            <p className="dark:text-gray-300 mb-4">
              Create a responsive landing page using HTML and CSS. 
              Submit your code as a ZIP file and include a live demo URL.
            </p>
            
            <div className="space-y-4">
              <textarea
                value={assignmentAnswer}
                onChange={(e) => setAssignmentAnswer(e.target.value)}
                placeholder="Add any comments or questions..."
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                rows={3}
              />
              
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {activeTab === 'notes' && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Course Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your notes here..."
            className="w-full h-64 p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <button className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Save Notes
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-[90%] m-auto py-5">
      <div className="w-full flex flex-col 800px:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full 800px:w-[65%]">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {demoCourse.name}
          </h1>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <Ratings rating={demoCourse.ratings} />
              <span className="text-gray-600 dark:text-gray-300">
                ({reviews.length} Reviews)
              </span>
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              1,234 Students
            </span>
          </div>

          <div className="my-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {demoCourse.description}
            </p>
          </div>

          <InteractiveSections />
        </div>

        {/* Right Sidebar */}
        <div className="w-full 800px:w-[35%]">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;