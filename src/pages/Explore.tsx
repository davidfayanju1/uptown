import React from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

// Type definitions for the API response
interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  color: string;
  size: string;
  images: string[];
  price_cents: number;
  currency: string;
  stock: number;
}

interface Product {
  id: string;
  title: string;
  description: string;
  details: string;
  images: string[];
  status: string;
  is_active: boolean;
  rating: number;
  rating_count: number;
  stock: number;
  variants: ProductVariant[];
}

interface ProductsResponse {
  status: boolean;
  message: string;
  data: Product[];
}

// Fetch function
const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get<ProductsResponse>("/v1/products");
  // console.log(response.data.data, "API Response Data"); // Debug log
  return response.data.data;
};

// Skeleton component for products
const ProductSkeleton = () => (
  <div className="group relative w-full animate-pulse">
    <div className="h-[22rem] w-full overflow-hidden bg-gray-200 rounded"></div>
    <div className="mt-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="flex space-x-1 mt-2">
        <div className="h-4 w-4 rounded-full bg-gray-200"></div>
        <div className="h-4 w-4 rounded-full bg-gray-200"></div>
        <div className="h-4 w-4 rounded-full bg-gray-200"></div>
      </div>
    </div>
  </div>
);

const Explore = () => {
  const navigate = useNavigate();

  // TanStack Query
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // console.log(products, "Fetched Products"); // Debug log

  // Get first 3 products only
  const firstThreeProducts = products?.slice(0, 3) || [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const productVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  // Function to render products or skeletons/error
  const renderProducts = () => {
    if (isLoading) {
      return (
        <>
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </>
      );
    }

    if (error) {
      return (
        <div className="col-span-3 text-center py-12">
          <p className="text-red-500">
            Failed to load products. Please refresh the page.
          </p>
        </div>
      );
    }

    return firstThreeProducts.map((product, index) => {
      const firstVariant = product.variants[0];
      const price = firstVariant
        ? `${firstVariant.currency} ${(firstVariant.price_cents / 100).toFixed(2)}`
        : "Price unavailable";
      const productImage =
        product.images[0] ||
        firstVariant?.images[0] ||
        "/images/placeholder.jpg";
      const colors = [...new Set(product.variants.map((v) => v.color))];

      return (
        <motion.div
          key={product.id}
          className="group relative w-full"
          variants={productVariants}
          custom={index}
          whileHover={{ y: -10, transition: { duration: 0.3 } }}
        >
          <div className="h-[22rem] w-full overflow-hidden bg-gray-200">
            <img
              src={productImage}
              alt={product.title}
              className="h-full w-full object-cover object-top group-hover:opacity-75 transition-opacity duration-300"
            />
          </div>
          <div className="mt-4">
            <Link to={`/product/${product.id}`}>
              <h3 className="text-sm font-medium text-gray-900">
                {product.title}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-700">{price}</p>
            {colors.length > 0 && (
              <div className="mt-2 flex space-x-1">
                {colors.slice(0, 3).map((color, i) => (
                  <span
                    key={i}
                    className="h-4 w-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      );
    });
  };

  return (
    <PrimaryLayout>
      {/* Fixed Background Container */}
      <div className="fixed inset-0 -z-10">
        <div className="relative h-full w-full">
          <img
            src="/images/product5.jpg"
            alt="Background"
            className="h-full w-full object-cover opacity-20"
          />
        </div>
      </div>

      {/* Content Section */}
      <section className="py-12 mx-auto max-w-[74rem] mt-[3rem] relative bg-white bg-opacity-90">
        {/* First Flex Container - Image on Right */}
        <motion.div
          className="container mx-auto md:px-4 px-3 flex flex-col md:flex-row items-center gap-16 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div className="md:w-1/2" variants={containerVariants}>
            <motion.h2
              className="text-4xl font-bold mb-6 tracking-tight"
              variants={itemVariants}
            >
              A TESTAMENT TO CRAFTSMANSHIP
              <span className="text-primary">
                &
                <br /> <span className="text-red-500"> EXCLUSIVITY</span>
              </span>
            </motion.h2>
            <motion.p
              className="md:text-lg text-md mb-8 text-gray-700 md:w-[80%] w-[88%]"
              variants={itemVariants}
            >
              Our Apparel are not created for the crowd they are reserved for
              the uncompromising. Every detail is intentional, shaped with quiet
              mastery.
            </motion.p>
            <motion.button
              onClick={() => navigate("/product")}
              className="border-solid px-6 py-2 border-black border-[1px] rounded-full hover:bg-black hover:text-white transition-all"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Shop Now
            </motion.button>
          </motion.div>
          <motion.div className="md:w-[45%]" variants={imageVariants}>
            <img
              src="/images/victory2.jpeg"
              alt="Performance shoes"
              className="md:h-[38rem] h-[30rem] object-cover w-full md:shadow-xl"
            />
          </motion.div>
        </motion.div>

        {/* Second Flex Container - Image on Left */}
        <motion.div
          className="container mx-auto px-4 flex md:justify-between flex-col md:flex-row-reverse items-center md:gap-22"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div
            className="md:w-[40%] text-right"
            variants={containerVariants}
          >
            <motion.h2
              className="text-4xl font-bold mb-6 tracking-tight"
              variants={itemVariants}
            >
              AUTHENTIC UPTOWN
              <br />
              <span className="text-red-500">EXCLUSIVE</span>
            </motion.h2>
            <motion.p
              className="text-lg mb-8 text-right w-full text-gray-700"
              variants={itemVariants}
            >
              Uptown Exclusive is crafted for the discerning few. Each release
              is meticulously limited, authenticated through embedded NFC, and
              accompanied by access to our private NFT collections.
            </motion.p>
            <motion.button
              onClick={() => navigate("/product")}
              className="border-solid px-6 py-2 border-black border-[1px] rounded-full hover:bg-black hover:text-white transition-all"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Request Access
            </motion.button>
          </motion.div>
          <motion.div className="md:w-[45%] w-full" variants={imageVariants}>
            <img
              src="/images/Cap.png"
              alt="Urban style shoes"
              className="md:h-[38rem] h-[30rem] object-top object-cover w-full"
            />
          </motion.div>
        </motion.div>

        {/* Products Grid - Only first 3 products with skeleton */}
        <motion.div
          className="container md:mt-[6rem] mx-auto px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl font-bold mb-6 tracking-tight"
            variants={itemVariants}
          >
            Discover
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3"
            variants={containerVariants}
          >
            {renderProducts()}
          </motion.div>
        </motion.div>
      </section>
    </PrimaryLayout>
  );
};

export default Explore;
