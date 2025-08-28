import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiArrowRight,
  FiCheck,
  FiLock,
  FiX,
  FiSearch,
  FiCheckCircle,
  FiArrowLeft, // Added for the back button
} from "react-icons/fi";

const Registry = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showSerialInput, setShowSerialInput] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const videoRef = useRef(null);
  const inputRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSerialButtonClick = () => {
    setShowSerialInput(true);
    // Focus on input after a small delay to allow for animation
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 400);
  };

  const handleVerifySerial = () => {
    if (!serialNumber.trim()) return;

    setIsVerifying(true);

    // Simulate API verification call
    setTimeout(() => {
      setIsVerifying(false);
      // Randomly determine if serial is valid for demo purposes
      const isValid = Math.random() > 0.3;
      setVerificationResult(isValid);

      // Reset after 5 seconds
      setTimeout(() => {
        setVerificationResult(null);
        if (isValid) {
          setShowSerialInput(false);
          setSerialNumber("");
        }
      }, 5000);
    }, 2000);
  };

  const closeSerialInput = () => {
    setShowSerialInput(false);
    setSerialNumber("");
    setVerificationResult(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleVerifySerial();
    }
  };

  // Function to handle back button click - you'll likely want to
  // integrate this with your routing solution (e.g., react-router-dom's useNavigate)
  const handleGoBack = () => {
    console.log("Go back clicked!");
    // Example with window.history (for basic browser navigation)
    window.history.back();
  };

  const benefits = [
    {
      title: "Exclusive Access",
      description:
        "Early access to limited edition collections and collaborations",
    },
    {
      title: "Personalized Service",
      description:
        "Dedicated style consultants and personal shopping assistance",
    },
    {
      title: "Members-only Events",
      description:
        "Invitations to fashion shows, previews, and exclusive gatherings",
    },
    {
      title: "Priority Alterations",
      description: "Complimentary tailoring and expedited alteration services",
    },
  ];

  return (
    <div className="registry-page">
      {/* Hero Video Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/images/video2.mov" type="video/webm" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleGoBack}
          className="absolute top-6 left-6 z-20 text-white bg-black/30 backdrop-blur-sm rounded-full p-3 hover:bg-black/50 transition-all"
          aria-label="Go back"
        >
          <FiArrowLeft size={20} />
        </motion.button>

        {/* Logo Placement */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-[-2.5rem] md:top-[-5rem] right-0 z-20"
        >
          {/* Replace this with your actual logo image */}
          <img
            src="/images/companylogo.png" // Update this path to your logo
            alt="Your Company Logo"
            className="h-[10rem] md:h-[15rem] object-contain" // Adjust height as needed
          />
        </motion.div>

        {/* Video Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex space-x-4">
          <button
            onClick={togglePlay}
            className="text-white bg-black/30 backdrop-blur-sm rounded-full p-3 hover:bg-black/50 transition-all"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
          </button>
          <button
            onClick={toggleMute}
            className="text-white bg-black/30 backdrop-blur-sm rounded-full p-3 hover:bg-black/50 transition-all"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-light mb-4 tracking-wide"
          >
            Registry
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl font-light max-w-2xl mx-auto mb-8"
          >
            Every Uptown Exclusive is Archived, Authenticated and Remembered
          </motion.p>

          {/* Animated Serial Input Container */}
          <motion.div
            className="flex justify-center items-center"
            layout // This enables layout animations
          >
            <AnimatePresence mode="wait">
              {!showSerialInput ? (
                <motion.button
                  key="serial-button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleSerialButtonClick}
                  className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-all flex items-center mx-auto"
                >
                  Enter Serial Number
                  <FiArrowRight className="ml-2" />
                </motion.button>
              ) : (
                <motion.div
                  key="serial-input"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center bg-white rounded-full pl-4 pr-2 py-2 shadow-lg"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter serial number"
                    className="outline-none bg-transparent text-black w-64 px-2 py-1"
                    aria-label="Serial number input"
                  />
                  <div className="flex items-center">
                    {serialNumber && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={closeSerialInput}
                        className="p-1 text-gray-500 hover:text-gray-700 mr-1"
                        aria-label="Clear serial number"
                      >
                        <FiX size={18} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleVerifySerial}
                      disabled={!serialNumber.trim()}
                      className={`p-2 rounded-full ${
                        !serialNumber.trim()
                          ? "bg-gray-300"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white transition-colors`}
                      aria-label="Verify serial number"
                    >
                      {isVerifying ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <FiSearch size={18} />
                        </motion.div>
                      ) : (
                        <FiArrowRight size={18} />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Verification Result */}
          <AnimatePresence>
            {verificationResult !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`mt-6 p-4 rounded-lg max-w-md mx-auto ${
                  verificationResult
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <div className="flex items-center justify-center">
                  {verificationResult ? (
                    <>
                      <FiCheckCircle className="mr-2" />
                      <span>Authentication Successful! Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <FiX className="mr-2" />
                      <span>Authentication Failed. Please try again.</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Registry;
