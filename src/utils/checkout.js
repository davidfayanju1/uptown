// utils/checkout.js — request shapes for the checkout API.
import {
  getDestination,
  normalisePhone,
  usesCourierQuote,
} from "../domain/shipping";

// No cart_id: the server quotes the shopper's active cart. An id read from
// this browser's cache goes stale the moment another browser signs in and the
// carts are merged.
//
// No address_id either: saved addresses are Nigeria-only on the API, so the
// typed address is what every region sends.
export const buildQuotePayload = (formData, shippingOptionId, currency) => {
  const { country } = getDestination(currency);

  return {
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
      phone: usesCourierQuote(country)
        ? normalisePhone(formData.phone)
        : formData.phone,
      country,
    },
    shipping_option_id: shippingOptionId,
    currency,
  };
};

const CHECKOUT_ERRORS = {
  shipping_option_required: "Please choose a delivery option to continue.",
};

export const describeCheckoutError = (message) =>
  CHECKOUT_ERRORS[message] || message || null;
