"use client";

import React, { FC, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiFillGithub,
} from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
// import { style } from "@/styles/style";

import toast from "react-hot-toast";
import { style } from "@/src/styles/style";
// import { useRegisterMutation } from "@/redux/features/auth/authApi";

type Props = {

};

const schema = Yup.object().shape({
    name: Yup.string().required("Please enter your name!"),
  email: Yup.string()
    .email("Invalid email!")
    .required("Please enter your email!"),
  password: Yup.string().required("Please enter your password!").min(6),
});

const SignUp: FC<Props> = (props) => {
  const [show, setShow] = useState(false);
 

  const formik = useFormik({
    initialValues: { name :"",email: "", password: "" },
    validationSchema: schema,
    onSubmit: async ({ name,email, password }) => {
      const data = {
          name, email, password
      }
      await register(data);
    },
  });

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className="w-full flex items-center justify-center h-[90vh] -mt-4 ">

    <div className="w-[500px] items-center bg-accent shadow-md rounded-lg   p-5 ">
      <h1 className={`${style.title}`}>Join to Exam Bank</h1>
          <form onSubmit={handleSubmit}>
          <label className={`${style.label}`} htmlFor="name">
          Enter your Name
        </label>
        <input
          type="text"
          name=""
          value=""
          onChange={handleChange}
          id="name"
          placeholder="Jhon Doe"
          className={`${errors.name && touched.name && "border-red-500"} ${
            style.input
          } `}
              />
               {errors.name && touched.name && (
          <span className="text-red-500 pt-2 block ">{errors.name}</span>
        )}
       
      <label className={`${style.label}`} htmlFor="email">
          Enter your Email
        </label>
        <input
          type="email"
          name=""
          value={values.email}
          onChange={handleChange}
          id="email"
          placeholder="loginmail@gmail.com"
          className={`${errors.email && touched.email && "border-red-500"} ${
            style.input
          } `}
        />
        {errors.email && touched.email && (
          <span className="text-red-500 pt-2 block ">{errors.email}</span>
        )}
        <div className="w-full relative mb-1">
          <label className={`${style.label}`} htmlFor="password">
            Enter your Password
          </label>
          <input
            type={!show ? "password" : "text"}
            name="password"
            value={values.password}
            onChange={handleChange}
            id="password"
            placeholder="password!@%"
            className={`${
              errors.password && touched.password && "border-red-500"
            } ${style.input} `}
          />
          {!show ? (
            <AiOutlineEyeInvisible
              className="absolute bottom-3 right-2 z-1 cursor-pointer"
              size={20}
              onClick={() => setShow(true)}
            />
          ) : (
            <AiOutlineEye
              className="absolute bottom-3 right-2 z-1 cursor-pointer"
              size={20}
              onClick={() => setShow(false)}
            />
          )}
        </div>
          {errors.password && touched.password && (
            <span className="text-red-500 pt-2 block ">{errors.password}</span>
          )}
        <div className="w-full mt-5">
          <input type="submit" value="Sign Up" className={`${style.button}`} />
        </div>
        <br />
     
        <h5 className="text-center -mt-8 pt-4 font-Poppins text-[14px]  ">
          Already have an account?
          <span
            className="text-[#2190ff] pl-1 cursor-pointer "
            // onClick={() => setRoute("Login")}
          >
              <a href="/Login">
            Sign In
              </a>
          </span>
        </h5>
          </form>
          <br/>
    </div>
    </div>
  );
};

export default SignUp;
