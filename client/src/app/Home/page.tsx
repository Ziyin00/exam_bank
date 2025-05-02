'use client';

import Benefit from "@/src/components/Benefit";
import Course from "@/src/components/Course";
import FAQ from "@/src/components/Faq";
import Footer from "@/src/components/Footer";
import Hero from "@/src/components/Hero";
import Navbar from "@/src/components/Navbar";
import { Testimonial } from "@/src/components/Testimonial";


export default function Home() {

  return (
  
    <>
      <Navbar />
      
      <Hero />
      <Course />
      <Benefit />
      <Testimonial />
      <FAQ />
      
      <Footer />
    
    </>
  );
}
