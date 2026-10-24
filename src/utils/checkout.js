// utils/checkout.js — request shapes for the checkout API.

// No cart_id: the server quotes the shopper's active cart. An id read from
// this browser's cache goes stale the moment another browser signs in and the
// carts are merged.
export const buildQuotePayload = (formData, shippingOptionId, currency) => ({
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
  shipping_option_id: shippingOptionId,
  currency,
});
