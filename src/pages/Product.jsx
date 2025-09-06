import React, { useState } from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { Link } from "react-router-dom";

const Product = () => {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [wishlist, setWishlist] = useState({}); // Track wishlist status for each product

  const productList = [
    {
      id: 1,
      name: "UPTOWN REINCARNATION TEE",
      img: "/images/shirt1.png",
      price: "$24.99",
      colors: ["Black", "White", "Gray"],
      available: false, // Mark as sold out
    },
    {
      id: 2,
      name: "UPTOWN NO DEFEAT TEE",
      img: "/images/shirt2.png",
      price: "$79.99",
      colors: ["Red", "Blue", "Green"],
      available: false, // Mark as sold out
    },
    {
      id: 3,
      name: "UPTOWN DAILY PROJECT BASEBALL CAP",
      img: "/images/cap1.webp",
      price: "$15.99",
      colors: ["Navy", "Beige"],
      available: true, // Only this product is available
    },
    {
      id: 4,
      name: "UPTOWN DAILY PROJECT BACKPACK",
      img: "/images/dailyprojectback.png",
      price: "$25.99",
      colors: ["Navy", "Beige"],
      available: true, // Only this product is available
    },
    {
      id: 5,
      name: "UPTOWN SOMNIATOR TEES",
      img: "/images/somniator.png",
      price: "$15.99",
      colors: ["Navy", "Beige"],
      available: false, // Only this product is available
    },
    {
      id: 6,
      name: "UPTOWN TANKS",
      img: "/images/uptowntanks.png",
      price: "$22.99",
      colors: ["Navy", "Beige"],
      available: true, // Only this product is available
    },
  ];

  // Toggle wishlist status for a product
  const toggleWishlist = (productId) => {
    setWishlist((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <PrimaryLayout>
      <div className="container min-h-screen md:mt-[5rem] mt-[4rem] mx-auto px-4 py-8">
        {/* Header with view toggle */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-black font-semibold text-lg md:text-xl">
            DISCOVER
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              aria-label="Grid view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              aria-label="List view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Products display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {productList.map((product) => (
              <div key={product.id} className="group relative w-full">
                <div className="h-[13.5rem] md:h-[17.5rem] w-full overflow-hidden bg-gray-200 flex items-center justify-center p-4 relative">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />

                  {/* Sold Out Overlay */}
                  {!product.available && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="text-white font-bold text-sm tracking-wider bg-black/80 px-2 py-2">
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  {/* Wishlist Heart Icon */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/20 backdrop-blur-xl transition-all duration-300 hover:bg-white hover:scale-110 z-10"
                    aria-label={
                      wishlist[product.id]
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 transition-all duration-300 ${
                        wishlist[product.id]
                          ? "fill-black scale-110"
                          : "fill-none stroke-gray-600 hover:stroke-black"
                      }`}
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-4">
                  <Link to={product.available ? `/product/${product.id}` : "#"}>
                    <h3 className="text-[13px] truncate font-semibold text-gray-900">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-sm text-gray-700">{product.price}</p>
                  <div className="mt-2 flex space-x-1">
                    {product.colors.map((color, i) => (
                      <span
                        key={i}
                        className="h-4 w-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {productList.map((product) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row gap-4 p-4 border-solid border-gray-200 border-[1px] hover:bg-gray-50 transition-colors relative"
              >
                <div className="w-full sm:w-48 h-48 bg-gray-200 overflow-hidden flex items-center justify-center p-4 relative">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />

                  {/* Sold Out Overlay for List View */}
                  {!product.available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-bold text-sm tracking-wider bg-black/80 px-4 py-2">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                {/* Wishlist Heart Icon for List View */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110 z-10"
                  aria-label={
                    wishlist[product.id]
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-all duration-300 ${
                      wishlist[product.id]
                        ? "fill-black scale-110"
                        : "fill-none stroke-gray-600 hover:stroke-black"
                    }`}
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </button>

                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {product.price}
                  </p>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Available Colors:
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {product.colors.map((color, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-full border border-gray-300"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className={`mt-4 px-4 py-2 rounded-md transition-colors ${
                      product.available
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                    disabled={!product.available}
                  >
                    {product.available ? "Add to Cart" : "Sold Out"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PrimaryLayout>
  );
};

export default Product;
