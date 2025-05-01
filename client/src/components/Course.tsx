import React from "react";
import { ThreeDCardDemo } from "./ui/ThreeDCardDemo";
import { ColourfulText } from "../../src/components/ui/colour-full-text";
import { motion } from "framer-motion";
import { slideInFromBottom } from "@/utils/motion";

type Props = {};

const Course = (props: Props) => {
  return (
    <div>
      <h1 className="text-center font-Poppins text-[25px] leading-[35px] sm:text-3xl lg:text-4xl dark:text-white 800px:leading-[60px] text-[#000] font-[700] tracking-tight mt-20">
        Expand Your Career <ColourfulText text="Opportunity" /> <br />
        With Our Courses
      </h1>
      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-10 px-0 mx-20 justify-evenly items-center "
      >
        <motion.div variants={slideInFromBottom}>
          <ThreeDCardDemo />
        </motion.div>
        <motion.div variants={slideInFromBottom}>
          <ThreeDCardDemo />
        </motion.div>
        <motion.div variants={slideInFromBottom}>
          <ThreeDCardDemo />
        </motion.div>
        <motion.div variants={slideInFromBottom}>
          <ThreeDCardDemo />
        </motion.div>
        <motion.div variants={slideInFromBottom}>
          <ThreeDCardDemo />
        </motion.div>
        <motion.div variants={slideInFromBottom}>
          <ThreeDCardDemo />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Course;
