"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineWarning } from "react-icons/ai";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import avatar from "../../../public/assets/login-gif.gif";
import axios from "axios";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  department_id: Yup.string().required("Department is required"),
});

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:3032/admin/get-departments");
        setDepartments(res.data);
      } catch (error) {
        toast.error("Failed to load departments");
      }
    };
    fetchDepartments();
  }, []);

  const formik = useFormik({
    initialValues: { 
      name: "", 
      email: "", 
      password: "", 
      department_id: "" 
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!image) {
        toast.error("Please upload an image");
        return;
      }

      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("department_id", values.department_id);
        formData.append("image", image);

        const res = await axios.post(
          "http://localhost:3032/student/student-sign-up",
          formData
        );

        if (res.data.status) {
          toast.success("Account created successfully!");
          formik.resetForm();
          setImage(null);
        } else {
          toast.error(res.data.message || "Registration failed!");
        }
      } catch (error) {
        toast.error("Something went wrong!");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const loadDemoData = () => {
    formik.setValues({
      name: "John Doe",
      email: "john@example.com",
      password: "demo@12345",
      department_id: ""
    });
    toast.success("Demo credentials loaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* Illustration Section */}
        <div className="hidden md:block bg-gradient-to-br from-indigo-600 to-purple-600 p-12 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]" />
          <div className="flex flex-col justify-around gap-20 h-full">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">Welcome to ExamBank</h2>
              <p className="text-indigo-100 text-lg">
                Your gateway to thousands of practice exams and educational resources
              </p>
            </div>
            <Image
              src={avatar}
              alt="Online Learning"
              width={500}
              height={400}
              className="mx-auto rounded-lg -mt-40"
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-500">Start your journey with us</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  name="name"
                  autoFocus
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formik.errors.name && formik.touched.name
                      ? "border-red-500 pr-10"
                      : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                />
                {formik.errors.name && formik.touched.name && (
                  <div className="absolute right-3 top-3.5 text-red-500">
                    <AiOutlineWarning className="h-5 w-5" />
                  </div>
                )}
              </div>
              {formik.errors.name && formik.touched.name && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formik.errors.email && formik.touched.email
                      ? "border-red-500 pr-10"
                      : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                />
                {formik.errors.email && formik.touched.email && (
                  <div className="absolute right-3 top-3.5 text-red-500">
                    <AiOutlineWarning className="h-5 w-5" />
                  </div>
                )}
              </div>
              {formik.errors.email && formik.touched.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formik.errors.password && formik.touched.password
                      ? "border-red-500 pr-10"
                      : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible className="h-5 w-5" />
                  ) : (
                    <AiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formik.errors.password && formik.touched.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            {/* Department Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <div className="relative">
                <select
                  name="department_id"
                  value={formik.values.department_id}
                  onChange={formik.handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formik.errors.department_id && formik.touched.department_id
                      ? "border-red-500 pr-10"
                      : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                >
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
                {formik.errors.department_id && formik.touched.department_id && (
                  <div className="absolute right-3 top-3.5 text-red-500">
                    <AiOutlineWarning className="h-5 w-5" />
                  </div>
                )}
              </div>
              {formik.errors.department_id && formik.touched.department_id && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.department_id}</p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center h-12 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>

            {/* Existing User Link */}
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/Login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </div>

          
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;