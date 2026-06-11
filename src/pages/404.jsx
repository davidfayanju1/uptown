import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/axios";

const NotFoundPage = () => {
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transform API response to match the UI structure (same as Product component)
  const transformProductData = (apiProducts) => {
    return apiProducts.slice(0, 3).map((product) => {
      // Get all unique colors from variants
      const colors = [...new Set(product.variants?.map((v) => v.color) || [])];

      // Check if product has any variant in stock
      const hasStock = product.variants?.some((variant) => variant.stock > 0);

      // Get the lowest price from variants
      const lowestPrice = product.variants?.reduce(
        (min, variant) =>
          variant.price_cents < min ? variant.price_cents : min,
        Infinity,
      );

      const priceInDollars =
        lowestPrice !== Infinity ? (lowestPrice / 100).toFixed(2) : "0.00";

      // Get first image from variants or product images
      const productImage =
        product.variants?.[0]?.images?.[0] ||
        product.images?.[0] ||
        "/images/placeholder.png";

      return {
        id: product.id,
        name: product.title,
        img: productImage,
        price: `${product.variants?.[0]?.currency === "USD" ? "$" : "£"}${priceInDollars}`,
        category: product.category || "Collection",
        colors: colors.length > 0 ? colors : ["White", "Black", "Gray"],
        available: hasStock,
      };
    });
  };

  const fetchSuggestedProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/v1/products");
      if (response.data?.status && response.data?.data) {
        const transformedProducts = transformProductData(response.data.data);
        setSuggestedProducts(transformedProducts);
      }
    } catch (error) {
      console.log(error, "fetching suggested products error");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    fetchSuggestedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Main 404 content */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-[#EBE9E4] text-7xl sm:text-8xl font-light tracking-wider">
              404
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl font-light tracking-wide text-[#1C1C1A] mt-6 mb-4"
          >
            This page has been discontinued
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#6B6B64] text-base font-light leading-relaxed"
          >
            Like last season's collection, this page is no longer available.
            Browse our current selection below.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Link
              to="/product"
              className="inline-block px-8 py-3 border border-[#1C1C1A] text-sm font-medium tracking-wide text-[#1C1C1A] bg-transparent hover:bg-[#1C1C1A] hover:text-white transition-all duration-300"
            >
              Continue shopping
            </Link>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border-t border-[#EBE9E4] pt-12"
        >
          <p className="text-[#8C8C86] text-xs uppercase tracking-wider text-center mb-8">
            You might also like
          </p>

          {/* Product suggestion grid - matches Product component styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeletons
              [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-[#F5F4F0] h-64 w-full"></div>
                  <div className="mt-3 space-y-2">
                    <div className="h-3 bg-[#F5F4F0] rounded w-1/3 mx-auto"></div>
                    <div className="h-4 bg-[#F5F4F0] rounded w-2/3 mx-auto"></div>
                    <div className="h-3 bg-[#F5F4F0] rounded w-1/4 mx-auto"></div>
                  </div>
                </div>
              ))
            ) : suggestedProducts.length > 0 ? (
              suggestedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <Link to={product.available ? `/product/${product.id}` : "#"}>
                    <div className="bg-[#FAF9F7] overflow-hidden relative">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {!product.available && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="text-white text-xs font-medium tracking-wider bg-black/80 px-2 py-1">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-[#8C8C86] text-xs uppercase tracking-wide">
                        {product.category}
                      </p>
                      <h3 className="text-[#1C1C1A] text-sm font-light tracking-wide mt-1">
                        {product.name}
                      </h3>
                      <p className="text-[#6B6B64] text-sm mt-1">
                        {product.price}
                      </p>
                      <div className="mt-2 flex space-x-1 justify-center">
                        {product.colors.slice(0, 3).map((color, i) => (
                          <span
                            key={i}
                            className="h-3 w-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-gray-500 ml-1">
                            +{product.colors.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              // No products found - don't show anything
              <div className="col-span-full text-center py-8">
                <p className="text-[#8C8C86] text-sm">No products available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Help section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 text-center text-xs text-[#8C8C86]"
        >
          <p>
            Need assistance?{" "}
            <a
              href="mailto:help@uptown.co.uk"
              className="underline underline-offset-2 hover:text-[#1C1C1A] transition-colors"
            >
              Contact our team
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
