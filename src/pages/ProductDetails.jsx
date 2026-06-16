import { useState, useEffect, useMemo } from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { useCart } from "../hooks/useCart";
import {
  ProductDetailsSkeleton,
  ProductNotFound,
} from "../components/load-states/product-details-skeleton";
import ImageLoader from "../components/load-states/image-center-loader";
import { formatCurrency, getPriceRange } from "../utils/currency";
import ProductImageGallery from "../components/product-details/ProductImageGallery";
import ProductInfo from "../components/product-details/ProductInfo";
import AddToCartNotification from "../components/product-details/AddToCartNotification";
import VariantSelectionPopup from "../components/product-details/VariantSelectionPopup";
import SimilarProducts from "../components/product-details/SimilarProducts";

const ProductDetails = () => {
  const { id } = useParams();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showVariantPopup, setShowVariantPopup] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const { addToCart, isAddingToCart } = useCart();

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/v1/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: allProductsResponse } = useQuery({
    queryKey: ["allProducts"],
    queryFn: async () => {
      const res = await api.get("/v1/products");
      return res.data;
    },
  });

  useEffect(() => {
    setSelectedColor(null);
    setSelectedSize(null);
    setShowSuccessNotification(false);
    setCurrentSlideIndex(0);
  }, [id]);

  useEffect(() => {
    if (showSuccessNotification) {
      const timer = setTimeout(() => setShowSuccessNotification(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessNotification]);

  const productData = response?.data?.product;
  const variants = response?.data?.variants || [];

  const product = productData
    ? {
        id: productData.id,
        name: productData.title,
        description: productData.description,
        details: productData.details || [],
        variants,
        category: productData.category,
      }
    : null;

  const similarProducts = useMemo(() => {
    if (!allProductsResponse?.data) return [];
    return allProductsResponse.data
      .filter((p) => p.id !== product?.id)
      .slice(0, 4)
      .map((p) => {
        const productVariants = p.variants || [];
        return {
          id: p.id,
          name: p.title,
          price: getPriceRange(productVariants),
          image: productVariants[0]?.images?.[0] || "/images/placeholder.png",
          available: productVariants.some((v) => v.stock > 0),
        };
      });
  }, [allProductsResponse, product?.id]);

  const uniqueColors = variants.length
    ? [...new Map(variants.map((v) => [v.color.trim(), v.color.trim()])).values()]
    : [];

  const uniqueSizes = variants.length
    ? [...new Map(variants.map((v) => [v.size, v.size])).values()].sort()
    : [];

  const isColorAvailable = (color) =>
    variants.some((v) => v.color === color && v.stock > 0);

  const isSizeAvailable = (size) =>
    variants.some((v) => v.size === size && v.stock > 0);

  const isVariantAvailable = (color, size) => {
    if (!color || !size) return true;
    const variant = variants.find(
      (v) => v.color.trim() === color.trim() && v.size.trim() === size.trim(),
    );
    return variant?.stock > 0;
  };

  const getSelectedVariant = () => {
    if (selectedColor && selectedSize)
      return variants.find(
        (v) =>
          v.color.trim() === selectedColor.trim() &&
          v.size.trim() === selectedSize.trim(),
      );
    if (selectedColor)
      return variants.find(
        (v) => v.color.trim() === selectedColor.trim() && v.stock > 0,
      );
    if (selectedSize)
      return variants.find(
        (v) => v.size.trim() === selectedSize.trim() && v.stock > 0,
      );
    return variants[0];
  };

  const selectedVariant = getSelectedVariant();

  const getCurrentPrice = () => {
    if (selectedVariant)
      return formatCurrency(selectedVariant.price_cents, selectedVariant.currency);
    if (variants.length > 0)
      return formatCurrency(variants[0].price_cents, variants[0].currency);
    return "₦0.00";
  };

  const getAllImages = () => {
    const seen = new Set();
    return variants
      .flatMap((v) => v.images || [])
      .filter((img) => {
        if (!img || seen.has(img)) return false;
        seen.add(img);
        return true;
      });
  };

  const allImages = getAllImages();
  const currentPrice = getCurrentPrice();
  const currentImage = allImages[currentSlideIndex] || "/images/placeholder.png";

  const needsColor = uniqueColors.length > 0;
  const needsSize = uniqueSizes[0] !== "" && uniqueSizes.length > 0;
  const hasAnyAvailableVariant = variants.some((v) => v.stock > 0);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const variantWithColor = variants.find(
      (v) => v.color === color && v.images?.length > 0,
    );
    if (variantWithColor?.images?.[0]) {
      const newIndex = allImages.findIndex(
        (img) => img === variantWithColor.images[0],
      );
      if (newIndex !== -1 && newIndex !== currentSlideIndex)
        setCurrentSlideIndex(newIndex);
    }
    if (selectedSize && !isVariantAvailable(color, selectedSize))
      setSelectedSize(null);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const variant = variants.find((v) => v.size === size && v.images?.length > 0);
    if (variant?.images?.[0]) {
      const newIndex = allImages.findIndex((img) => img === variant.images[0]);
      if (newIndex !== -1 && newIndex !== currentSlideIndex)
        setCurrentSlideIndex(newIndex);
    }
    if (selectedColor && !isVariantAvailable(selectedColor, size))
      setSelectedColor(null);
  };

  const handleAddToCart = async () => {
    if ((needsColor && !selectedColor) || (needsSize && !selectedSize)) {
      setShowVariantPopup(true);
      return;
    }
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    try {
      await addToCart({ variantId: selectedVariant.id, quantity: 1 });
      setShowSuccessNotification(true);
      setShowVariantPopup(false);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (isLoading) {
    return (
      <PrimaryLayout>
        <ImageLoader />
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

  return (
    <PrimaryLayout>
      <AddToCartNotification
        show={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        currentImage={currentImage}
        productName={product.name}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        currentPrice={currentPrice}
      />

      <VariantSelectionPopup
        show={showVariantPopup}
        onClose={() => setShowVariantPopup(false)}
        currentImage={currentImage}
        productName={product.name}
        currentPrice={currentPrice}
        needsColor={needsColor}
        needsSize={needsSize}
        colors={uniqueColors}
        sizes={uniqueSizes}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        isColorAvailable={isColorAvailable}
        isSizeAvailable={isSizeAvailable}
        isVariantAvailable={isVariantAvailable}
        onColorSelect={handleColorSelect}
        onSizeSelect={handleSizeSelect}
        onAddToCart={handleAddToCart}
        isAddingToCart={isAddingToCart}
        selectedVariant={selectedVariant}
      />

      <div className="mt-0 md:mt-[5rem] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-stretch md:gap-8 gap-0">
          <ProductImageGallery
            images={allImages}
            productName={product.name}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
          />

          <ProductInfo
            product={product}
            currentPrice={currentPrice}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            selectedVariant={selectedVariant}
            uniqueColors={uniqueColors}
            uniqueSizes={uniqueSizes}
            isColorAvailable={isColorAvailable}
            isSizeAvailable={isSizeAvailable}
            isVariantAvailable={isVariantAvailable}
            needsColor={needsColor}
            needsSize={needsSize}
            hasAnyAvailableVariant={hasAnyAvailableVariant}
            isAddingToCart={isAddingToCart}
            onColorSelect={handleColorSelect}
            onSizeSelect={handleSizeSelect}
            onAddToCart={handleAddToCart}
          />
        </div>

        <SimilarProducts items={similarProducts} />
      </div>

      <style jsx>{`
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </PrimaryLayout>
  );
};

export default ProductDetails;
