import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiHome, FiSearch, FiMeh } from "react-icons/fi";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1.1, 1.1, 1],
              }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <FiAlertTriangle className="text-amber-500 w-24 h-24 mx-auto" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-4 -right-6 bg-red-500 text-white text-2xl font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
            >
              404
            </motion.span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
        >
          Well, this is awkward.
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-700 mb-8"
        >
          The page you're looking for seems to have ghosted us.
          <br />
          <span className="text-sm text-gray-500">
            (Unlike your ex, who still watches your Instagram stories)
          </span>
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center justify-center mb-4">
            <FiMeh className="w-8 h-8 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Possible reasons for this tragedy:
            </h2>
          </div>
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-red-400 mr-2">•</span>
              You've discovered a secret page that doesn't want to be found
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2">•</span>
              Our content went for a coffee break and never returned
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2">•</span>
              You've encountered a rare digital black hole
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2">•</span>
              The internet gremlins are at it again
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FiHome className="mr-2" />
            Take Me Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Go Back
          </button>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-700 bg-amber-100 hover:bg-amber-200 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FiSearch className="mr-2" />
            Try Again
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-sm text-gray-500"
        >
          <p>If you think this is a mistake, you can:</p>
          <div className="mt-2 flex justify-center space-x-4">
            <button className="text-blue-600 hover:text-blue-800 transition-colors">
              Contact Support
            </button>
            <span className="text-gray-300">•</span>
            <button className="text-blue-600 hover:text-blue-800 transition-colors">
              Report this issue
            </button>
            <span className="text-gray-300">•</span>
            <button className="text-blue-600 hover:text-blue-800 transition-colors">
              Pretend it never happened
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1 }}
          className="mt-12"
        >
          <p className="text-xs text-gray-400">
            Error code: 404 - Page Not Found | Because even websites have
            commitment issues
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
