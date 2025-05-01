import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { AiOutlineUnorderedList } from 'react-icons/ai';

// Demo data interface
interface DemoCourse {
  _id: string;
  name: string;
  thumbnail: { url: string };
  ratings: number;
  purchased: number;
  price: number;
  estimatedPrice: number;
  courseData: any[];
}

const CourseCard = () => {
  // Static demo data
  const demoItem: DemoCourse = {
    _id: '1',
    name: 'Introduction to Web Development',
    thumbnail: {
      url: '/placeholder-course.jpg' // Use a placeholder image path
    },
    ratings: 4.5,
    purchased: 2350,
    price: 29.99,
    estimatedPrice: 99.99,
    courseData: new Array(12) // 12 lectures
  };

  return (
    <Link href="/course-demo">
      <div className="w-full min-h-[35vh] bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow">
        <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
          <Image
            src={demoItem.thumbnail.url}
            alt="Course thumbnail"
            layout="fill"
            objectFit="cover"
            className="hover:scale-105 transition-transform"
          />
        </div>
        
        <h2 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">
          {demoItem.name}
        </h2>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex text-yellow-400">
            {/* Simple star rating display */}
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-lg">
                {i < Math.floor(demoItem.ratings) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span className="text-gray-600 dark:text-gray-300">
            {demoItem.purchased.toLocaleString()} Students
          </span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              ${demoItem.price}
            </span>
            <span className="text-gray-500 line-through dark:text-gray-400">
              ${demoItem.estimatedPrice}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
            <AiOutlineUnorderedList className="text-xl" />
            <span>{demoItem.courseData.length} Lectures</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;