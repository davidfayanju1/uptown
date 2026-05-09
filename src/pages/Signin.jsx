import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/axios";
import { toast } from "sonner";

// Extracted API function
const loginUser = async (userData) => {
  const response = await api.post("/v1/auth/login", userData);
  return response.data;
};

const Signin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      toast.success("Login successful! Redirecting...");
      console.log("Login successful:", data);
      // Store token or user data here if needed
      // localStorage.setItem("token", data.token);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || "Invalid email or password";
      toast.error(errorMessage);
      console.log(
        "Error submitting form:",
        error?.response?.data || error.message,
      );

      setErrors({
        general: errorMessage,
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setErrors({});
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    } else {
      setErrors(formErrors);
      // Show validation errors via toast
      Object.values(formErrors).forEach((error) => {
        toast.error(error);
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/images/companylogo.png"
            alt=""
            className="md:w-[7rem] w-[8rem] h-[8rem] md:h-[7rem]"
          />
        </div>
        <h2 className="md:mt-6 text-center text-3xl font-normal text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/signup"
            className="font-medium underline text-black hover:text-black transition-colors duration-200"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="md:mt-8 mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 transition-all duration-300 hover:shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-[300] text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  placeholder="Enter email..."
                  className={`appearance-none placeholder:text-[12px] block w-full px-4 py-3 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black transition duration-150 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-[300] text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  placeholder="Enter password..."
                  className={`appearance-none block w-full px-4 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } shadow-sm placeholder-gray-400 placeholder:text-[12px] focus:outline-none focus:ring-black focus:border-black transition duration-150 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 disabled:opacity-50"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-[11px] text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-[11px]">
                <a
                  href="#"
                  className="font-medium underline text-black hover:text-gray-800 transition-colors duration-200"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10C20 4.477 15.523 0 10 0zm.908 15.68c-3.136 0-5.68-2.544-5.68-5.68 0-3.136 2.544-5.68 5.68-5.68 1.53 0 2.864.576 3.904 1.52l-1.584 1.584A3.98 3.98 0 0010 6.32c-2.208 0-4 1.792-4 4s1.792 4 4 4c1.904 0 3.504-1.328 3.888-3.104H10.92V9.28h5.6v.496c0 3.136-2.544 5.904-5.612 5.904z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="underline text-gray-600 hover:text-black transition-colors duration-200"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline text-gray-600 hover:text-black transition-colors duration-200"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;
