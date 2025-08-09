import React, { useState } from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { Link } from "react-router-dom";

const Product = () => {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const productList = [
    {
      name: "PLAIN TEE",
      img: "/images/product1.jpg",
      price: "$29.99",
      colors: ["Black", "White", "Gray"],
    },
    {
      name: "ROLLERS TEE",
      img: "/images/product2.jpg",
      price: "$34.99",
      colors: ["Red", "Blue", "Green"],
    },
    {
      name: "PLAIN TEE",
      img: "/images/product3.jpg",
      price: "$27.99",
      colors: ["Navy", "Beige"],
    },
    {
      name: "ROLLERS TEE",
      img: "/images/product4.jpg",
      price: "$31.99",
      colors: ["Yellow", "Orange"],
    },
  ];

  return (
    <PrimaryLayout>
      <div className="container min-h-screen mt-[3rem] mx-auto px-4 py-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {productList.map((product, index) => (
              <div key={index} className="group relative w-full">
                <div className="h-[22rem] w-full overflow-hidden rounded-md bg-gray-200">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="h-full w-full object-cover object-top group-hover:opacity-75 transition-opacity"
                  />
                </div>
                <div className="mt-4">
                  <Link to={`/product/${index}`}>
                    <h3 className="text-sm font-medium text-gray-900">
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
            {productList.map((product, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-4 p-4 border-solid border-gray-200 border-[1px] rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-full sm:w-48 h-48 bg-gray-200 rounded-md overflow-hidden">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
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
                  <button className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                    Add to Cart
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
