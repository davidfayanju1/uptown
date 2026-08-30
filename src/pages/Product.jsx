// pages/Product.jsx
import React, { useEffect, useState } from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import {
  GridSkeleton,
  ListSkeleton,
} from "../components/load-states/products-page";
import ImageLoader from "../components/load-states/image-center-loader";
import {
  formatCurrency,
  getProductPrice,
  getPriceRange,
} from "../utils/currency";

const Product = () => {
  const viewMode = "grid";
  const [wishlist, setWishlist] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transform API response to match the existing UI structure
  const transformProductData = (apiProducts) => {
    return apiProducts.map((product) => {
      // Get all unique colors from variants
      const colors = [...new Set(product.variants?.map((v) => v.color) || [])];

      // Check if product has any variant in stock
      const hasStock = product.variants?.some((variant) => variant.stock > 0);

      // Get product price info using the utility function
      const { formatted: price, currency } = getProductPrice(product.variants);

      // Get first image from variants or product images
      const productImage =
        product.variants?.[0]?.images?.[0] ||
        product.images?.[0] ||
        "/images/placeholder.png";

      return {
        id: product.id,
        name: product.title,
        img: productImage,
        price: price, // Now properly formatted with ₦ symbol
        currency: currency,
        colors: colors.length > 0 ? colors : ["White", "Black", "Gray"],
        available: hasStock,
        originalData: product,
      };
    });
  };

  const handleFetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/v1/products");
      if (response.data?.status && response.data?.data) {
        const transformedProducts = transformProductData(response.data.data);
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.log(error, "fetching product error");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    handleFetchProducts();
  }, []);

  const toggleWishlist = (productId) => {
    setWishlist((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <PrimaryLayout>
      {loading && <ImageLoader />}

      <div className="container min-h-screen md:mt-[5rem] mt-[4rem] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <span className="text-black font-semibold text-lg md:text-xl">
            DISCOVER
          </span>
        </div>

        {loading && (viewMode === "grid" ? <GridSkeleton /> : <ListSkeleton />)}

        {!loading && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={product.available ? `/product/${product.id}` : "#"}
                    className="group relative w-full block"
                  >
                    <div className="h-[13.5rem] md:h-[17.5rem] w-full overflow-hidden bg-[#F7F7F7] flex items-center justify-center relative">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />

                      {!product.available && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="text-white font-bold text-sm tracking-wider bg-black/80 px-2 py-2">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="text-[14px] uppercase truncate font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-700">
                        {product.price}
                      </p>
                      <div className="mt-2 flex space-x-1">
                        {product.colors.slice(0, 3).map((color, i) => (
                          <span
                            key={i}
                            className="h-4 w-4 rounded-full border border-gray-300"
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
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border-solid border-gray-200 border-[1px] hover:bg-gray-50 transition-colors relative"
                  >
                    <div className="w-full sm:w-48 h-48 bg-[#F7F7F7] overflow-hidden flex items-center justify-center p-4 relative">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />

                      {!product.available && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-bold text-sm tracking-wider bg-black/80 px-4 py-2">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <Link
                        to={product.available ? `/product/${product.id}` : "#"}
                      >
                        <h3 className="text-lg uppercase font-medium text-gray-900">
                          {product.name}
                        </h3>
                      </Link>
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
          </>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
      </div>
    </PrimaryLayout>
  );
};

export default Product;
