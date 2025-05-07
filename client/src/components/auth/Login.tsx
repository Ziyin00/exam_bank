"use client";
import React, { useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineWarning } from "react-icons/ai";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import axios from "axios";
import LearningGif from "../../../public/assets/login-gif.gif";
import avatar from "../../../public/assets/avatar.jpg";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required")
    .matches(/@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, "Invalid email format"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")

    .required("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post("http://localhost:3032/student/login", values, {
        timeout: 10000,
      });

      if (data?.loginStatus) {
        toast.success("Login successful!");
        localStorage.setItem("s-token", data.token);
        window.location.href = "/Home";
      } else {
        toast.error(data?.message || "Authentication failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const loadDemoCredentials = useCallback(() => {
    formik.setValues({
      email: "demo@exambank.com",
      password: "Demo@12345" // Stronger demo password
    });
    toast.success("Demo credentials loaded!");
  }, [formik.setValues]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* Image Section */}
        <div className="hidden md:block relative bg-gradient-to-br from-indigo-600 to-purple-600">
          <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')]" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Image
                src={LearningGif}
                alt="Online Learning"
                width={400}
                height={300}
                className="mx-auto hover:scale-105 transition-transform duration-300 rounded-lg"
                priority
              />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Unlock Your Potential
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-indigo-100 max-w-md"
            >
              Access thousands of practice exams and learning resources
            </motion.p>
          </motion.div>
        </div>

        {/* Form Section */}
        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-4 inline-block"
              >
                <Image
                  src={avatar}
                  alt="Exam Bank"
                  width={80}
                  height={80}
                  className="mx-auto hover:rotate-[15deg] transition-transform duration-300"
                  placeholder="blur"
                />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
              <p className="text-gray-500">Continue your learning journey</p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    autoFocus
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="student@exambank.com"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formik.errors.email && formik.touched.email
                        ? "border-red-500 pr-10"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    disabled={isLoading}
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
                    onBlur={formik.handleBlur}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formik.errors.password && formik.touched.password
                        ? "border-red-500 pr-10"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-500"
                    disabled={isLoading}
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

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={loadDemoCredentials}
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  disabled={isLoading}
                >
                  Load Demo Credentials
                </button>
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formik.isValid}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center h-12 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  href="/"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;