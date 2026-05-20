// src/components/ProductDetails.js
import React, { useState, useEffect, useRef } from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { useCart } from "../hooks/useCart";
import { motion, AnimatePresence } from "framer-motion";
import { IoCheckmarkCircle, IoClose } from "react-icons/io5";
import {
  ProductDetailsSkeleton,
  ProductNotFound,
} from "../components/load-states/product-details-skeleton";

const ProductDetails = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { addToCart, isAddingToCart } = useCart();
  const addToCartRef = useRef(null);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await api.get(`/v1/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch all products for similar items
  const { data: allProductsResponse } = useQuery({
    queryKey: ["allProducts"],
    queryFn: async () => {
      const response = await api.get("/v1/products");
      return response.data;
    },
  });

  const productData = response?.data?.product;
  const variants = response?.data?.variants || [];

  const product = productData
    ? {
        id: productData.id,
        name: productData.title,
        description: productData.description,
        details: productData.details || [],
        variants: variants,
        category: productData.category,
      }
    : null;

  // Transform similar products
  const similarProducts = React.useMemo(() => {
    if (!allProductsResponse?.data?.products) return [];

    const allProducts = allProductsResponse.data.products;

    return allProducts
      .filter((p) => p.id !== product?.id)
      .slice(0, 4)
      .map((p) => {
        const productVariants = p.variants || [];
        const lowestPrice = productVariants.reduce(
          (min, v) => (v.price_cents < min ? v.price_cents : min),
          Infinity,
        );
        const priceInDollars =
          lowestPrice !== Infinity ? (lowestPrice / 100).toFixed(2) : "0.00";
        const currency = productVariants[0]?.currency === "GBP" ? "£" : "$";
        const productImage =
          productVariants[0]?.images?.[0] || "/images/placeholder.png";
        const hasStock = productVariants.some((v) => v.stock > 0);

        return {
          id: p.id,
          name: p.title,
          price: `${currency}${priceInDollars}`,
          image: productImage,
          available: hasStock,
        };
      });
  }, [allProductsResponse, product?.id]);

  const uniqueColors = variants
    ? [...new Map(variants.map((v) => [v.color, v.color])).values()]
    : [];

  const uniqueSizes = variants
    ? [...new Map(variants.map((v) => [v.size, v.size])).values()].sort()
    : [];

  // Helper function to check if a color has ANY available variant
  const isColorAvailable = (color) => {
    return variants.some((v) => v.color === color && v.stock > 0);
  };

  // Helper function to check if a size has ANY available variant
  const isSizeAvailable = (size) => {
    return variants.some((v) => v.size === size && v.stock > 0);
  };

  // Helper function to check if a specific color+size combination is available
  const isVariantAvailable = (color, size) => {
    if (!color || !size) return true; // Not selected yet
    const variant = variants.find((v) => v.color === color && v.size === size);
    return variant?.stock > 0;
  };

  const getSelectedVariant = () => {
    if (selectedColor && selectedSize) {
      return variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize,
      );
    }
    if (selectedColor) {
      // When only color is selected, return first available variant with that color
      return variants.find((v) => v.color === selectedColor && v.stock > 0);
    }
    if (selectedSize) {
      // When only size is selected, return first available variant with that size
      return variants.find((v) => v.size === selectedSize && v.stock > 0);
    }
    return variants[0];
  };

  const selectedVariant = getSelectedVariant();

  const getCurrentPrice = () => {
    if (selectedVariant) return (selectedVariant.price_cents / 100).toFixed(2);
    if (variants.length > 0) return (variants[0].price_cents / 100).toFixed(2);
    return "0.00";
  };

  const getCurrency = () => {
    if (selectedVariant) return selectedVariant.currency;
    if (variants.length > 0) return variants[0].currency;
    return "USD";
  };

  const getAllImages = () => {
    const variantImages = variants.flatMap((v) => v.images || []);
    const seen = new Set();
    return variantImages.filter((img) => {
      if (!img || seen.has(img)) return false;
      seen.add(img);
      return true;
    });
  };

  const allImages = getAllImages();

  const getCurrentImage = () => {
    if (activeImage) return activeImage;
    if (selectedVariant?.images?.[0]) return selectedVariant.images[0];
    return allImages[0] || "/images/placeholder.png";
  };

  const currentImage = getCurrentImage();

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // Reset active image to the first variant image of selected color
    const variantWithColor = variants.find((v) => v.color === color);
    if (variantWithColor?.images?.[0]) {
      setActiveImage(variantWithColor.images[0]);
    }
    // Clear selected size if the combination isn't available
    if (selectedSize && !isVariantAvailable(color, selectedSize)) {
      setSelectedSize(null);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    // Find variant with matching size
    const variant = variants.find((v) => v.size === size);
    if (variant?.images?.[0]) {
      setActiveImage(variant.images[0]);
    }
    // Clear selected color if the combination isn't available
    if (selectedColor && !isVariantAvailable(selectedColor, size)) {
      setSelectedColor(null);
    }
  };

  // Sticky button detection
  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        setIsSticky(rect.bottom > viewportHeight);
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

  // Auto-select first available color and size when data loads
  useEffect(() => {
    if (variants.length === 0) return;

    // Find first available color (with stock)
    let firstAvailableColor = null;
    for (const color of uniqueColors) {
      if (isColorAvailable(color)) {
        firstAvailableColor = color;
        break;
      }
    }

    // Find first available size (with stock)
    let firstAvailableSize = null;
    for (const size of uniqueSizes) {
      if (isSizeAvailable(size)) {
        firstAvailableSize = size;
        break;
      }
    }

    if (firstAvailableColor && !selectedColor) {
      setSelectedColor(firstAvailableColor);
    }
    if (firstAvailableSize && !selectedSize) {
      setSelectedSize(firstAvailableSize);
    }

    if (!activeImage && variants[0]?.images?.[0]) {
      setActiveImage(variants[0].images[0]);
    }
  }, [variants]);

  useEffect(() => {
    if (showSuccessNotification) {
      const timer = setTimeout(() => {
        setShowSuccessNotification(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessNotification]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Please select a size and color");
      return;
    }

    if (selectedVariant.stock <= 0) {
      alert("This variant is out of stock");
      return;
    }

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
      });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (isLoading) {
    return (
      <PrimaryLayout>
        <ProductDetailsSkeleton />
      </PrimaryLayout>
    );
  }

  if (error) {
    return (
      <PrimaryLayout>
        <div className="max-w-7xl mt-[5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="bg-red-50 border border-red-200 p-8">
            <h2 className="text-2xl font-semibold text-red-700 mb-4">
              Error Loading Product
            </h2>
            <p className="text-red-600 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-6 py-2 hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </PrimaryLayout>
    );
  }

  if (!product) {
    return (
      <PrimaryLayout>
        <ProductNotFound />
      </PrimaryLayout>
    );
  }

  const currentPrice = getCurrentPrice();
  const currency = getCurrency();
  const isVariantInStock = selectedVariant?.stock > 0;

  return (
    <PrimaryLayout>
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccessNotification && (
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
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
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
                    onClick={() => setShowSuccessNotification(false)}
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
                      alt={product.name}
                      className="w-20 h-20 object-cover border border-gray-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate mb-1">
                      {product.name}
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                      {selectedColor && (
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{
                              backgroundColor: selectedColor.toLowerCase(),
                            }}
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
                      {currency === "GBP" ? "£" : "$"}
                      {currentPrice}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => {
                      setShowSuccessNotification(false);
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

      <div className="max-w-7xl md:mt-[5rem] mt-[4rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-start md:gap-8 gap-0">
          {/* LEFT COLUMN - Image Gallery */}
          <div className="lg:w-1/2 w-full lg:sticky lg:top-[5.5rem] self-start">
            <div className="mb-4 h-96 sm:h-[500px] overflow-hidden bg-gray-100">
              <img
                key={currentImage}
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <div
                    key={index}
                    className={`h-20 w-20 flex-shrink-0 cursor-pointer border-2 overflow-hidden transition-all duration-200 ${
                      currentImage === img ? "border-black" : "border-gray-200"
                    }`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — product details */}
          <div className="lg:w-1/2">
            <h1 className="md:text-3xl leading-[22px] text-xl font-bold text-gray-900">
              {product.name}
            </h1>
            <p className="md:text-2xl text-lg font-semibold text-gray-900 mt-2">
              {currency === "GBP" ? "£" : "$"}
              {currentPrice}
            </p>

            <div className="md:mt-6 mt-3">
              <h2 className="text-sm font-[500] text-gray-900">Description</h2>
              <p className="text-[13px] text-gray-500">{product.description}</p>
            </div>

            {/* Color Selection - FIXED */}
            {uniqueColors.length > 0 && (
              <div className="md:mt-8 mt-5">
                <h2 className="text-sm font-medium text-gray-900">Colors</h2>
                <div className="flex mt-2 flex-wrap gap-3">
                  {uniqueColors.map((color) => {
                    const isAvailable = isColorAvailable(color);
                    const isSelected = selectedColor === color;

                    return (
                      <div key={color} className="relative">
                        <button
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            !isAvailable
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:scale-110"
                          }`}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={!isAvailable ? "Out of stock" : color}
                          onClick={() =>
                            isAvailable && handleColorSelect(color)
                          }
                          disabled={!isAvailable}
                        />
                        {isSelected && (
                          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-black whitespace-nowrap">
                            Selected
                          </span>
                        )}
                        {!isAvailable && (
                          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] text-red-500 whitespace-nowrap">
                            Out of stock
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection - FIXED */}
            {uniqueSizes[0] !== "" && uniqueSizes.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900">Size</h2>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {uniqueSizes.map((size) => {
                    const isAvailable = isSizeAvailable(size);
                    const isSelected = selectedSize === size;
                    // Check if combination is available when both are selected
                    const combinationUnavailable =
                      selectedColor && !isVariantAvailable(selectedColor, size);

                    return (
                      <button
                        key={size}
                        className={`border py-3 px-4 text-sm font-normal transition-all ${
                          isSelected
                            ? "border-black bg-transparent text-black"
                            : !isAvailable || combinationUnavailable
                              ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                              : "border-gray-200 hover:border-gray-400"
                        }`}
                        onClick={() =>
                          isAvailable &&
                          !combinationUnavailable &&
                          handleSizeSelect(size)
                        }
                        disabled={!isAvailable || combinationUnavailable}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div ref={addToCartRef}>
              <button
                onClick={handleAddToCart}
                disabled={
                  !isVariantInStock || isAddingToCart || !selectedVariant
                }
                className={`mt-10 w-full py-3 px-8 flex items-center justify-center text-[15px] font-normal transition-all ${
                  isVariantInStock && !isAddingToCart && selectedVariant
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </>
                ) : !selectedVariant ? (
                  "Select Size & Color"
                ) : isVariantInStock ? (
                  "Add to Cart"
                ) : (
                  "Out of Stock"
                )}
              </button>
            </div>

            {/* Sticky Add to Cart Button */}
            <AnimatePresence>
              {isSticky && isVariantInStock && selectedVariant && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
                >
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="w-full py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300"
                    >
                      {isAddingToCart ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Details */}
            {product.details && product.details.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900">Details</h2>
                <div
                  className="md:mt-4 mt-1 text-[13px] text-gray-500"
                  dangerouslySetInnerHTML={{ __html: product.details }}
                />
              </div>
            )}

            {/* Variant Info */}
            {selectedVariant && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  SKU: {selectedVariant.sku}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SIMILAR PRODUCTS SECTION */}
        {similarProducts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-light tracking-tight mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/80 px-2 py-1">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PrimaryLayout>
  );
};

export default ProductDetails;
