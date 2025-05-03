"use client";

import React, { FC, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
import { style } from "@/src/styles/style";

type Props = {};

const schema = Yup.object().shape({
  email: Yup.string().email("Invalid email!").required("Please enter your email!"),
  password: Yup.string().required("Please enter your password!").min(6),
});

const Login: FC<Props> = () => {
  const [show, setShow] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      try {
        const res = await axios.post("http://localhost:3032/student/login", {
          email,
          password,
        });

        if (res.data.loginStatus) {
          toast.success("Login successful!");

          //  Save token in localStorage/sessionStorage
          localStorage.setItem("s-token", res.data.token);


          window.location.href = "";
        } else {
          toast.error(res.data.message || "Login failed!");
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className="w-full flex items-center justify-center h-[90vh] -mt-4">
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <div className="w-[500px] items-center bg-accent shadow-md rounded-lg p-5">
        <h1 className={style.title}>Login to Exam Bank</h1>
        <form onSubmit={handleSubmit}>
          <label className={style.label} htmlFor="email">Enter your Email</label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            id="email"
            placeholder="loginmail@gmail.com"
            className={`${errors.email && touched.email && "border-red-500"} ${style.input}`}
          />
          {errors.email && touched.email && (
            <span className="text-red-500 pt-2 block">{errors.email}</span>
          )}

          <label className={style.label} htmlFor="password">Enter your Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={handleChange}
              id="password"
              placeholder="password!@%"
              className={`${errors.password && touched.password && "border-red-500"} ${style.input}`}
            />
            {show ? (
              <AiOutlineEye
                className="absolute right-3 top-3 cursor-pointer"
                size={20}
                onClick={() => setShow(false)}
              />
            ) : (
              <AiOutlineEyeInvisible
                className="absolute right-3 top-3 cursor-pointer"
                size={20}
                onClick={() => setShow(true)}
              />
            )}
          </div>
          {errors.password && touched.password && (
            <span className="text-red-500 pt-2 block">{errors.password}</span>
          )}

          <div className="w-full mt-5">
            <input type="submit" value="Login" className={style.button} />
          </div>

          <h5 className="text-center pt-4 text-[14px]">
            Don&apos;t have an account?
            <a href="/Signup" className="text-[#2190ff] pl-1">Sign Up</a>
          </h5>
        </form>
      </div>
    </div>
  );
};

export default Login;
