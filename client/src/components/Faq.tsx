import React, { useState } from 'react';
import { HiMinus, HiPlus } from 'react-icons/hi';
import {ColourfulText} from "../../src/components/ui/colour-full-text";
import { GlobeDemo } from './GlobeDemo';

// Demo FAQ data
const demoFaqs = [
  {
    _id: '1',
    question: 'How do I access my courses?',
    answer: 'You can access your courses immediately after purchase through your account dashboard. Simply login and navigate to the "My Courses" section.'
  },
  {
    _id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards including Visa, MasterCard, and American Express. We also support PayPal payments.'
  },
  {
    _id: '3',
    question: 'Can I get a refund?',
    answer: 'Yes, we offer a 30-day money-back guarantee for all courses. If you\'re not satisfied, contact our support team for a full refund.'
  },
  {
    _id: '4',
    question: 'Do courses expire?',
    answer: 'No, once you purchase a course, you have lifetime access to all its materials and future updates.'
  },
];

const FAQ = () => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [questions] = useState(demoFaqs);

  const toggleQuestion = (id: string) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  return (
    <div className="w-full py-2 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 ">
      <div className="w-full mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white lg:mb-8 ">
          Frequently Asked  <ColourfulText text="Questions" /> 
        </h1>
        <div className="w-full flex flex-col lg:flex-row justify-around  items-center ">
          <GlobeDemo />

        <div className="space-y-6 w-[55%] -ml-40 z-1">
          {questions.map((q) => (
            <div 
              key={q._id}
              className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 transition-all duration-300 hover:shadow-lg"
            >
              <button
                className="flex justify-between items-center w-full group"
                onClick={() => toggleQuestion(q._id)}
                aria-expanded={activeQuestion === q._id}
                aria-controls={`faq-${q._id}`}
              >
                <span className="text-lg font-medium text-left text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-700 transition-colors">
                  {q.question}
                </span>
                <span className="ml-4 flex-shrink-0">
                  {activeQuestion === q._id ? (
                    <HiMinus className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                  ) : (
                    <HiPlus className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                  )}
                </span>
              </button>

              {activeQuestion === q._id && (
                <div 
                  id={`faq-${q._id}`}
                  className="mt-4 text-gray-600 dark:text-gray-300 transition-all duration-300 ease-in-out"
                >
                  <p className="text-base leading-relaxed">
                    {q.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;