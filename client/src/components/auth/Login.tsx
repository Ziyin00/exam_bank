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
  role: Yup.string()
    .oneOf(["student", "teacher", "admin"], "Invalid role")
    .required("Role is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (values: { email: string; password: string; role: string }) => {
    setIsLoading(true);
    try {
      const { role, email, password } = values;

      if (!["student", "teacher", "admin"].includes(role)) {
        toast.error("Invalid role");
        return;
      }

      const endpointMap: Record<"student" | "teacher" | "admin", string> = {
        student: "http://localhost:3032/student/login",
        teacher: "http://localhost:3032/teacher/login",
        admin: "http://localhost:3032/admin/login",
      };

      const payload = { email, password, role };

      const { data } = await axios.post(endpointMap[role as "student" | "teacher" | "admin"], payload, {
        timeout: 10000,
      });

      if (data?.loginStatus) {
        toast.success("Login successful!");
        localStorage.setItem(`${role}-token`, data.token);
        localStorage.setItem("role", role);

        if (role === "admin") window.location.href = "/admin";
        else if (role === "teacher") window.location.href = "/admin";
        else window.location.href = "/Home";
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
    initialValues: {
      email: "",
      password: "",
      role: "student" // Default to "student"
    },
    validationSchema,
    onSubmit: handleSubmit,
  });


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
        <div className="hidden md:block relative bg-gradient-to-br from-indigo-600 to-purple-600">
          <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')]" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
          >
            <motion.div className="mb-8">
              <Image src={LearningGif} alt="Online Learning" width={400} height={300} priority />
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-4">Unlock Your Potential</h2>
            <p className="text-xl text-indigo-100 max-w-md">
              Access thousands of practice exams and learning resources
            </p>
          </motion.div>
        </div>

        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
          <motion.div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <Image src={avatar} alt="Exam Bank" width={80} height={80} className="mx-auto" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
              <p className="text-gray-500">Continue your learning journey</p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label>Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  placeholder="example@exambank.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {formik.errors.email && formik.touched.email && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                )}
              </div>

              <div>
                <label>Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
                {formik.errors.password && formik.touched.password && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                )}
              </div>

              <div>
                <label>Role</label>
                <select
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                {formik.errors.role && formik.touched.role && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.role}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !formik.isValid}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
