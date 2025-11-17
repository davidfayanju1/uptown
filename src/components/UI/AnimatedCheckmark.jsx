import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const AnimatedCheckmark = ({
  size = 80,
  color = "#10B981",
  strokeWidth = 4,
  onAnimationComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start the animation after a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => {
      const delay = 0.5 + i * 0.5;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: {
            delay,
            type: "spring",
            duration: 0.8,
            bounce: 0,
          },
          opacity: {
            delay,
            duration: 0.01,
          },
        },
      };
    },
  };

  const circleDraw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          delay: 0,
          type: "spring",
          duration: 0.8,
          bounce: 0,
        },
        opacity: {
          delay: 0,
          duration: 0.01,
        },
      },
    },
  };

  return (
    <div className="flex items-center justify-center">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        onAnimationComplete={onAnimationComplete}
      >
        {/* Circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          variants={circleDraw}
        />

        {/* Checkmark */}
        <motion.path
          d="M30,50 L45,65 L70,35"
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={draw}
          custom={1}
        />
      </motion.svg>
    </div>
  );
};

export default AnimatedCheckmark;
