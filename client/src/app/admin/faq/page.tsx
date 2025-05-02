"use client"
import EditFaq from '@/src/components/Admin/Customization/EditFaq'
import DashboardHeader from '@/src/components/Admin/DashboardHeader'
import AdminSidebar from '@/src/components/Admin/sidebar/AdminSideBar'
import React, { FC, useState } from 'react'






type Props = {}

const page: FC<Props> = (props) => {

  const [initialFaqs, setInitialFaqs] = useState<Question[]>([
    {
      id: "1",
      question: "What is your return policy?",
      answer: "We offer 30-day returns for all products.",
      active: true
    }
  ]);

  const handleSave = async (questions: Question[]) => {
    // Add your save logic here (API call, etc.)
    console.log("Saving FAQs:", questions);
    setInitialFaqs(questions);
  };
    
    
  return (
      <div className='bg-gradient-to-b'>
        
          <div>
              
          <div className="flex h-[200vh] ">
          <div className='1500px:w-[16%] w-1/5 '>
                  <AdminSidebar />
              </div>
              <div className='w-[85%] '>
                  <DashboardHeader />
                  <EditFaq 
      initialQuestions={initialFaqs}
      onSave={handleSave}
    />
              </div>
          </div>



             
              
          </div>

    </div>
  )
}

export default page