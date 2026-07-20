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
  FiAlertCircle,
  FiX,
  FiFileText,
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
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false); // New state for payment confirmation
  const [orderComplete, setOrderComplete] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [checkoutToken, setCheckoutToken] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [totalWeight, setTotalWeight] = useState(0);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

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

  // Calculate total weight from cart items
  useEffect(() => {
    if (cartItems.length > 0) {
      const weight = cartItems.reduce(
        (sum, product) => sum + (product.weight_grams || 0) * product.quantity,
        0,
      );
      console.log("Calculating total weight:", weight);
      setTotalWeight(weight);
    } else {
      setTotalWeight(0);
    }
  }, [cartItems]);

  // Fetch shipping states
  const { data: shippingStatesData } = useQuery({
    queryKey: ["shippingStates"],
    queryFn: async () => {
      console.log("Fetching shipping states...");
      const response = await api.get("/v1/shipping/states");
      return response.data;
    },
  });

  const shippingStates = shippingStatesData?.data || [];

  // Fetch shipping rates when state changes OR totalWeight changes
  useEffect(() => {
    const fetchShippingRates = async () => {
      // Don't fetch if no state selected
      if (!formData.state) {
        console.log("No state selected yet, skipping rates fetch");
        setShippingRates([]);
        setSelectedShipping(null);
        setHasAttemptedFetch(false);
        return;
      }

      // Don't fetch if total weight is 0
      if (totalWeight === 0) {
        console.log("Total weight is 0, skipping rates fetch");
        setShippingRates([]);
        setSelectedShipping(null);
        return;
      }

      // Prevent multiple simultaneous requests
      if (isFetchingRates) {
        console.log("Already fetching rates, skipping...");
        return;
      }

      setIsFetchingRates(true);
      setHasAttemptedFetch(true);

      try {
        // Convert weight from grams to kg for API (API expects weight in kg)
        const weightInKg = totalWeight / 1000;
        const url = `/v1/shipping/rates?state=${encodeURIComponent(formData.state)}&weight=${weightInKg}`;
        console.log(`🔵 Fetching shipping rates from: ${url}`);

        const response = await api.get(url);

        console.log("🟢 Shipping Rates Response:", response.data);

        if (response.data?.status && response.data?.data?.length > 0) {
          const rates = response.data.data;
          console.log(`Found ${rates.length} shipping rates`);
          setShippingRates(rates);

          // Auto-select the first available shipping option
          const firstRate = rates[0];
          setSelectedShipping({
            id: firstRate.id,
            name: firstRate.name,
            amount: firstRate.amount || firstRate.cost || 0,
            eta: firstRate.eta,
          });
          console.log("Auto-selected shipping option:", firstRate);
        } else {
          console.log("No shipping rates found or API returned empty data");
          setShippingRates([]);
          setSelectedShipping(null);
        }
      } catch (error) {
        console.error("🔴 Error fetching shipping rates:", error);
        console.error("Error details:", error.response?.data || error.message);
        setShippingRates([]);
        setSelectedShipping(null);
        toast.error(
          "Failed to fetch shipping rates. Please check your address.",
        );
      } finally {
        setIsFetchingRates(false);
      }
    };

    fetchShippingRates();
  }, [formData.state, totalWeight]);

  // Calculate subtotal from cart items
  const subtotal = cartItems.reduce(
    (sum, product) =>
      sum + (product.unit_price_snapshot_cents / 100) * product.quantity,
    0,
  );

  // Use quote data if available, otherwise calculate from cart
  const displaySubtotal = quoteData?.totals?.subtotal_cents
    ? quoteData.totals.subtotal_cents / 100
    : subtotal;

  // FIXED: Properly calculate display shipping amount
  const displayShipping = (() => {
    // If we have quote data with shipping amount, use that
    if (quoteData?.totals?.shipping_cents !== undefined) {
      return quoteData.totals.shipping_cents / 100;
    }
    // Otherwise use the selected shipping rate
    if (selectedShipping?.amount !== undefined && selectedShipping.amount > 0) {
      return selectedShipping.amount;
    }
    // If no shipping selected yet but rates exist, show 0
    if (shippingRates.length > 0 && !selectedShipping) {
      return 0;
    }
    return 0;
  })();

  const displayTotal = quoteData?.totals?.grand_total_cents
    ? quoteData.totals.grand_total_cents / 100
    : displaySubtotal + displayShipping;

  // Quote mutation - Step 4
  const quoteMutation = useMutation({
    mutationFn: async (data) => {
      console.log("📦 Quote mutation payload:", data);
      const response = await api.post("/v1/checkout/quote", data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("✅ Quote mutation response:", data);
      if (data?.status) {
        setQuoteData(data.data);
        setCheckoutToken(data.data.checkout_token);

        // Update selected shipping with the correct amount from quote
        if (
          data.data.shipping_options &&
          data.data.shipping_options.length > 0 &&
          selectedShipping
        ) {
          const matchedShipping = data.data.shipping_options.find(
            (opt) => opt.id === selectedShipping.id,
          );
          if (matchedShipping) {
            setSelectedShipping({
              id: matchedShipping.id,
              name: matchedShipping.name,
              amount: matchedShipping.amount || matchedShipping.cost || 0,
              eta: matchedShipping.eta,
            });
          }
        }

        // Reset processing state BEFORE showing modal
        setIsProcessing(false);

        // Show the quote modal after successful quote generation
        setShowQuoteModal(true);
        toast.success("Quote generated successfully");
      } else {
        setIsProcessing(false);
        toast.error("Failed to generate quote");
      }
    },
    onError: (error) => {
      console.error("❌ Quote mutation error:", error);
      toast.error(error?.response?.data?.message || "Failed to generate quote");
      setIsProcessing(false);
    },
  });

  // Generate idempotency key
  const generateIdempotencyKey = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  // POST to Interswitch via a hidden form — Interswitch requires a form POST,
  // not a GET redirect, so window.location.href won't work here.
  const submitInterswitchForm = (paymentData) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentData.payment_url;

    const fields = {
      merchant_code: paymentData.merchant_code,
      pay_item_id: paymentData.pay_item_id,
      txn_ref: paymentData.reference,
      amount: paymentData.amount,
      currency: paymentData.currency,
      mode: paymentData.mode,
      cust_email: paymentData.cust_email,
      cust_name: paymentData.cust_name,
      site_redirect_url: `${window.location.origin}/checkout`,
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value ?? "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  // Confirm mutation - Step 5
  const confirmMutation = useMutation({
    mutationFn: async ({ checkout_token, idempotencyKey }) => {
      const response = await api.post(
        "/v1/checkout/confirm",
        { checkout_token },
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.status) {
        setOrderData(data.data);
        setShowQuoteModal(false);
        setIsConfirmingPayment(false);

        if (data.data?.payment_url) {
          submitInterswitchForm(data.data);
        } else {
          toast.success("Order created!");
          setTimeout(() => navigate("/product"), 2000);
        }
      } else {
        setIsConfirmingPayment(false);
        toast.error("Failed to confirm order");
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to confirm order");
      setIsConfirmingPayment(false);
      setShowQuoteModal(false);
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

  // Generate quote first
  const handleGenerateQuote = async (e) => {
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

      console.log("🚀 Submitting quote payload:", quotePayload);

      // Generate quote (this will show the modal on success)
      await quoteMutation.mutateAsync(quotePayload);
    } catch (error) {
      console.error("❌ Quote generation error:", error);
      toast.error(
        error?.message || "Failed to generate quote. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  // Proceed to payment from the modal
  const handleProceedToPayment = async () => {
    if (!checkoutToken) {
      toast.error("Checkout token not found");
      return;
    }

    setIsConfirmingPayment(true);

    try {
      const idempotencyKey = generateIdempotencyKey();
      console.log("Using Idempotency-Key:", idempotencyKey);
      await confirmMutation.mutateAsync({
        checkout_token: checkoutToken,
        idempotencyKey,
      });
    } catch (error) {
      console.error("❌ Payment confirmation error:", error);
      toast.error(
        error?.message || "Failed to proceed to payment. Please try again.",
      );
      setIsConfirmingPayment(false);
    }
  };

  // Handle payment verification after returning from Interswitch (txnref) or legacy (reference)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("txnref") || urlParams.get("reference");

    if (ref && !orderComplete) {
      verifyPayment(ref);
    }
  }, []);

  const verifyPayment = async (reference) => {
    try {
      const response = await api.get(`/v1/payments/verify/${reference}`);
      if (response.data?.status) {
        setOrderComplete(true);
        await refetchCart();
        toast.success("Payment verified! Order confirmed.");
        setTimeout(() => {
          navigate("/orders");
        }, 2000);
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
          className="bg-white shadow-xl p-8 max-w-md w-full text-center"
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
            className="w-full bg-gray-900 text-white py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            View Orders
          </button>
        </motion.div>
      </div>
    );
  }

  // Determine shipping section state
  const showShippingOptions = !isFetchingRates && shippingRates.length > 0;
  const showShippingPlaceholder =
    !isFetchingRates &&
    formData.state &&
    totalWeight > 0 &&
    shippingRates.length === 0 &&
    hasAttemptedFetch;
  const showShippingLoading =
    isFetchingRates && formData.state && totalWeight > 0;
  const showShippingWaiting = !formData.state || totalWeight === 0;

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currency = quoteData?.totals?.currency || "NGN";
    switch (currency) {
      case "GBP":
        return "£";
      case "USD":
        return "$";
      default:
        return "₦";
    }
  };

  const currencySymbol = getCurrencySymbol();

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
            <form onSubmit={handleGenerateQuote}>
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

              {/* Shipping Options Section */}
              <div className="bg-white shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiTruck className="mr-2" />
                  Shipping Method
                </h2>

                {showShippingLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">
                      Fetching available shipping options...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Please wait while we calculate rates for your location
                    </p>
                  </div>
                )}

                {showShippingWaiting && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200">
                    <FiTruck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-1">
                      Shipping options will appear here
                    </p>
                    <p className="text-xs text-gray-400">
                      {!formData.state
                        ? "Please select a state in your shipping address"
                        : "Calculating package weight..."}
                    </p>
                  </div>
                )}

                {showShippingPlaceholder && (
                  <div className="text-center py-8 bg-yellow-50 border border-yellow-200">
                    <FiAlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-yellow-700 mb-1">
                      No shipping options available
                    </p>
                    <p className="text-xs text-yellow-600">
                      We couldn't find any shipping rates for your location.
                      Please contact our support team for assistance.
                    </p>
                  </div>
                )}

                {showShippingOptions && (
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
                            onChange={() =>
                              setSelectedShipping({
                                id: rate.id,
                                name: rate.name,
                                amount: rate.amount || rate.cost || 0,
                                eta: rate.eta,
                              })
                            }
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
                            ₦{(rate.amount || rate.cost || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">incl. VAT</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isProcessing ||
                  !selectedShipping ||
                  totalWeight === 0 ||
                  isFetchingRates
                }
                className="w-full cursor-pointer bg-gray-900 text-white py-4 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Generating Quote...
                  </>
                ) : !selectedShipping && !isFetchingRates && formData.state ? (
                  "Select a shipping method"
                ) : isFetchingRates ? (
                  "Calculating shipping..."
                ) : (
                  <>
                    <FiFileText className="text-lg" />
                    Generate Quote
                  </>
                )}
              </button>
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

              <div className="mb-4 pb-3 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Package Weight</span>
                  <span className="text-gray-700 font-medium">
                    {totalWeight > 0
                      ? `${(totalWeight / 1000).toFixed(2)} kg (${totalWeight} g)`
                      : "Calculating..."}
                  </span>
                </div>
              </div>

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
                      {product.weight_grams > 0 && (
                        <p className="text-xs text-gray-400">
                          Weight: {product.weight_grams}g
                        </p>
                      )}
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
                    {currencySymbol}
                    {displaySubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-medium">
                    {displayShipping > 0
                      ? `${currencySymbol}${displayShipping.toLocaleString()}`
                      : isFetchingRates
                        ? "Calculating..."
                        : shippingRates.length > 0 && !selectedShipping
                          ? "Select a shipping method"
                          : displayShipping === 0 && selectedShipping
                            ? "Free Shipping"
                            : "To be calculated"}
                  </span>
                </div>
                {quoteData?.totals?.tax_cents > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (VAT)</span>
                    <span className="text-gray-900">
                      {currencySymbol}
                      {(quoteData.totals.tax_cents / 100).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900 text-xl">
                    {currencySymbol}
                    {displayTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quote Review Modal */}
      <AnimatePresence>
        {showQuoteModal && quoteData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !isConfirmingPayment && setShowQuoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheck className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Quote Summary
                    </h2>
                    <p className="text-sm text-gray-500">
                      Please review your order details
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    !isConfirmingPayment && setShowQuoteModal(false)
                  }
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isConfirmingPayment}
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Shipping Address Section */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiMapPin className="text-gray-500" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">
                      {quoteData.shipping_address?.first_name}{" "}
                      {quoteData.shipping_address?.last_name}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {quoteData.shipping_address?.line1}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {quoteData.shipping_address?.city},{" "}
                      {quoteData.shipping_address?.state}{" "}
                      {quoteData.shipping_address?.zip}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {quoteData.shipping_address?.country}
                    </p>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiMail className="text-gray-500" />
                    Contact Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">{formData.email}</p>
                  </div>
                </div>

                {/* Shipping Method Section */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiTruck className="text-gray-500" />
                    Shipping Method
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedShipping?.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <FiClock className="text-xs" />
                        {selectedShipping?.eta}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {currencySymbol}
                      {(selectedShipping?.amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiShoppingBag className="text-gray-500" />
                    Order Items ({cartItems.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cartItems.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={getProductImage(product)}
                            alt={product.product_title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {product.product_title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.color || "Default"} ·{" "}
                            {product.size || "One Size"} · Qty:{" "}
                            {product.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 text-sm">
                            {currencySymbol}
                            {(
                              (product.unit_price_snapshot_cents / 100) *
                              product.quantity
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">
                        {currencySymbol}
                        {(
                          quoteData.totals?.subtotal_cents / 100
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        {currencySymbol}
                        {(
                          quoteData.totals?.shipping_cents / 100
                        ).toLocaleString()}
                      </span>
                    </div>
                    {quoteData.totals?.tax_cents > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (VAT)</span>
                        <span className="text-gray-900">
                          {currencySymbol}
                          {(quoteData.totals?.tax_cents / 100).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900 text-lg">
                          {currencySymbol}
                          {(
                            quoteData.totals?.grand_total_cents / 100
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <button
                  onClick={handleProceedToPayment}
                  disabled={isConfirmingPayment}
                  className="w-full bg-gray-900 text-white py-4 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfirmingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Redirecting to payment...
                    </>
                  ) : (
                    <>
                      <FiLock className="text-lg" />
                      Proceed to Payment · {currencySymbol}
                      {(
                        quoteData.totals?.grand_total_cents / 100
                      ).toLocaleString()}
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  By proceeding, you agree to our Terms of Service
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
