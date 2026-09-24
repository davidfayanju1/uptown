import React, { useRef, useEffect, useState } from "react";
import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import StickyAddToCart from "./StickyAddToCart";
import ProductAccordion from "./ProductAccordion";
import SizeGuideModal from "./SizeGuideModal";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";

// Shown until the products API returns a per-product fit note. Delete this and
// the `??` fallback below once `modelFit` is populated server-side.
const MODEL_FIT_PLACEHOLDER = "Shira is 172cm and 57Kg wearing Size M";

const SUPPORT_EMAIL = "thenonamestudios@gmail.com";

// Saved pieces live in the browser until a wishlist API exists. Swap the two
// helpers below for API calls and the button keeps working unchanged.
const WISHLIST_STORAGE_KEY = "uptown:wishlist";

const readWishlist = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const writeWishlist = (ids) => {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Private browsing or blocked storage — the toggle still updates visually.
  }
};

// The catalogue carries no fit or care fields, so these read the same on every
// piece until the API supplies them.
const FIT_NOTE =
  "Slightly cropped boxy shape, it\u2019s recommended you get your actual size.";

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

  const productId = product.id ?? product._id;
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(productId ? readWishlist().includes(productId) : false);
  }, [productId]);

  const toggleSaved = () => {
    if (!productId) return;
    const next = !isSaved;
    const remaining = readWishlist().filter((id) => id !== productId);
    writeWishlist(next ? [...remaining, productId] : remaining);
    setIsSaved(next);
  };

  const [isSticky, setIsSticky] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const addToCartRef = useRef(null);

  // Pin the bar whenever the inline button is off-screen — including on first
  // paint, before any scrolling. An observer (rather than a scroll listener)
  // also re-fires when images finish loading and shift the layout, which is
  // what left the bar stuck hidden on browsers that never emitted a scroll.
  useEffect(() => {
    const target = addToCartRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      id: "fit",
      title: "Size & Fit Guide",
      onOpen: () => setShowSizeGuide(true),
    },
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
        <p className="font-now text-[1.3125rem] lg:text-2xl font-bold whitespace-nowrap text-[#8f7355]">
          {currentPrice}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 mt-[0.625rem]">
        {modelFitNote ? (
          <p className="font-now text-[0.6875rem] text-[#8f7355]">
            {modelFitNote}
          </p>
        ) : (
          <span aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={toggleSaved}
          aria-pressed={isSaved}
          aria-label={isSaved ? "Remove from wishlist" : "Save for later"}
          title={isSaved ? "Remove from wishlist" : "Save for later"}
          className="shrink-0 -mr-1 p-1 text-gray-900 transition-colors hover:text-[#8f7355]"
        >
          {isSaved ? (
            <IoBookmark className="h-5 w-5" />
          ) : (
            <IoBookmarkOutline className="h-5 w-5" />
          )}
        </button>
      </div>

      <div ref={addToCartRef} className="mt-[1.5rem]">
        <button
          onClick={onAddToCart}
          disabled={isAddingToCart || !hasAnyAvailableVariant}
          className={`w-full py-[1.25rem] px-8 flex items-center justify-center font-now text-[0.9125rem] font-bold uppercase tracking-[0.06em] transition-all ${
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

      {showSizeGuide && (
        <SizeGuideModal
          onClose={() => setShowSizeGuide(false)}
          modelFitNote={modelFitNote}
          fitNote={FIT_NOTE}
          measurements={product.measurements}
          diagramImage={product.measurementImage}
        />
      )}
    </div>
  );
};

export default ProductInfo;
