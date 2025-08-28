import React, { useState, useEffect, useRef } from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { useParams } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSticky, setIsSticky] = useState(true);
  const descriptionRef = useRef(null);
  const containerRef = useRef(null);

  const product = {
    id: id,
    name: "Nike Air Max Pulse",
    description: "Extraordinary comfort and style for your everyday life.",
    price: 129.99,
    colors: [
      { name: "Black", value: "#000000" },
      { name: "White", value: "#ffffff" },
      { name: "Red", value: "#ff0000" },
      { name: "Blue", value: "#0000ff" },
    ],
    sizes: [8, 9, 10, 11, 12],
    details: [
      "Dual-density foam cushioning",
      "Rubber outsole for durability",
      "Breathable mesh upper",
      "Classic Air Max cushioning",
    ],
    images: [
      "/images/product1.jpg",
      "/images/product2.jpg",
      "/images/product3.jpg",
      "/images/product4.jpg",
    ],
  };

  useEffect(() => {
    const handleScroll = () => {
      if (descriptionRef.current && containerRef.current) {
        const descriptionBottom =
          descriptionRef.current.getBoundingClientRect().bottom;
        const containerBottom =
          containerRef.current.getBoundingClientRect().bottom;

        // Make image not sticky when description is out of view
        if (
          descriptionBottom <= 100 ||
          containerBottom <= window.innerHeight + 100
        ) {
          setIsSticky(false);
        } else {
          setIsSticky(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <PrimaryLayout>
      <div
        className="max-w-7xl mt-[5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8"
        ref={containerRef}
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery */}
          <div className="lg:w-1/2">
            <div
              className="sticky top-4 transition-all duration-300"
              style={{ position: isSticky ? "sticky" : "relative" }}
            >
              <div className="mb-4 h-96 sm:h-[500px] overflow-hidden rounded-lg">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="flex gap-4 mt-4">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`h-20 w-20 cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedImage === index
                        ? "border-black"
                        : "border-gray-200"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2" ref={descriptionRef}>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              ${product.price}
            </p>

            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            {/* Color Selection */}
            <div className="mt-8">
              <h2 className="text-sm font-medium text-gray-900">Color</h2>
              <div className="flex mt-2 space-x-3">
                {product.colors.map((color, index) => (
                  <div key={index} className="relative">
                    <div
                      className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-200 flex items-center justify-center"
                      style={{ backgroundColor: color.value }}
                    >
                      <span className="sr-only">{color.name}</span>
                    </div>
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mt-10">
              <h2 className="text-sm font-medium text-gray-900">Size</h2>
              <div className="grid grid-cols-5 gap-3 mt-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className="border rounded-md py-3 px-4 text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <button className="mt-10 w-full bg-black border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-black">
              Add to cart
            </button>

            {/* Product Details */}
            <div className="mt-10">
              <h2 className="text-sm font-medium text-gray-900">Details</h2>
              <ul className="mt-4 space-y-2">
                {product.details.map((detail, index) => (
                  <li
                    key={index}
                    className="text-gray-600 list-disc list-inside"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional content to enable scrolling */}
            <div className="mt-12 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Product Story</h2>
              <p className="text-gray-600">
                The Nike Air Max Pulse draws inspiration from the London music
                scene, offering an edgy and raw design that delivers a smooth
                and comfortable experience. Built for everyday wear, it combines
                innovative technology with timeless style.
              </p>
              <p className="text-gray-600">
                Featuring a durable rubber outsole and responsive cushioning,
                the Air Max Pulse provides all-day comfort whether you're
                navigating city streets or spending time with friends.
              </p>
              <p className="text-gray-600">
                The breathable mesh upper keeps your feet cool while the classic
                Air Max unit in the heel offers premium cushioning with every
                step.
              </p>
            </div>

            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
              <div className="mt-4 space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold">Excellent comfort!</h3>
                  <p className="text-gray-600 mt-1">
                    These are the most comfortable shoes I've ever owned.
                    Perfect for all-day wear.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">- Alex Johnson</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold">Great style</h3>
                  <p className="text-gray-600 mt-1">
                    I get compliments every time I wear these. The design is
                    sleek and modern.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">- Sarah Williams</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default ProductDetails;
