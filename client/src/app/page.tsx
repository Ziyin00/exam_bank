'use client';

// import Hero from "@/components/Hero";
// import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Course from "../components/Course";
import Benefit from "../components/Benefit";
import { Testimonial } from "../components/Testimonial";
import FAQ from "../components/Faq";
import Footer from "../components/Footer";
import { GlobeDemo } from "../components/GlobeDemo";

export default function Home() {

  return (
  
    <>
      <Navbar 
      
      />
      <Hero />
      <Course />
      <Benefit />
      <Testimonial />
      
   
      <FAQ />
      
      <Footer />
    
    </>
  );
}
