import React, { FC, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BiSearch } from 'react-icons/bi'
import client1Img from '../../public/assets/client-1.jpg'
import client2Img from '../../public/assets/client-2.jpg'
import client3Img from '../../public/assets/client-3.jpg'
import bannerImg1 from "../../public/assets/hero01.jpg"
import bannerImg2 from "../../public/assets/hero02.jpg"
import bannerImg3 from "../../public/assets/hero03.jpg"
import bannerImg4 from "../../public/assets/hero04.jpg"
import bannerImg5 from "../../public/assets/hero05.jpg"
import { useRouter } from 'next/router'
import { TextGenerateEffect } from "../../src/components/ui/text-generate-effect";
import {ColourfulText} from "../../src/components/ui/colour-full-text";
import { motion } from "motion/react";
import { AnimatedTooltip } from './ui/animated-tooltip'
type Props = {}

const Hero: FC<Props> = () => {
  const [search, setSearch] = useState("")
  const [currentSlide, setCurrentSlide] = useState(0)
  // const router = useRouter()
  const words = "Improve Your Online"
  const words2 =" Learning Experience Better Instantly"
  const banners = [bannerImg1, bannerImg2, bannerImg3, bannerImg4, bannerImg5]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = () => {
    if (search) {
      router.push(`/courses?title=${search}`)
    }
  }

  const people = [
    {
      id: 1,
      name: "John Doe",
      designation: "Software Engineer",
      image:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
    },
    {
      id: 2,
      name: "Robert Johnson",
      designation: "Product Manager",
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 3,
      name: "Jane Smith",
      designation: "Data Scientist",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 4,
      name: "Emily Davis",
      designation: "UX Designer",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 5,
      name: "Tyler Durden",
      designation: "Soap Developer",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
    },
    {
      id: 6,
      name: "Dora",
      designation: "The Explorer",
      image:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80",
    },
  ];
  return (
    <div className='w-full 1000px:flex items-center justify-between 1000px:h-[100vh]'>
      <div className="1000px:w-[40%] 1000px:ml-[30px] px-4 1000px:px-0 ">
        <h1 className='dark:text-white text-[#000000c7] text-[30px] 1000px:text-[60px] font-[800] font-Josefin_Sans 1000px:leading-[75px]  ml-10 mt-10 text-center '>
        <TextGenerateEffect words={words} />
        <TextGenerateEffect words={words2} />
        </h1>
        <p className='dark:text-[#edfff4] text-[#000000ac] font-Josefin_Sans font-[600] text-[16px] mt-0 text-center'>
        
          {/* <motion.img
        src=""
        className="h-full w-full object-cover absolute inset-0 [mask-image:radial-gradient(circle,transparent,black_80%)] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1 }}
      /> */}
      <p className="text-lg md:text-lg lg:text-lg ml-10 text-gray-500 font-light relative z-2 font-sans text-center ">
            We have<ColourfulText text=" 40k+ Online Work sheets" /> &
            <ColourfulText text=" 500K+ Online registered student" />. Find your desired Work sheets from them.      
      </p>
        </p>
        
       
      </div>

      <div className="1000px:w-[50%] relative h-[60vh] 1000px:h-[90vh] mt-1 1000px:mt-0">
        <div className="absolute top-0 left-0 w-[94%] md:ml-12 ml-3  h-full overflow-hidden ">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 rounded-2xl ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={banner}
                alt={`banner-${index}`}
                layout="fill"
                objectFit="cover"
                className=" items-center justify-center rounded-2xl"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center">

        <div className='flex items-center mt-6 '>
        <div className="flex flex-row items-center justify-center mb-10 w-full md:-mr-10 mr-0">
      <AnimatedTooltip items={people} />
    </div>
          <p className='font-Josefin_Sans dark:text-[#edfff4] text-[#000000b3] ml-0 text-[16px] -mt-8'>
            <span className='text-[#000] font-extrabold'>500K+ </span>
            People already trusted us. {' '}
            <Link href='/courses' className='dark:text-[#46e256] text-[crimson]'>
              View Work sheets
            </Link>
          </p>
        </div>
        <div className='xl:w-[45%] lg:w-[15%] w-[90%] h-[50px] bg-transparent relative  md:mr-10  mt-2'>
          <input
            type="search"
            placeholder='Search Courses...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='bg-transparent border dark:border-none dark:bg-[#575757] dark:placeholder:text-[#ffffffdd] rounded-[5px] p-2 w-full h-full outline-none text-[#0000004e] dark:text-[#ffffffe6] text-[20px] font-[500] font-Josefin_Sans'
          />
          <div 
            className='absolute flex items-center justify-center w-[50px] cursor-pointer h-[50px] right-0 top-0 bg-[#39c1f3] rounded-r-[5px]' 
            onClick={handleSearch}
          >
            <BiSearch className='text-white' size={30}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero