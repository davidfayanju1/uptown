import React, { useState, useRef, useEffect } from "react";
import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import StickyAddToCart from "./StickyAddToCart";

const ProductInfo = ({
  product,
  currentPrice,
  selectedColor,
  selectedSize,
  selectedVariant,
  uniqueColors,
  uniqueSizes,
  isColorAvailable,
  isSizeAvailable,
  isVariantAvailable,
  needsColor,
  needsSize,
  hasAnyAvailableVariant,
  isAddingToCart,
  onColorSelect,
  onSizeSelect,
  onAddToCart,
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const addToCartRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        setIsSticky(rect.bottom > window.innerHeight);
      }
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="lg:w-1/2 w-full px-4 sm:px-6 lg:pr-60 lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:justify-center lg:overflow-y-auto self-start">
      <div className="flex items-start justify-between gap-4">
        <h1 className="md:text-2xl text-xl font-semibold uppercase tracking-tight leading-tight text-gray-900">
          {product.name}
        </h1>
        <p className="md:text-2xl text-lg font-semibold whitespace-nowrap text-[#8f7355]">
          {currentPrice}
        </p>
      </div>
      {selectedVariant && (
        <p className="text-sm font-medium uppercase tracking-wide text-gray-400 mt-1">
          SKU: {selectedVariant.sku}
        </p>
      )}

      <div className="md:mt-6 mt-3">
        <h2 className="text-sm font-[500] text-gray-900">Description</h2>
        <p className="text-[13px] md:w-[90%] text-justify text-gray-500">
          {product.description}
        </p>
      </div>

      <ColorSelector
        colors={uniqueColors}
        selectedColor={selectedColor}
        isColorAvailable={isColorAvailable}
        onSelect={onColorSelect}
      />

      <SizeSelector
        sizes={uniqueSizes}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        isSizeAvailable={isSizeAvailable}
        isVariantAvailable={isVariantAvailable}
        onSelect={onSizeSelect}
      />

      <div ref={addToCartRef}>
        <button
          onClick={onAddToCart}
          disabled={isAddingToCart || !hasAnyAvailableVariant}
          className={`mt-10 md:w-[90%] py-3 px-8 flex items-center justify-center text-[15px] font-normal transition-all ${
            !isAddingToCart && hasAnyAvailableVariant
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isAddingToCart ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            </>
          ) : hasAnyAvailableVariant ? (
            "Add to Cart"
          ) : (
            "Out of Stock"
          )}
        </button>
      </div>

      <StickyAddToCart
        visible={isSticky && hasAnyAvailableVariant}
        isAddingToCart={isAddingToCart}
        onAddToCart={onAddToCart}
      />

      {product.details && product.details.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-medium text-gray-900">Details</h2>
          <div
            className={`md:mt-4 mt-1 text-[13px] text-gray-500 leading-relaxed text-justify [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1 overflow-hidden transition-all duration-300 ${
              detailsExpanded ? "max-h-[1000px]" : "max-h-[110px]"
            }`}
            dangerouslySetInnerHTML={{ __html: product.details }}
          />
          <button
            onClick={() => setDetailsExpanded((prev) => !prev)}
            className="mt-2 text-[13px] text-gray-900 underline hover:no-underline transition-all"
          >
            {detailsExpanded ? "See Less" : "See More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
