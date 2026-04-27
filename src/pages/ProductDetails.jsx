// src/components/ProductDetails.js
import React, { useState, useEffect, useRef } from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { useCart } from "../hooks/useCart";

// Skeleton Loader Component
const ProductDetailsSkeleton = () => {
  return (
    <div className="max-w-7xl mt-[5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <div className="sticky top-4">
            <div className="mb-4 h-96 sm:h-[500px] bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex gap-4 mt-4">
              {[1, 2, 3, 4].map((_, index) => (
                <div
                  key={index}
                  className="h-20 w-20 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((_, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div
                  key={index}
                  className="h-12 bg-gray-200 rounded-md animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="h-12 bg-gray-200 rounded-md animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((_, index) => (
                <div
                  key={index}
                  className="h-4 bg-gray-200 rounded w-full animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  // const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);
  const navigate = useNavigate();
  const { addToCart, isAddingToCart } = useCart(); // Keep for local cart state if needed

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

  const productData = response?.data?.product;
  const variants = response?.data?.variants || [];

  const product = productData
    ? {
        id: productData.id,
        name: productData.title,
        description: productData.description,
        details: productData.details || [],
        variants: variants,
      }
    : null;

  const uniqueColors = variants
    ? [...new Map(variants.map((v) => [v.color, v.color])).values()]
    : [];

  const uniqueSizes = variants
    ? [...new Map(variants.map((v) => [v.size, v.size])).values()].sort()
    : [];

  const getSelectedVariant = () => {
    if (selectedColor && selectedSize) {
      return variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize,
      );
    }
    if (selectedColor) {
      return variants.find((v) => v.color === selectedColor);
    }
    if (selectedSize) {
      return variants.find((v) => v.size === selectedSize);
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

  // Build image list - ONLY from variants, NO product images
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

  // Current image logic - strictly from variants
  const getCurrentImage = () => {
    if (activeImage) return activeImage;
    if (selectedVariant?.images?.[0]) return selectedVariant.images[0];
    return allImages[0] || "/images/placeholder.png";
  };

  const currentImage = getCurrentImage();

  // const handleColorSelect = (color) => {
  //   setSelectedColor(color);
  //   // Find the variant for this color
  //   const variant = variants.find((v) => v.color === color);
  //   // Set the active image to this variant's first image
  //   if (variant?.images?.[0]) {
  //     setActiveImage(variant.images[0]);
  //   }
  // };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    // Find the variant for this size
    const variant = variants.find((v) => v.size === size);
    // Set the active image to this variant's first image
    if (variant?.images?.[0]) {
      setActiveImage(variant.images[0]);
    }
  };

  // Auto-select first color and size when data loads
  useEffect(() => {
    if (variants.length === 0) return;

    let color = selectedColor;
    let size = selectedSize;

    if (uniqueColors.length > 0 && !selectedColor) {
      color = uniqueColors[0];
      setSelectedColor(color);
    }
    if (uniqueSizes.length > 0 && !selectedSize) {
      size = uniqueSizes[0];
      setSelectedSize(size);
    }

    // Set initial active image from the first variant's first image
    if (!activeImage && variants[0]?.images?.[0]) {
      setActiveImage(variants[0].images[0]);
    }
  }, [variants]);

  // Clear cart message after 3 seconds
  useEffect(() => {
    if (cartMessage) {
      const timer = setTimeout(() => {
        setCartMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cartMessage]);

  // Add to cart using API endpoint
  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }

    addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
    });
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-red-700 mb-4">
              Error Loading Product
            </h2>
            <p className="text-red-600 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
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
        <div className="max-w-7xl mt-[5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-yellow-700 mb-4">
              Product Not Found
            </h2>
            <p className="text-yellow-600 mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </PrimaryLayout>
    );
  }

  const currentPrice = getCurrentPrice();
  const currency = getCurrency();
  const isVariantInStock = selectedVariant?.stock > 0;

  return (
    <PrimaryLayout>
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
                    className={`h-20 w-20 flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ${
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

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div className="md:mt-8 mt-5">
                <h2 className="text-sm font-medium text-gray-900">Colors</h2>
                <div className="flex mt-2 flex-wrap gap-3">
                  {uniqueColors.map((color) => {
                    const variant = variants.find((v) => v.color === color);
                    const isSelected = selectedColor === color;
                    const isOutOfStock = variant?.stock === 0;

                    return (
                      <div key={color} className="relative">
                        <button
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all  ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${
                            isSelected ? "" : ""
                          }`}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={isOutOfStock ? "Out of stock" : color}
                        />
                        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                          {color}
                          {isOutOfStock && " (Sold Out)"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {uniqueSizes.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900">Size</h2>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {uniqueSizes.map((size) => {
                    const variant = variants.find((v) => v.size === size);
                    const isSelected = selectedSize === size;
                    const isOutOfStock = variant?.stock === 0;

                    return (
                      <button
                        key={size}
                        className={`border py-3 px-4 text-sm font-normal transition-all ${
                          isSelected
                            ? "border-black bg-transparent text-black"
                            : isOutOfStock
                              ? "border-gray-200 text-gray-400 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-400"
                        }`}
                        onClick={() => !isOutOfStock && handleSizeSelect(size)}
                        disabled={isOutOfStock}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart Button with loading state */}
            <button
              onClick={handleAddToCart}
              // disabled={!isVariantInStock || isAddingToCart}
              className={`mt-10 w-full py-3 px-8 flex items-center justify-center text-[15px] font-normal transition-all ${
                isVariantInStock && !isAddingToCart
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
              ) : isVariantInStock ? (
                "Add to Cart"
              ) : (
                "Out of Stock"
              )}
            </button>

            {/* Cart Message */}
            {cartMessage && (
              <div
                className={`mt-4 p-3 text-sm text-center ${
                  cartMessage.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {cartMessage.text}
              </div>
            )}

            {/* Product Details */}
            {product.details && product.details.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900">Details</h2>
                <div
                  className="mt-4 text-gray-600 prose prose-sm"
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
                <p className="text-sm text-gray-500 mt-1">
                  Stock: {selectedVariant.stock} units available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default ProductDetails;
