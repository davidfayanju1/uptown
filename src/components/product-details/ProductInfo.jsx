import React, { useRef, useEffect, useState } from "react";
import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import StickyAddToCart from "./StickyAddToCart";
import ProductAccordion from "./ProductAccordion";

// Shown until the products API returns a per-product fit note. Delete this and
// the `??` fallback below once `modelFit` is populated server-side.
const MODEL_FIT_PLACEHOLDER = "Shira is 172cm and 57Kg wearing Size M";

const SUPPORT_EMAIL = "thenonamestudios@gmail.com";

// The catalogue carries no fit or care fields, so these two read the same on
// every piece until the API supplies them.
const SIZE_AND_FIT_GUIDE = (
  <>
    <p>
      Our pieces are cut to an oversized, relaxed fit. If you prefer a closer
      cut, we recommend sizing down.
    </p>
    <p>
      The model pictured wears the size noted above. Measurements are taken flat
      and may vary slightly between pieces.
    </p>
    <p>
      Unsure of your size? Message us before ordering and we will help you
      choose.
    </p>
  </>
);

const CARE_GUIDE = (
  <>
    <p>
      Machine wash cold on a gentle cycle with like colours. Do not bleach.
    </p>
    <p>
      Tumble dry low or hang to dry. Wash printed and embroidered pieces inside
      out to protect the finish.
    </p>
    <p>Warm iron on the reverse, avoiding any print or embroidery.</p>
  </>
);

const ProductInfo = ({
  product,
  currentPrice,
  selectedColor,
  selectedSize,
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
  const modelFitNote =
    product.modelFit ?? product.fitNote ?? MODEL_FIT_PLACEHOLDER;

  const [isSticky, setIsSticky] = useState(false);
  const addToCartRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        setIsSticky(rect.bottom < 0);
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

  const sections = [
    { id: "fit", title: "Size & Fit Guide", content: SIZE_AND_FIT_GUIDE },
    {
      id: "details",
      title: "Details",
      content: product.details?.length ? (
        <div dangerouslySetInnerHTML={{ __html: product.details }} />
      ) : null,
    },
    { id: "description", title: "Description", content: product.description },
    { id: "care", title: "Care", content: CARE_GUIDE },
  ];

  return (
    <div className="lg:w-1/2 w-full px-4 sm:px-6 lg:pr-60 lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:justify-center lg:overflow-y-auto self-start">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-now text-[1.0625rem] md:text-xl lg:text-2xl font-bold uppercase tracking-tight leading-tight text-gray-900">
          {product.name}
        </h1>
        <p className="font-now text-[1.0625rem] md:text-xl lg:text-2xl font-bold whitespace-nowrap text-[#8f7355]">
          {currentPrice}
        </p>
      </div>

      {modelFitNote && (
        <p className="font-now text-[0.9375rem] text-[#8f7355] mt-[0.625rem]">
          {modelFitNote}
        </p>
      )}

      <div ref={addToCartRef} className="mt-[1.5rem]">
        <button
          onClick={onAddToCart}
          disabled={isAddingToCart || !hasAnyAvailableVariant}
          className={`w-full py-[1.25rem] px-8 flex items-center justify-center font-now text-[0.9375rem] font-bold uppercase tracking-[0.06em] transition-all ${
            !isAddingToCart && hasAnyAvailableVariant
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isAddingToCart ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
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

      <p className="mt-[1.25rem] text-center font-now text-[0.9375rem] text-gray-500">
        Have a question about this piece?{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
            `Question about ${product.name}`,
          )}`}
          className="underline underline-offset-2 hover:text-gray-900 transition-colors"
        >
          Message us
        </a>
        .
      </p>

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

      <ProductAccordion sections={sections} />

      <StickyAddToCart
        visible={isSticky && hasAnyAvailableVariant}
        isAddingToCart={isAddingToCart}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default ProductInfo;
