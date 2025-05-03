"use client";

import React, { FC, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import { style } from "@/src/styles/style";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';


type Props = {};

const schema = Yup.object().shape({
  name: Yup.string().required("Please enter your name!"),
  email: Yup.string().email("Invalid email!").required("Please enter your email!"),
  password: Yup.string().required("Please enter your password!").min(6),
  department_id: Yup.string().required("Select a department!"),
});

const SignUp: FC<Props> = () => {
  const [show, setShow] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      const res = await axios.get("http://localhost:3032/admin/get-departments");
      setDepartments(res.data);
    };
    fetchDepartments();
  }, []);

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", department_id: "" },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("department_id", values.department_id);
        if (image) formData.append("image", image);

        const res = await axios.post("http://localhost:3032/student/student-sign-up", formData);

        if (res.data.status) {
          toast.success("Student registered successfully!");
          resetForm();
        } else {
          toast.error(res.data.message || "Registration failed!");
        }
      } catch (err) {
        toast.error("Something went wrong!");
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
        <h1 className={`${style.title}`}>Join to Exam Bank</h1>
        <form onSubmit={handleSubmit}>
          <label className={style.label} htmlFor="name">Enter your Name</label>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            id="name"
            placeholder="John Doe"
            className={`${errors.name && touched.name && "border-red-500"} ${style.input}`}
          />
          {errors.name && touched.name && <span className="text-red-500">{errors.name}</span>}

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
          {errors.email && touched.email && <span className="text-red-500">{errors.email}</span>}

          <div className="w-full relative mb-1">
            <label className={style.label} htmlFor="password">Enter your Password</label>
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
              <AiOutlineEye className="absolute bottom-3 right-2 cursor-pointer" size={20} onClick={() => setShow(false)} />
            ) : (
              <AiOutlineEyeInvisible className="absolute bottom-3 right-2 cursor-pointer" size={20} onClick={() => setShow(true)} />
            )}
          </div>
          {errors.password && touched.password && <span className="text-red-500">{errors.password}</span>}

          <label className={style.label} htmlFor="department_id">Select Department</label>
          <select
            name="department_id"
            value={values.department_id}
            onChange={handleChange}
            className={`${errors.department_id && touched.department_id && "border-red-500"} ${style.input}`}
          >
            <option value="">Choose one</option>
            {departments.map((d: any) => (
              <option value={d.id} key={d.id}>{d.department_name}</option>
            ))}
          </select>
          {errors.department_id && touched.department_id && <span className="text-red-500">{errors.department_id}</span>}

          <label className={style.label} htmlFor="image">Upload Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.currentTarget.files?.[0] || null)}
            className={`${style.input}`}
          />

          <div className="w-full mt-5">
            <input type="submit" value="Sign Up" className={style.button} />
          </div>

          <h5 className="text-center pt-4 text-[14px]">
            Already have an account?
            <a href="/Login" className="text-[#2190ff] pl-1">Sign In</a>
          </h5>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
