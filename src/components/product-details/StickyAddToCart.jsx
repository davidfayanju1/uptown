import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const StickyAddToCart = ({ visible, isAddingToCart, onAddToCart }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onAddToCart}
            disabled={isAddingToCart}
            className="w-full py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300"
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default StickyAddToCart;
