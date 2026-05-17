import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCreditCard,
  FiUser,
  FiMapPin,
  FiMail,
  FiLock,
  FiChevronDown,
  FiCheck,
  FiShoppingBag,
  FiArrowLeft,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import api from "../lib/axios";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, isLoading: cartLoading, refetchCart } = useCart();

  const [activePayment, setActivePayment] = useState("google-pay");
  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  // Get products from cart or from location state (fallback)
  const products = location.state?.products || cartItems || [];

  // Calculate totals
  const subtotal = products.reduce(
    (sum, product) =>
      sum +
      (product.unit_price_snapshot_cents / 100 || product.price) *
        product.quantity,
    0,
  );
  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Get product image helper
  const getProductImage = (product) => {
    if (product.variant_images && product.variant_images.length > 0) {
      return product.variant_images[0];
    }
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images[0];
    }
    if (product.image) {
      return product.image;
    }
    return "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image";
  };

  // Get product details helper
  const getProductColor = (product) => {
    return product.color || "Default";
  };

  const getProductSize = (product) => {
    return product.size || "One Size";
  };

  const getProductName = (product) => {
    return product.product_title || product.name || "Product Item";
  };

  const getProductPrice = (product) => {
    const price = product.unit_price_snapshot_cents
      ? product.unit_price_snapshot_cents / 100
      : product.price;
    return price;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      // Clear cart after successful order (optional)
      // You can add API call here to clear the cart
    }, 2000);
  };

  const paymentMethods = [
    {
      id: "google-pay",
      name: "Google Pay",
      icon: "https://cdn-icons-png.flaticon.com/512/300/300221.png",
    },
    {
      id: "cash-app",
      name: "Cash App",
      icon: "https://cdn-icons-png.flaticon.com/512/888/888862.png",
    },
    {
      id: "apple-pay",
      name: "Apple Pay",
      icon: "https://cdn-icons-png.flaticon.com/512/888/888848.png",
    },
  ];

  const fetchRates = async () => {
    try {
      const response = await api.get("/v1/shipping/rates");
      console.log("Shipping Rates", response.data);
    } catch (error) {
      console.log("Error", error.response.data.message);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);
  // Loading state
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Empty cart state
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">
            <img
              src="/images/cart-empty-removebg.png"
              alt=""
              className="h-40 mx-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before checking out
          </p>
          <button
            onClick={() => navigate("/product")}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-green-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order #
            {Math.floor(Math.random() * 100000)} has been confirmed and will be
            shipped soon.
          </p>
          <button
            onClick={() => {
              setOrderComplete(false);
              navigate("/product");
            }}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Cart
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Form */}
          <div className="lg:w-7/12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-sm p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FiUser className="mr-2" />
                Contact Information
              </h2>

              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10 w-full border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white shadow-sm p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FiMapPin className="mr-2" />
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    State *
                  </label>
                  <div className="relative">
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none transition-colors"
                    >
                      <option value="">Select</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ZIP code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Country *
                </label>
                <div className="relative">
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none transition-colors"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FiCreditCard className="mr-2" />
                Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setActivePayment(method.id)}
                    className={`p-4 border-2 flex items-center justify-center transition-all ${
                      activePayment === method.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={method.icon}
                      alt={method.name}
                      className="h-6 w-auto"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {method.name}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-5/12"
          >
            <div className="lg:sticky lg:top-8 bg-white shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FiShoppingBag className="mr-2" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {products.map((product, index) => (
                  <div key={product.id || index} className="flex items-center">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={getProductImage(product)}
                        alt={getProductName(product)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {getProductName(product)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getProductColor(product)} · {getProductSize(product)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Qty: {product.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        £{getProductPrice(product).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">£{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="text-gray-900">£{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900 text-xl">
                    £{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full cursor-pointer mt-5 bg-gray-900 text-white py-4 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiLock className="mr-2" />
                    Complete Purchase · £{total.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By completing your purchase, you agree to our Terms of Service
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
