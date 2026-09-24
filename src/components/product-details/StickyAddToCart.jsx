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
        className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <button
            onClick={onAddToCart}
            disabled={isAddingToCart}
            className="w-full py-[1.25rem] bg-black text-white font-now text-[0.9125rem] font-bold uppercase tracking-[0.06em] hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default StickyAddToCart;
