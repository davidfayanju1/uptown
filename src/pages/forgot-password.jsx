import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/axios";
import { toast } from "sonner";

const sendResetCode = async ({ email }) => {
  const response = await api.post("/v1/auth/forgot-password", { email });
  return response.data;
};

const resetPassword = async ({ token, password }) => {
  const response = await api.post("/v1/auth/reset-password", { token, password });
  return response.data;
};

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetError, setResetError] = useState(null); // { type: "token"|"network"|"generic", message: string }
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const startCooldown = () => {
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
  };

  const sendCodeMutation = useMutation({
    mutationFn: sendResetCode,
    onSuccess: (data) => {
      toast.success(data?.message || "Reset code sent! Please check your email.");
      setStep(2);
      startCooldown();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message || "Failed to send reset code. Please try again.";
      toast.error(msg);
      setEmailError(msg);
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success(data?.message || "Password reset successfully! Please sign in.");
      setTimeout(() => navigate("/signin"), 1500);
    },
    onError: (error) => {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || "";

      if (!error.response) {
        setResetError({
          type: "network",
          message: "Unable to connect. Please check your internet connection.",
        });
        return;
      }

      const isTokenError =
        status === 400 ||
        status === 401 ||
        status === 422 ||
        /expired|invalid|token/i.test(msg);

      if (isTokenError) {
        setResetError({
          type: "token",
          message: msg || "Your reset code has expired or is invalid. Please request a new one.",
        });
        return;
      }

      setResetError({
        type: "generic",
        message: msg || "Something went wrong. Please try again.",
      });
    },
  });

  const handleSendCode = (e) => {
    e.preventDefault();
    setEmailError("");
    if (!email.trim()) return setEmailError("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return setEmailError("Email is invalid");
    sendCodeMutation.mutate({ email });
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp([...digits, ...Array(6 - digits.length).fill("")]);
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setOtpError("");
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      return setOtpError("Please enter the complete 6-digit code");
    }
    setStep(3);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setPasswordError("");
    setResetError(null);
    if (!password) return setPasswordError("Password is required");
    if (password.length < 6) return setPasswordError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setPasswordError("Passwords do not match");
    resetMutation.mutate({ token: otp.join(""), password });
  };

  const handleResend = () => {
    if (resendCooldown > 0 || sendCodeMutation.isPending) return;
    sendCodeMutation.mutate({ email });
  };

  const fieldClass = (hasError) =>
    `appearance-none block w-full px-4 py-3 border ${
      hasError ? "border-red-500" : "border-gray-300"
    } shadow-sm placeholder-gray-400 placeholder:text-[12px] focus:outline-none focus:ring-black focus:border-black transition duration-150 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed`;

  const headings = [
    { title: "Forgot your password?", sub: "Enter your email and we'll send you a reset code." },
    { title: "Check your email", sub: `We sent a 6-digit code to ${email}` },
    { title: "Create new password", sub: "Almost done. Enter your new password below." },
  ];

  const { title, sub } = headings[step - 1];

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

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="md:mt-6 text-center text-3xl font-normal text-gray-900">{title}</h2>
            <p className="mt-2 text-center text-sm text-gray-600">{sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="md:mt-8 mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10"
            >
              <form className="space-y-6" onSubmit={handleSendCode}>
                <div>
                  <label htmlFor="email" className="block text-[11px] font-[300] text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      disabled={sendCodeMutation.isPending}
                      placeholder="Enter your email..."
                      className={fieldClass(!!emailError)}
                    />
                    {emailError && (
                      <p className="mt-1 text-[11px] text-red-600">{emailError}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendCodeMutation.isPending}
                  className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendCodeMutation.isPending ? (
                    <span className="flex items-center">
                      <Spinner />
                      Sending code...
                    </span>
                  ) : (
                    "Send reset code"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <Link
                  to="/signin"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to sign in
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10"
            >
              <form className="space-y-6" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-[11px] font-[300] text-gray-700 mb-3">
                    Verification code
                  </label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        autoFocus={index === 0}
                        className={`w-11 h-11 text-center text-xl font-semibold border-2 ${
                          otpError ? "border-red-400" : "border-gray-300"
                        } focus:border-black focus:outline-none transition-all duration-200`}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p className="mt-2 text-[11px] text-red-600 text-center">{otpError}</p>
                  )}
                  <p className="mt-4 text-center text-sm text-gray-600">
                    Didn't receive it?{" "}
                    {resendCooldown > 0 ? (
                      <span className="text-gray-400 text-[11px]">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={sendCodeMutation.isPending}
                        className="text-black text-[11px] underline hover:no-underline transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendCodeMutation.isPending ? "Sending..." : "Resend code"}
                      </button>
                    )}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300"
                >
                  Continue
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(["", "", "", "", "", ""]);
                    setOtpError("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Change email address
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: New password ── */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10"
            >
              <form className="space-y-6" onSubmit={handleReset}>
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-[11px] font-[300] text-gray-700"
                  >
                    New password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                        setResetError(null);
                      }}
                      disabled={resetMutation.isPending}
                      placeholder="Enter new password..."
                      className={`${fieldClass(!!passwordError)} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    >
                      <small className="underline text-[11px] text-gray-500">
                        {showPassword ? "Hide" : "Show"}
                      </small>
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-[11px] font-[300] text-gray-700"
                  >
                    Confirm new password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError("");
                        setResetError(null);
                      }}
                      disabled={resetMutation.isPending}
                      placeholder="Confirm new password..."
                      className={`${fieldClass(!!passwordError)} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    >
                      <small className="underline text-[11px] text-gray-500">
                        {showConfirmPassword ? "Hide" : "Show"}
                      </small>
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-[11px] text-red-600">{passwordError}</p>
                  )}
                </div>

                {/* API error banner */}
                {resetError && (
                  <div
                    className={`p-4 border text-sm ${
                      resetError.type === "network"
                        ? "bg-gray-50 border-gray-200 text-gray-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    <p className="font-medium leading-snug">{resetError.message}</p>
                    {resetError.type === "token" && (
                      <button
                        type="button"
                        onClick={() => {
                          setStep(2);
                          setOtp(["", "", "", "", "", ""]);
                          setResetError(null);
                          setPassword("");
                          setConfirmPassword("");
                          setTimeout(() => inputRefs.current[0]?.focus(), 100);
                        }}
                        className="mt-2 text-[11px] underline hover:no-underline transition-all"
                      >
                        ← Go back and enter a new code
                      </button>
                    )}
                    {resetError.type === "network" && (
                      <button
                        type="button"
                        onClick={() => resetMutation.mutate({ token: otp.join(""), password })}
                        disabled={resetMutation.isPending}
                        className="mt-2 text-[11px] underline hover:no-underline transition-all disabled:opacity-50"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetMutation.isPending ? (
                    <span className="flex items-center">
                      <Spinner />
                      Resetting password...
                    </span>
                  ) : (
                    "Reset password"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setPasswordError("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to verification code
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ForgotPassword;
