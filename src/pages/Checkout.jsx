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
  FiTag,
  FiEdit2,
  FiPlus,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import api from "../lib/axios";
import EmptyCart from "../components/checkout/EmptyCart";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applyCouponAPI } from "../services/cartServices";
import { toast } from "sonner";
import useUserStore from "../stores/auth-store";

// The address book speaks snake_case and calls the street `line1`; the checkout
// form has its own names. Translate at the boundary so everything downstream —
// the list, the form, the quote payload — keeps working in form shape.
const toApiAddress = (form) => ({
  first_name: form.firstName,
  last_name: form.lastName,
  line1: form.address,
  city: form.city,
  state: form.state,
  zip: form.zipCode,
  phone: form.phone,
});

const fromApiAddress = (addr) => ({
  id: addr.id,
  firstName: addr.first_name || "",
  lastName: addr.last_name || "",
  address: addr.line1 || "",
  city: addr.city || "",
  state: addr.state || "",
  zipCode: addr.zip || "",
  phone: addr.phone || "",
  isDefault: !!addr.is_default,
});
import {
  markGatewayHandoff,
  useGatewayBackGuard,
} from "../hooks/useGatewayBackGuard";

const resolveOrderId = (order) =>
  order?.order_id || order?.order?.id || order?.id || null;

// The intent schema types its extra fields loosely, so take the first value
// that actually looks like somewhere to send the shopper.
const resolveAuthorizationUrl = (intent) => {
  const candidate =
    intent?.authorization_url || intent?.payment_url || intent?.client_secret;
  return typeof candidate === "string" && candidate.startsWith("https://")
    ? candidate
    : null;
};

const PAYMENT_GATEWAYS = [
  {
    id: "paystack",
    label: "Paystack",
    logo: "/images/paystack-mark.png",
    logoClass: "h-5",
  },
  {
    id: "interswitch",
    label: "Interswitch",
    logo: "/images/interswitch-mark.png",
    logoClass: "h-6",
  },
];

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, cartCoupon, isLoading: cartLoading } = useCart();
  const { user } = useUserStore();
  const queryClient = useQueryClient();

  // Set when a gateway redirects back here instead of /payment/callback.
  const returningPaymentRef =
    new URLSearchParams(location.search).get("txnref") ||
    new URLSearchParams(location.search).get("reference");

  // Back from here would otherwise land on the expired gateway page.
  useGatewayBackGuard("/cart");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false); // New state for payment confirmation
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [checkoutToken, setCheckoutToken] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [totalWeight, setTotalWeight] = useState(0);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [isEditingCoupon, setIsEditingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Checkout gates on contact first: a guest confirms an email, a signed-in user
  // is already past it. Only then does the delivery section appear.
  const [contactConfirmed, setContactConfirmed] = useState(!!user);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [contactError, setContactError] = useState("");
  // The address form is a distinct step. Signed-in accounts keep a list and pick
  // one; editingAddressId is null when the form is adding rather than editing.
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    country: "NG",
  });

  // A returning signed-in user skips the contact step
  useEffect(() => {
    if (user) {
      setContactConfirmed(true);
      setFormData((prev) => ({
        ...prev,
        email: prev.email || user.email || "",
        firstName: prev.firstName || user.first_name || "",
        lastName: prev.lastName || user.last_name || "",
      }));
    }
  }, [user]);

  // A signed-in user's addresses live on the account, so load the book and open
  // on their default. Guests have no book at all.
  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    let cancelled = false;

    const fetchAddresses = async () => {
      setAddressesLoading(true);
      try {
        const response = await api.get("/v1/me/addresses");
        if (cancelled) return;

        const book = (response.data?.data || []).map(fromApiAddress);
        setAddresses(book);

        const preferred = book.find((a) => a.isDefault) || book[0] || null;
        if (preferred) {
          setSelectedAddressId(preferred.id);
          setFormData((prev) => ({ ...prev, ...preferred }));
        }
      } catch (error) {
        console.log(error, "fetching saved addresses error");
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    };

    fetchAddresses();
    return () => {
      cancelled = true;
    };
  }, [user]);

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

  // totals.discount_cents is what came off the order; the top-level
  // discount_cents is the coupon's face value, which is larger whenever the
  // coupon is worth more than the subtotal it can be spent against.
  const displayDiscount = quoteData?.totals?.discount_cents
    ? quoteData.totals.discount_cents / 100
    : 0;

  const couponValue = quoteData?.discount_cents
    ? quoteData.discount_cents / 100
    : 0;

  const unusedDiscount = Math.max(couponValue - displayDiscount, 0);

  // Server state, not local — the cart keeps the coupon across a reload, so
  // remembering it in component state only makes the two disagree.
  const appliedCoupon = quoteData?.coupon_code || cartCoupon;

  const displayTotal = quoteData?.totals?.grand_total_cents
    ? quoteData.totals.grand_total_cents / 100
    : Math.max(displaySubtotal + displayShipping - displayDiscount, 0);

  // Quote mutation - Step 4
  const quoteMutation = useMutation({
    mutationFn: async ({ payload }) => {
      console.log("📦 Quote mutation payload:", payload);
      const response = await api.post("/v1/checkout/quote", payload);
      return response.data;
    },
    onSuccess: (data, { silent }) => {
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

        // A silent refresh only exists to update the totals in place
        if (!silent) {
          setShowQuoteModal(true);
          toast.success("Quote generated successfully");
        }
      } else if (!silent) {
        setIsProcessing(false);
        toast.error("Failed to generate quote");
      }
    },
    onError: (error, { silent }) => {
      console.error("❌ Quote mutation error:", error);
      if (!silent) {
        toast.error(
          error?.response?.data?.message || "Failed to generate quote",
        );
      }
      setIsProcessing(false);
    },
  });

  // Apply coupon - the discount itself comes back on the next quote
  const couponMutation = useMutation({
    mutationFn: (code) => applyCouponAPI(code),
    onSuccess: (data) => {
      if (data?.status) {
        setCouponError("");
        setIsEditingCoupon(false);
        setCouponCode("");
        // The token belongs to totals that predate the discount
        setCheckoutToken(null);
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        toast.success(data.message || "Promo code applied");

        // apply-coupon returns no amounts, so the discount only becomes
        // visible once the quote has been recalculated against the cart.
        if (canQuote) {
          quoteMutation.mutate({ payload: buildQuotePayload(), silent: true });
        } else {
          setQuoteData(null);
        }
      } else {
        setCouponError(data?.message || "This promo code isn't valid");
      }
    },
    onError: (error) => {
      setCouponError(
        error?.response?.data?.message || "This promo code isn't valid",
      );
    },
  });

  const handleApplyCoupon = () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponError("");
    couponMutation.mutate(code);
  };

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
      // Points at the bounce endpoint, not the SPA route — the gateway returns
      // via POST, which a static route can't serve.
      site_redirect_url: `${window.location.origin}/api/payment/callback`,
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value ?? "";
      form.appendChild(input);
    });

    console.log("🔵 Interswitch form fields:", fields);
    // Survives the full-page POST, so the callback can be compared against it
    sessionStorage.setItem("last-txn-ref", fields.txn_ref ?? "");

    document.body.appendChild(form);
    markGatewayHandoff();
    form.submit();
  };

  // Confirm mutation - Step 5. Creates the order; how the shopper then pays
  // depends on the gateway they picked, so the redirect lives with the caller.
  const confirmMutation = useMutation({
    mutationFn: async ({ checkout_token, payment_provider, idempotencyKey }) => {
      const response = await api.post(
        "/v1/checkout/confirm",
        { checkout_token, payment_provider },
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
        },
      );
      return response.data;
    },
  });

  // Paystack is initialised against the order that confirm just created,
  // rather than coming back on the confirm response the way Interswitch does.
  const paystackIntentMutation = useMutation({
    mutationFn: async (orderId) => {
      const response = await api.post("/v1/payments/intent", {
        order_id: orderId,
        // Paystack returns via GET, so it can land on the SPA route directly
        // rather than bouncing through /api the way Interswitch has to.
        callback_url: `${window.location.origin}/payment/callback`,
      });
      return response.data;
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

  const savedAddress =
    addresses.find((a) => a.id === selectedAddressId) || null;

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleGuestCheckout = () => {
    if (!isValidEmail(formData.email)) {
      setContactError("Please enter a valid email address.");
      return;
    }
    if (!privacyAccepted) {
      setContactError("Please accept the privacy policy to continue.");
      return;
    }
    setContactError("");
    setContactConfirmed(true);
  };

  // Send them to sign in, then straight back here
  const handleSignInRedirect = () => {
    navigate("/signin", { state: { from: "/checkout" } });
  };

  // A guest's address is whatever is in the form; a signed-in user's is saved
  const addressReady = user
    ? !!savedAddress
    : !!formData.firstName &&
      !!formData.lastName &&
      !!formData.address &&
      !!formData.city &&
      !!formData.state &&
      !!formData.phone;

  const addressFieldsFilled =
    !!formData.firstName &&
    !!formData.lastName &&
    !!formData.address &&
    !!formData.city &&
    !!formData.state &&
    !!formData.phone;

  // Adding starts from a blank form — only the account name carries over
  const handleAddAddress = () => {
    setEditingAddressId(null);
    setFormData((prev) => ({
      ...prev,
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
    }));
    setShowAddressForm(true);
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setFormData((prev) => ({ ...prev, ...addr }));
    setShowAddressForm(true);
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({ ...prev, ...addr }));
  };

  const handleSaveAddress = async () => {
    if (!addressFieldsFilled) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (isSavingAddress) return;

    setIsSavingAddress(true);
    try {
      const payload = toApiAddress(formData);
      const response = editingAddressId
        ? await api.patch(`/v1/me/addresses/${editingAddressId}`, payload)
        : await api.post("/v1/me/addresses", {
            ...payload,
            // The first address an account saves becomes its default
            is_default: addresses.length === 0,
          });

      const saved = fromApiAddress(response.data?.data || {});
      setAddresses((prev) =>
        editingAddressId
          ? prev.map((a) => (a.id === saved.id ? saved : a))
          : [...prev, saved],
      );
      setSelectedAddressId(saved.id);
      setFormData((prev) => ({ ...prev, ...saved }));
      setEditingAddressId(null);
      setShowAddressForm(false);
    } catch (error) {
      console.log(error, "saving address error");
      toast.error(
        error?.response?.data?.message ||
          "We couldn't save that address. Please try again.",
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleCancelAddress = () => {
    // Put the selected address back, discarding whatever the form held
    if (savedAddress) {
      setFormData((prev) => ({ ...prev, ...savedAddress }));
    }
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const buildQuotePayload = () => ({
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
      phone: formData.phone,
      country: "NG",
    },
    shipping_option_id: selectedShipping?.id,
  });

  const canQuote =
    !!cartId &&
    contactConfirmed &&
    addressReady &&
    !!selectedShipping &&
    !!formData.email &&
    !!formData.firstName &&
    !!formData.lastName &&
    !!formData.address &&
    !!formData.city &&
    !!formData.state &&
    !!formData.zipCode;

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
      const quotePayload = buildQuotePayload();
      console.log("🚀 Submitting quote payload:", quotePayload);

      // Generate quote (this will show the modal on success)
      await quoteMutation.mutateAsync({ payload: quotePayload });
    } catch (error) {
      console.error("❌ Quote generation error:", error);
      toast.error(
        error?.message || "Failed to generate quote. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  // Proceed to payment from the modal
  const handleProceedToPayment = () => {
    if (!checkoutToken) {
      toast.error("Checkout token not found");
      return;
    }

    setShowPaymentSheet(true);
  };

  // Handing off to a gateway is a full-page navigation, so settle the UI first
  // — otherwise a slow redirect, or a bfcache restore on the way back, leaves
  // the sheet sitting there mid-spin.
  const closePaymentUi = () => {
    setIsConfirmingPayment(false);
    setSelectedGateway(null);
    setShowPaymentSheet(false);
    setShowQuoteModal(false);
  };

  const handleSelectGateway = async (provider) => {
    if (!provider || isConfirmingPayment) return;

    setIsConfirmingPayment(true);

    try {
      const idempotencyKey = generateIdempotencyKey();
      console.log("Using Idempotency-Key:", idempotencyKey);
      const confirmed = await confirmMutation.mutateAsync({
        checkout_token: checkoutToken,
        payment_provider: provider,
        idempotencyKey,
      });

      console.log("✅ Confirm response:", confirmed);

      if (!confirmed?.status) {
        throw new Error(confirmed?.message || "Failed to confirm order");
      }

      const order = confirmed.data;
      setOrderData(order);

      if (provider === "paystack") {
        const orderId = resolveOrderId(order);
        if (!orderId) {
          throw new Error(
            `Confirm returned no order id — got: ${Object.keys(order || {}).join(", ") || "nothing"}`,
          );
        }

        const intent = await paystackIntentMutation.mutateAsync(orderId);
        const authorizationUrl = resolveAuthorizationUrl(intent?.data);
        if (!authorizationUrl) {
          throw new Error(
            intent?.message || "Paystack didn't return a payment link",
          );
        }

        closePaymentUi();
        markGatewayHandoff();
        window.location.href = authorizationUrl;
        return;
      }

      if (!order?.payment_url) {
        closePaymentUi();
        toast.success("Order created!");
        setTimeout(() => navigate("/product"), 2000);
        return;
      }

      closePaymentUi();
      submitInterswitchForm(order);
    } catch (error) {
      console.error("❌ Payment confirmation error:", error);

      // Confirm spends the token, so a rejected one can never be retried as-is
      // — drop the stale quote instead of leaving the sheet open to fail again.
      if (error?.response?.data?.message === "invalid_checkout_token") {
        closePaymentUi();
        setQuoteData(null);
        setCheckoutToken(null);
        toast.error("This quote is no longer valid. Please generate a new one.");
        return;
      }

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to proceed to payment. Please try again.",
      );
      setIsConfirmingPayment(false);
    }
  };

  // A gateway that still points at /checkout (legacy config, or a transaction
  // started before the redirect URL changed) is handed to the callback page,
  // which owns verification and the payment-successful screen.
  useEffect(() => {
    if (returningPaymentRef) {
      navigate(
        `/payment/callback?txnref=${encodeURIComponent(returningPaymentRef)}`,
        { replace: true },
      );
    }
  }, [returningPaymentRef, navigate]);

  // Don't flash the empty-cart screen while that redirect is in flight.
  if (returningPaymentRef) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return <EmptyCart />;
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

  // Guests fill the address inline; signed-in users get an address book + modal
  const isGuest = !user;

  const addressFormFields = (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-[15px] font-semibold text-gray-900 mb-2"
                      >
                        First name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 px-4 py-3.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-[15px] font-semibold text-gray-900 mb-2"
                      >
                        Last name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 px-4 py-3.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-[15px] font-semibold text-gray-900 mb-2"
                      >
                        Address *
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street address"
                        className="w-full border border-gray-200 px-4 py-3.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="block text-[15px] font-semibold text-gray-900 mb-2"
                      >
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 px-4 py-3.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-[15px] font-semibold text-gray-900 mb-2"
                      >
                        State *
                      </label>
                      <div className="relative">
                        <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 px-4 py-3.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none transition-colors"
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
                        className="block text-[15px] font-semibold text-gray-900 mb-2"
                      >
                        ZIP code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 px-4 py-3.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-[15px] font-semibold text-gray-900 mb-2"
                      >
                        Mobile number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Mobile number"
                        className="w-full border border-gray-200 px-4 py-3.5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                      />
                    </div>
                  </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-now">
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
                className="bg-white shadow-sm mb-6"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <FiUser className="mr-2" />
                    Contact Information
                  </h2>
                  {contactConfirmed && !user && (
                    <button
                      type="button"
                      onClick={() => setContactConfirmed(false)}
                      aria-label="Edit contact information"
                      className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      <FiEdit2 size={18} />
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {contactConfirmed ? (
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-4">
                      <FiMail className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 break-all">
                        {formData.email}
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-right text-sm text-gray-700 mb-2">
                        Required Fields*
                      </p>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                        placeholder="Email *"
                      />

                      <label className="flex items-start gap-3 mt-5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacyAccepted}
                          onChange={(e) => setPrivacyAccepted(e.target.checked)}
                          className="mt-1 h-5 w-5 accent-gray-900 flex-shrink-0"
                        />
                        <span className="text-[10.9px] text-gray-900 leading-snug">
                          I have read and understood the Privacy Policy, and I
                          agree to receive marketing communications via email.
                        </span>
                      </label>

                      {contactError && (
                        <p className="mt-3 text-sm text-red-600">
                          {contactError}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleGuestCheckout}
                        className="w-full bg-black text-white py-4 mt-5 text-[12.5px] hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        Checkout as a Guest
                      </button>

                      <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">
                        Please be aware that if the email is associated with an
                        existing Uptown account, your new order will be attached
                        to it.
                      </p>

                      <div className="flex items-center gap-4 my-7">
                        <span className="h-px flex-1 bg-gray-200" />
                        <span className="text-gray-400">OR</span>
                        <span className="h-px flex-1 bg-gray-200" />
                      </div>

                      <p className="text-[11.3px] text-gray-900">
                        Sign in or create your Uptown account.
                      </p>

                      <button
                        type="button"
                        onClick={handleSignInRedirect}
                        className="w-full bg-black text-white py-4 mt-5 text-[12.5px] hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        Sign In/ Register
                      </button>

                      <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">
                        Sign in or create an account to save your details and
                        easily track your orders.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Delivery options — only after contact is settled */}
              {contactConfirmed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white shadow-sm mb-6"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FiMapPin className="mr-2" />
                      Delivery Options
                    </h2>
                  </div>

                  <div className="p-6">
                    {isGuest ? (
                      /* Guests have no address book — the form is the section */
                      <>
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                          <FiMapPin className="mr-2" />
                          Shipping Address
                        </h3>
                        {addressFormFields}
                      </>
                    ) : (
                      <>
                        <span className="block text-[17px] text-gray-900 mb-4">
                          Delivery Address
                        </span>

                        <div className="space-y-3">
                          {addressesLoading && addresses.length === 0 && (
                            <div className="space-y-3">
                              {[0, 1].map((i) => (
                                <div
                                  key={i}
                                  className="h-[132px] w-full animate-pulse bg-gray-100"
                                />
                              ))}
                            </div>
                          )}

                          {addresses.map((addr) => {
                            const isSelected = addr.id === selectedAddressId;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => handleSelectAddress(addr)}
                                className={`relative border p-5 cursor-pointer transition-colors ${
                                  isSelected
                                    ? "border-gray-900"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex gap-4">
                                  <span
                                    className={`mt-1 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 ${
                                      isSelected
                                        ? "border-gray-900"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {isSelected && (
                                      <span className="h-[10px] w-[10px] rounded-full bg-gray-900" />
                                    )}
                                  </span>

                                  <div className="flex-1 min-w-0 pr-12">
                                    <p className="text-[17px] text-gray-900">
                                      {addr.firstName} {addr.lastName}
                                    </p>
                                    <p className="mt-3 text-[15px] text-gray-700">
                                      {addr.address}
                                    </p>
                                    <p className="mt-1 text-[15px] text-gray-700">
                                      {[addr.city, addr.state, addr.zipCode]
                                        .filter(Boolean)
                                        .join(", ")}
                                    </p>
                                    <p className="mt-1 text-[15px] text-gray-700">
                                      {addr.phone}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAddress(addr);
                                  }}
                                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[15px] text-gray-900 underline cursor-pointer"
                                >
                                  Edit
                                </button>
                              </div>
                            );
                          })}

                          <button
                            type="button"
                            onClick={handleAddAddress}
                            className="flex w-full items-center gap-3 border border-gray-200 p-5 text-left hover:border-gray-300 transition-colors cursor-pointer"
                          >
                            <FiPlus size={20} className="text-gray-900" />
                            <span className="text-[17px] text-gray-900">
                              Add a New Address
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Shipping Options Section */}
              <div
                className={`bg-white shadow-sm p-6 mb-6 ${
                  contactConfirmed &&
                  (user ? !!savedAddress : !!formData.state)
                    ? ""
                    : "hidden"
                }`}
              >
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
                {displayDiscount > 0 && (
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Discount{appliedCoupon ? ` (${appliedCoupon})` : ""}
                      </span>
                      <span className="text-green-600 font-medium">
                        -{currencySymbol}
                        {displayDiscount.toLocaleString()}
                      </span>
                    </div>
                    {unusedDiscount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {currencySymbol}
                        {couponValue.toLocaleString()} code · {currencySymbol}
                        {unusedDiscount.toLocaleString()} exceeds this order's
                        subtotal
                      </p>
                    )}
                  </div>
                )}
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

              <div className="mt-6 pt-6 border-t border-gray-200">
                <label
                  htmlFor="couponCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Promo code
                </label>

                {appliedCoupon && !isEditingCoupon ? (
                  <div className="flex items-center justify-between border border-gray-900 px-4 py-3">
                    <span className="flex items-center gap-2 text-gray-900 font-medium">
                      <FiTag className="text-gray-500" />
                      {appliedCoupon}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingCoupon(true);
                        setCouponCode("");
                      }}
                      className="text-sm text-gray-500 hover:text-gray-900 underline transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="flex">
                    <input
                      type="text"
                      id="couponCode"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="flex-1 min-w-0 border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                      placeholder="Enter promo code"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponMutation.isPending}
                      className="bg-gray-900 text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponMutation.isPending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        "Apply"
                      )}
                    </button>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCoupon(false);
                          setCouponError("");
                        }}
                        className="ml-3 flex-shrink-0 text-sm text-gray-500 hover:text-gray-900 underline transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}

                {couponError && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <FiAlertCircle className="flex-shrink-0" />
                    {couponError}
                  </p>
                )}
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
                    {displayDiscount > 0 && (
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Discount{appliedCoupon ? ` (${appliedCoupon})` : ""}
                          </span>
                          <span className="text-green-600 font-medium">
                            -{currencySymbol}
                            {displayDiscount.toLocaleString()}
                          </span>
                        </div>
                        {unusedDiscount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {currencySymbol}
                            {couponValue.toLocaleString()} code ·{" "}
                            {currencySymbol}
                            {unusedDiscount.toLocaleString()} exceeds this
                            order's subtotal
                          </p>
                        )}
                      </div>
                    )}
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
                  <FiLock className="text-lg" />
                  Proceed to Payment · {currencySymbol}
                  {(quoteData.totals?.grand_total_cents / 100).toLocaleString()}
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  By proceeding, you agree to our Terms of Service
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Method Sheet */}
      <AnimatePresence>
        {showPaymentSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center"
            onClick={() => !isConfirmingPayment && setShowPaymentSheet(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="bg-white w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center border-b border-gray-200 px-4 py-4">
                <button
                  onClick={() => setShowPaymentSheet(false)}
                  disabled={isConfirmingPayment}
                  className="text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                  aria-label="Close payment options"
                >
                  <FiX size={22} />
                </button>
                <span className="flex-1 text-center text-gray-900 text-[13px] pr-6">
                  How would you like to Pay?
                </span>
              </div>

              <div className="p-6 space-y-4">
                {PAYMENT_GATEWAYS.map((gateway) => {
                  const isSelected = selectedGateway === gateway.id;

                  return (
                    <button
                      key={gateway.id}
                      type="button"
                      onClick={() => setSelectedGateway(gateway.id)}
                      disabled={isConfirmingPayment}
                      aria-pressed={isSelected}
                      className={`w-full flex items-center justify-between gap-4 border px-5 py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-gray-900"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-gray-900" : "border-gray-400"
                          }`}
                        >
                          {isSelected && (
                            <span className="h-2.5 w-2.5 rounded-full bg-gray-900" />
                          )}
                        </span>
                        <span className="text-gray-900 text-[14.8px]">{gateway.label}</span>
                      </span>
                      <img
                        src={gateway.logo}
                        alt=""
                        className={`${gateway.logoClass} object-contain`}
                      />
                    </button>
                  );
                })}

                <button
                  onClick={() => handleSelectGateway(selectedGateway)}
                  disabled={!selectedGateway || isConfirmingPayment}
                  className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white text-[10.1px] uppercase tracking-[0.15em] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfirmingPayment ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    "Confirm and complete purchase"
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center pt-1">
                  By selecting a payment option, you confirm that you have read,
                  understood, and accepted our terms and conditions.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address modal — signed-in accounts only */}
      {!isGuest && showAddressForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-now">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCancelAddress}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FiMapPin className="mr-2" />
                Shipping Address
              </h3>
              <button
                type="button"
                onClick={handleCancelAddress}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <FiX size={22} />
              </button>
            </div>

            {addressFormFields}

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
                className="flex-1 border border-gray-900 py-3.5 text-sm font-semibold tracking-wide text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingAddress ? "SAVING…" : "SAVE"}
              </button>
              <button
                type="button"
                onClick={handleCancelAddress}
                className="flex-1 bg-black py-3.5 text-sm font-semibold tracking-wide text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
