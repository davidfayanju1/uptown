import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/axios";
import { toast } from "sonner";

// Extracted API function
const registerUser = async (userData) => {
  const response = await api.post("/v1/auth/register", userData);
  return response.data;
};

const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    newsletter: true,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Map field names to match API schema
    const apiFieldName =
      name === "firstName"
        ? "first_name"
        : name === "lastName"
          ? "last_name"
          : name;

    setFormData((prev) => ({
      ...prev,
      [apiFieldName]: type === "checkbox" ? checked : value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim())
      newErrors.firstName = "First name is required";
    if (!formData.last_name.trim())
      newErrors.lastName = "Last name is required";

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const signupMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      toast.success(data?.message || "Account created successfully!");
      console.log("Signup successful:", data);

      // Redirect to OTP page after successful signup
      setTimeout(() => {
        navigate("/otp", {
          state: {
            email: formData.email,
            userData: data?.user || {},
          },
        });
      }, 1500);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.errors?.fields?.password[0] ||
        error?.response?.data?.message ||
        "An error occurred during signup. Please try again.";
      toast.error(errorMessage);
      console.error("Signup error:", error);

      console.log(error?.response?.data?.errors?.fields, "Error response");

      // Handle specific error cases
      if (error?.response?.status === 409) {
        setErrors({
          email:
            "Email already registered. Please use a different email or login.",
        });
      } else if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // Show validation errors via toast
      Object.values(formErrors).forEach((error) => {
        toast.error(error);
      });
      return;
    }

    // Prepare payload matching the required schema
    const payload = {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      password: formData.password,
    };

    signupMutation.mutate(payload);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex px-4 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/images/companylogo.png"
            alt=""
            className="md:w-[7rem] w-[8rem] h-[8rem] md:h-[7rem]"
          />
        </div>
        <h2 className="md:mt-6 text-center text-3xl font-normal text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-2 text-center text-[12px] text-gray-600">
          Join us for exclusive products, offers and events
        </p>
      </div>

      <div className="md:mt-8 mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 transition-all duration-300 hover:shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-[11px] font-[300] text-gray-700"
                >
                  First name
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={signupMutation.isPending}
                    placeholder="Enter Firstname"
                    className={`appearance-none placeholder:text-[12px] block w-full px-4 py-3 border ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black transition duration-150 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  />
                  {errors.firstName && (
                    <p className="text-[11px] text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-[11px] font-[300] text-gray-700"
                >
                  Last name
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={signupMutation.isPending}
                    placeholder="Enter Lastname"
                    className={`appearance-none placeholder:text-[12px] block w-full px-4 py-3 border ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black transition duration-150 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  />
                  {errors.lastName && (
                    <p className="text-[11px] text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

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
                  disabled={signupMutation.isPending}
                  placeholder="Enter email..."
                  className={`appearance-none placeholder:text-[12px] block w-full px-4 py-3 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black transition duration-150 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-600">{errors.email}</p>
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
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={signupMutation.isPending}
                  placeholder="Enter password..."
                  className={`appearance-none placeholder:text-[12px] block w-full px-4 py-3 pr-10 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black transition duration-150 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                  disabled={signupMutation.isPending}
                >
                  {showPassword ? (
                    <small className="underline text-[11px] text-gray-500">
                      Hide
                    </small>
                  ) : (
                    <small className="underline text-[11px] text-gray-500">
                      Show
                    </small>
                  )}
                </button>
                {errors.password && (
                  <p className="text-[11px] text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[11px] font-[300] text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={signupMutation.isPending}
                  placeholder="Confirm password..."
                  className={`appearance-none placeholder:text-[12px] block w-full px-4 py-3 pr-10 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black transition duration-150 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={signupMutation.isPending}
                >
                  {showConfirmPassword ? (
                    <small className="underline text-[11px] text-gray-500">
                      Hide
                    </small>
                  ) : (
                    <small className="underline text-[11px] text-gray-500">
                      Show
                    </small>
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="newsletter"
                name="newsletter"
                type="checkbox"
                checked={formData.newsletter}
                onChange={handleChange}
                disabled={signupMutation.isPending}
                className="h-4 w-4 text-black placeholder:text-[12px] focus:ring-black border-gray-300 disabled:opacity-50"
              />
              <label
                htmlFor="newsletter"
                className="ml-1 block text-[11px] text-gray-400"
              >
                Sign up for exclusive offers, new product launches and more
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-normal text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {signupMutation.isPending ? (
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
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 text-[12px] bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/signin"
                className="w-full flex border-solid border-gray-300 border-[1px] justify-center py-3 px-4 text-sm font-normal text-gray-900"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{" "}
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

export default Signup;
