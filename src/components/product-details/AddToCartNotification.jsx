import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCheckmarkCircle, IoClose } from "react-icons/io5";

const AddToCartNotification = ({
  show,
  onClose,
  currentImage,
  productName,
  selectedColor,
  selectedSize,
  currentPrice,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] md:w-[90%] w-[97%] max-w-md"
      >
        <div className="bg-white shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-black px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <IoCheckmarkCircle className="text-white" size={28} />
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold text-base">
                    Added to Cart
                  </h3>
                  <p className="text-emerald-50 text-xs">
                    Item successfully added
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-emerald-100 transition-colors"
              >
                <IoClose size={22} />
              </button>
            </div>
          </div>

          <div className="p-5 bg-white">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img
                  src={currentImage}
                  alt={productName}
                  className="w-20 h-20 object-cover border border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate mb-1">
                  {productName}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                  {selectedColor && (
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: selectedColor.toLowerCase() }}
                      />
                      {selectedColor}
                    </span>
                  )}
                  {selectedSize && (
                    <span className="px-2 py-0.5 bg-gray-100">
                      Size: {selectedSize}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {currentPrice}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/product";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  window.location.href = "/cart";
                }}
                className="flex-1 px-4 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                View Cart
              </button>
            </div>
          </div>

          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4, ease: "linear" }}
            className="h-1 bg-black origin-left"
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default AddToCartNotification;
