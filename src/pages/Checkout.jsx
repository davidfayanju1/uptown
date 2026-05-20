// Checkout.tsx
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
  FiTruck,
  FiClock,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import api from "../lib/axios";
import EmptyCart from "../components/checkout/EmptyCart";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useUserStore from "../stores/auth-store";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, isLoading: cartLoading, refetchCart } = useCart();
  const { user } = useUserStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [checkoutToken, setCheckoutToken] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "NG",
  });

  // Get cart ID from cart items
  const cartId = cartItems[0]?.cart_id || null;

  // Fetch shipping states
  const { data: shippingStatesData } = useQuery({
    queryKey: ["shippingStates"],
    queryFn: async () => {
      const response = await api.get("/v1/shipping/states");
      return response.data;
    },
  });

  const shippingStates = shippingStatesData?.data || [];

  // Fetch shipping rates when state changes
  useEffect(() => {
    const fetchShippingRates = async () => {
      if (!formData.state) return;

      try {
        const response = await api.get(
          `/v1/shipping/rates?state=${formData.state}`,
        );
        if (response.data?.status) {
          setShippingRates(response.data.data || []);
          if (response.data.data?.length > 0 && !selectedShipping) {
            setSelectedShipping(response.data.data[0]);
          }
        }
      } catch (error) {
        console.log("Error fetching shipping rates:", error);
      }
    };

    fetchShippingRates();
  }, [formData.state]);

  // Calculate totals from cart items
  const subtotal = cartItems.reduce(
    (sum, product) =>
      sum + (product.unit_price_snapshot_cents / 100) * product.quantity,
    0,
  );

  const shippingCost = selectedShipping?.amount || 0;
  const total = subtotal + shippingCost;

  // Quote mutation - Step 4
  const quoteMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/v1/checkout/quote", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.status) {
        setCheckoutToken(data.data.checkout_token);
        toast.success("Quote generated successfully");
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to generate quote");
    },
  });

  // Confirm mutation - Step 5
  const confirmMutation = useMutation({
    mutationFn: async (checkout_token) => {
      const response = await api.post("/v1/checkout/confirm", {
        checkout_token,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.status) {
        setOrderData(data.data);

        // Redirect to Paystack payment URL
        if (data.data?.payment_url) {
          window.location.href = data.data.payment_url;
        } else {
          // If no payment URL, show order created message
          toast.success("Order created!...");
          setTimeout(() => {
            navigate("/product");
          }, 2000);
        }
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to confirm order");
      setIsProcessing(false);
    },
  });

  const getProductImage = (product) => {
    if (product.variant_images?.length > 0) return product.variant_images[0];
    if (product.product_images?.length > 0) return product.product_images[0];
    if (product.image) return product.image;
    return "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 3: Generate quote first, then confirm
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
      toast.error("Please fill in all required fields");
      return;
    }

    if (!cartId) {
      toast.error("Cart not found");
      return;
    }

    if (!selectedShipping) {
      toast.error("Please select a shipping method");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare quote payload
      const quotePayload = {
        cart_id: cartId,
        contact: {
          email: formData.email,
        },
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          line1: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode,
          country: "NG",
        },
        shipping_option_id: selectedShipping.id,
      };

      // Step 4: Generate quote
      const quoteResponse = await quoteMutation.mutateAsync(quotePayload);

      if (quoteResponse?.status && quoteResponse.data?.checkout_token) {
        // Step 5: Confirm order
        await confirmMutation.mutateAsync(quoteResponse.data.checkout_token);
      } else {
        throw new Error("Failed to generate checkout token");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error?.message || "Checkout failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Handle payment verification after returning from Paystack
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");

    if (reference && !orderComplete) {
      verifyPayment(reference);
    }
  }, []);

  const verifyPayment = async (reference) => {
    try {
      const response = await api.get(`/v1/payments/verify/${reference}`);
      if (response.data?.status) {
        setOrderComplete(true);
        // Refetch cart to clear it
        await refetchCart();
        toast.success("Payment verified! Order confirmed.");
        setTimeout(() => {
          navigate("/orders");
        }, 3000);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed. Please contact support.");
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderComplete) {
    return <EmptyCart />;
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
            Thank you for your purchase. Your order has been confirmed and will
            be shipped soon.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            View Orders
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
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

              {/* Shipping Address */}
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
                        <option value="">Select State</option>
                        {shippingStates.map((state) => (
                          <option key={state.id} value={state.state}>
                            {state.state}
                          </option>
                        ))}
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
              </motion.div>

              {/* Shipping Options */}
              {shippingRates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white shadow-sm p-6 mb-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <FiTruck className="mr-2" />
                    Shipping Method
                  </h2>

                  <div className="space-y-3">
                    {shippingRates.map((rate) => (
                      <label
                        key={rate.id}
                        className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-all ${
                          selectedShipping?.id === rate.id
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="shipping"
                            value={rate.id}
                            checked={selectedShipping?.id === rate.id}
                            onChange={() => setSelectedShipping(rate)}
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {rate.name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <FiClock className="mr-1 text-xs" />
                              {rate.eta}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₦{rate.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">incl. VAT</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Hidden submit button for form submission */}
              <button type="submit" className="hidden" />
            </form>
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
                {cartItems.map((product, index) => (
                  <div key={product.id || index} className="flex items-center">
                    <div className="w-16 h-16 overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={getProductImage(product)}
                        alt={product.product_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {product.product_title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {product.color || "Default"} ·{" "}
                        {product.size || "One Size"}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Qty: {product.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₦
                        {(
                          (product.unit_price_snapshot_cents / 100) *
                          product.quantity
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shippingCost > 0
                      ? `₦${shippingCost.toLocaleString()}`
                      : "Calculated at next step"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900 text-xl">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isProcessing || !selectedShipping}
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
                    Proceed to Payment · ₦{total.toLocaleString()}
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
