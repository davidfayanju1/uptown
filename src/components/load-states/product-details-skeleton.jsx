import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Skeleton Loader Component with Brand Overlay
export const ProductDetailsSkeleton = () => {
  const [showLogo, setShowLogo] = useState(true);

  // Loop the logo visibility
  useEffect(() => {
    const interval = setInterval(() => {
      setShowLogo((prev) => !prev);
    }, 2000); // Change every 2 seconds for smooth fade transition

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-7xl mt-[5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Brand Overlay */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex items-center justify-center">
        <motion.div
          animate={{
            opacity: showLogo ? 1 : 0,
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="flex items-center justify-center"
        >
          <img
            src="/brand_logo.png"
            alt="Brand Logo"
            className="w-32 h-32 object-contain md:w-48 md:h-48"
          />
        </motion.div>
      </div>

      {/* Skeleton Content (blurred behind overlay) */}
      <div className="opacity-30 blur-sm">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2">
            <div className="sticky top-4">
              <div className="mb-4 h-96 sm:h-[500px] bg-gray-200 animate-pulse" />
              <div className="flex gap-4 mt-4">
                {[1, 2, 3, 4].map((_, index) => (
                  <div
                    key={index}
                    className="h-20 w-20 bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 space-y-6">
            <div className="h-8 bg-gray-200 w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-200 w-1/4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 w-full animate-pulse" />
              <div className="h-4 bg-gray-200 w-2/3 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 w-1/6 animate-pulse" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((_, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <div key={index} className="h-12 bg-gray-200 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="h-12 bg-gray-200 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((_, index) => (
                  <div
                    key={index}
                    className="h-4 bg-gray-200 rounded w-full animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mt-[5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-yellow-700 mb-4">
          Product Not Found
        </h2>
        <p className="text-yellow-600 mb-4">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-yellow-600 text-white px-6 py-2 hover:bg-yellow-700 transition-colors"
        >
          Browse Products
        </button>
      </div>
    </div>
  );
};
