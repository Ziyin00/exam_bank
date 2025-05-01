'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import { FiDownloadCloud, FiZoomIn } from 'react-icons/fi'

interface Worksheet {
  id: string
  section: string
  title: string
  pages: number
  imageUrl: string
  downloadUrl: string
}

const WorksheetViewer = () => {
  // Demo data with worksheets
  const worksheets: Worksheet[] = [
    { 
      id: '1', 
      section: 'Basic Concepts', 
      title: 'Introduction to Algebra',
      pages: 5,
      imageUrl: '/assets/worksheet1.jpg',
      downloadUrl:'/assets/worksheet1.jpg',
    },
    { 
      id: '2', 
      section: 'Basic Concepts', 
      title: 'Linear Equations Practice',
      pages: 8,
      imageUrl: '/assets/worksheet1.jpg',
      downloadUrl: '/assets/worksheet1.jpg',
    },
    { 
      id: '3', 
      section: 'Advanced Topics', 
      title: 'Quadratic Functions Deep Dive',
      pages: 12,
      imageUrl: '/assets/worksheet1.jpg',
      downloadUrl: '/assets/worksheet1.jpg',
    },
  ]

  // Component state
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(['Basic Concepts'])
  )
  const [activeWorksheet, setActiveWorksheet] = useState(0)

  // Derived data
  const worksheetSections = Array.from(new Set(worksheets.map(ws => ws.section)))
  const activeSheet = worksheets[activeWorksheet]

  // Helper functions
  const toggleSection = (section: string) => {
    const updated = new Set(visibleSections)
    updated.has(section) ? updated.delete(section) : updated.add(section)
    setVisibleSections(updated)
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">
      {/* Worksheet Display Section */}
      <div className="lg:w-[60%] relative group">
        <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:shadow-2xl">
          <Image
            src={activeSheet.imageUrl}
            alt={activeSheet.title}
            fill
            className="object-contain"
            quality={100}
            priority
          />
          
          {/* Interactive Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {activeSheet.title}
                </h2>
                <p className="text-gray-200 flex items-center gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {activeSheet.pages} pages
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href={activeSheet.downloadUrl}
                  download
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                  title="Download PDF"
                >
                  <FiDownloadCloud className="text-2xl text-white" />
                </a>
                <button 
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                  title="Zoom Preview"
                >
                  <FiZoomIn className="text-2xl text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
          <span className="font-medium text-gray-700 dark:text-gray-200">
            Worksheet {activeWorksheet + 1} of {worksheets.length}
          </span>
        </div>
      </div>

      {/* Worksheet List Section */}
      <div className="lg:w-[40%] space-y-6 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
        {worksheetSections.map((section) => {
          const isVisible = visibleSections.has(section)
          const sectionWorksheets = worksheets.filter(ws => ws.section === section)

          return (
            <div key={section} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {section}
                </h3>
                <button
                  onClick={() => toggleSection(section)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={`Toggle ${section} section`}
                >
                  {isVisible ? <BsChevronUp size={18} /> : <BsChevronDown size={18} />}
                </button>
              </div>

              {isVisible && (
                <div className="space-y-4">
                  {sectionWorksheets.map((worksheet, index) => (
                    <div
                      key={worksheet.id}
                      onClick={() => setActiveWorksheet(index)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        activeWorksheet === index
                          ? 'border-blue-300 bg-blue-50 dark:bg-gray-700 dark:border-blue-500'
                          : 'border-gray-200 hover:border-blue-200 dark:border-gray-600 dark:hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={worksheet.imageUrl}
                            alt={worksheet.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-800 dark:text-gray-100">
                            {worksheet.title}
                          </h4>
                          <div className="mt-2 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                              <FiDownloadCloud />
                              {worksheet.pages} pages
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WorksheetViewer