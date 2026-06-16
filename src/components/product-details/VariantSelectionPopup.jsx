import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

const VariantSelectionPopup = ({
  show,
  onClose,
  currentImage,
  productName,
  currentPrice,
  needsColor,
  needsSize,
  colors,
  sizes,
  selectedColor,
  selectedSize,
  isColorAvailable,
  isSizeAvailable,
  isVariantAvailable,
  onColorSelect,
  onSizeSelect,
  onAddToCart,
  isAddingToCart,
  selectedVariant,
}) => (
  <AnimatePresence>
    {show && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[90]"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[95] bg-white md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-md"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium">Select Options</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <IoClose size={22} />
              </button>
            </div>

            <div className="flex gap-3 mb-5 pb-5 border-b border-gray-100">
              <img
                src={currentImage}
                alt={productName}
                className="w-14 h-14 object-cover flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{productName}</p>
                <p className="text-sm text-gray-600 mt-0.5">{currentPrice}</p>
              </div>
            </div>

            {needsColor && (
              <div className="mb-5">
                <h3 className="text-sm font-medium mb-2">
                  Color
                  {selectedColor && (
                    <span className="text-gray-500 font-normal ml-1">
                      — {selectedColor}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => {
                    const isAvailable = isColorAvailable(color);
                    const isSelected = selectedColor === color;
                    return (
                      <div key={color} className="relative">
                        <button
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative ${
                            isSelected ? "ring-2 ring-black ring-offset-2" : ""
                          } ${
                            !isAvailable
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:scale-110"
                          }`}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={!isAvailable ? "Out of stock" : color}
                          onClick={() => isAvailable && onColorSelect(color)}
                          disabled={!isAvailable}
                        >
                          {!isAvailable && (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="absolute inset-0 w-full h-full"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="11"
                                stroke="#ef4444"
                                strokeWidth="2"
                                fill="none"
                              />
                              <line
                                x1="4.5"
                                y1="19.5"
                                x2="19.5"
                                y2="4.5"
                                stroke="#ef4444"
                                strokeWidth="2"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {needsSize && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">
                  Size
                  {selectedSize && (
                    <span className="text-gray-500 font-normal ml-1">
                      — {selectedSize}
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {sizes.map((size) => {
                    const isAvailable = isSizeAvailable(size);
                    const isSelected = selectedSize === size;
                    const combinationUnavailable =
                      selectedColor && !isVariantAvailable(selectedColor, size);
                    return (
                      <button
                        key={size}
                        className={`border py-2.5 text-sm font-normal transition-all ${
                          isSelected
                            ? "border-black bg-transparent text-black"
                            : !isAvailable || combinationUnavailable
                              ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                              : "border-gray-200 hover:border-gray-400"
                        }`}
                        onClick={() =>
                          isAvailable &&
                          !combinationUnavailable &&
                          onSizeSelect(size)
                        }
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={onAddToCart}
              disabled={
                isAddingToCart ||
                (needsColor && !selectedColor) ||
                (needsSize && !selectedSize) ||
                !selectedVariant ||
                selectedVariant?.stock <= 0
              }
              className={`w-full py-3 text-sm font-normal transition-all ${
                !isAddingToCart &&
                (!needsColor || selectedColor) &&
                (!needsSize || selectedSize) &&
                selectedVariant?.stock > 0
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding...
                </span>
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default VariantSelectionPopup;
