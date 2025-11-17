import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCheckmark from "./AnimatedCheckmarkToast";

const AnimatedCheckmarkToast = ({
  message = "Success!",
  isVisible,
  onClose,
  duration = 3000,
}) => {
  const [show, setShow] = useState(false);
  const [checkmarkComplete, setCheckmarkComplete] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setCheckmarkComplete(false);
    }
  }, [isVisible]);

  const handleCheckmarkComplete = () => {
    setCheckmarkComplete(true);
    // Start countdown to close after checkmark animation completes
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onClose(), 500); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-white border border-green-200 rounded-lg shadow-xl p-6 max-w-sm"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <div className="flex items-center space-x-4">
            {/* Animated Checkmark */}
            <div className="flex-shrink-0">
              <AnimatedCheckmark
                size={40}
                color="#10B981"
                strokeWidth={3}
                onAnimationComplete={handleCheckmarkComplete}
              />
            </div>

            {/* Message */}
            <div className="flex-1">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: checkmarkComplete ? 1 : 0,
                  y: checkmarkComplete ? 0 : 10,
                }}
                transition={{ delay: 1.5, duration: 0.3 }}
                className="text-sm font-medium text-gray-900"
              >
                {message}
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedCheckmarkToast;
