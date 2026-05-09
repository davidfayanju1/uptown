import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/axios";
import { toast } from "sonner";

// Extracted API functions
const verifyOtp = async (otpData) => {
  const response = await api.post("/v1/auth/verify", otpData);
  return response.data;
};

const resendOtp = async (emailData) => {
  const response = await api.post("/v1/auth/resend-verification", emailData);
  return response.data;
};

const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  // Get email from location state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // Fallback - you might want to redirect to signup if no email
      toast.error("Email not found. Please sign up again.");
      navigate("/signup");
    }
  }, [location, navigate]);

  // Verify OTP mutation
  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      toast.success(data?.message || "Email verified successfully! Welcome!");
      console.log("OTP verification successful:", data);

      // Store token if provided
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // Redirect to home page after successful verification
      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Invalid verification code. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
      console.error("OTP verification error:", error);
    },
  });

  // Resend OTP mutation
  const resendMutation = useMutation({
    mutationFn: resendOtp,
    onSuccess: (data) => {
      toast.success(
        data?.message || "Verification code sent! Please check your email.",
      );

      // Start cooldown timer
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Clear previous OTP and error
      setOtp(["", "", "", "", "", ""]);
      setError("");

      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to resend code. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
      console.error("Resend OTP error:", error);
    },
  });

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("").slice(0, 6);
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);

      // Focus the last input with data
      const lastFilledIndex = newOtp.length - 1;
      if (lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      setError("Please enter the complete 6-digit code");
      return;
    }

    // Prepare payload with token
    const payload = {
      token: otpString,
    };

    verifyMutation.mutate(payload);
  };

  // Resend OTP
  const handleResend = () => {
    if (resendCooldown > 0 || resendMutation.isPending) return;

    if (!email) {
      toast.error("Email not found. Please sign up again.");
      navigate("/signup");
      return;
    }

    // Prepare payload with email
    const payload = {
      email: email,
    };

    resendMutation.mutate(payload);
  };

  // Auto-submit when all fields are filled
  useEffect(() => {
    if (otp.every((digit) => digit !== "") && !verifyMutation.isPending) {
      handleVerify(new Event("submit"));
    }
  }, [otp]);

  const isLoading = verifyMutation.isPending || resendMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/images/companylogo.png"
            alt="Company Logo"
            className="md:w-[7rem] w-[8rem] h-[8rem] md:h-[7rem]"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-center text-sm font-medium text-gray-900">
          {email || "your email"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 transition-all duration-300 hover:shadow-2xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleVerify}>
            {/* OTP Inputs */}
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {verifyMutation.isPending ? (
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
                    Verifying...
                  </div>
                ) : (
                  "Verify Email"
                )}
              </button>
            </div>
          </form>

          {/* Resend Code Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              {resendCooldown > 0 ? (
                <span className="text-gray-500">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                  className="text-black font-medium hover:text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendMutation.isPending ? "Sending..." : "Resend Code"}
                </button>
              )}
            </p>
          </div>

          {/* Back to Signup */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/signup")}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              ← Back to Sign Up
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Check your spam folder or{" "}
            <button
              onClick={() => navigate("/support")}
              className="underline text-gray-600 hover:text-black transition-colors duration-200"
            >
              contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Otp;
