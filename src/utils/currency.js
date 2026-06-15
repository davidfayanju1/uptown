// utils/currency.js

/**
 * Format currency based on the currency code
 * @param {number} amount - The amount (can be in cents or regular units)
 * @param {string} currency - Currency code (NGN, USD, GBP, EUR)
 * @param {boolean} isInCents - Whether the amount is in cents (default: false)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "NGN", isInCents = false) => {
  // Handle invalid amount
  if (typeof amount !== "number" || isNaN(amount)) {
    return getCurrencySymbol(currency) + "0.00";
  }

  // Convert from cents to main unit if needed
  const mainAmount = amount / 100;

  // Format the number
  const formattedNumber = mainAmount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const symbol = getCurrencySymbol(currency);
  return `${symbol}${formattedNumber}`;
};

/**
 * Format price from cents (backend response)
 * @param {number} cents - Amount in cents
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatPriceFromCents = (cents, currency = "NGN") => {
  return formatCurrency(cents, currency, true);
};

/**
 * Format price from regular units (frontend display)
 * @param {number} amount - Amount in regular units (e.g., 40.00)
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatPriceFromUnits = (amount, currency = "NGN") => {
  return formatCurrency(amount, currency, false);
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency) => {
  const symbols = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
  };
  return symbols[currency] || currency;
};

/**
 * Get currency based on variant or default
 * @param {object} variant - Variant object containing currency
 * @param {array} variants - Array of variants
 * @returns {string} Currency code
 */
export const getProductCurrency = (variant, variants = []) => {
  if (variant?.currency) return variant.currency;
  if (variants.length > 0 && variants[0]?.currency) return variants[0].currency;
  return "NGN";
};

/**
 * Get product price from variants (backend response with cents)
 * @param {array} variants - Array of variants
 * @returns {object} { price: number, currency: string, formatted: string }
 */
export const getProductPrice = (variants = []) => {
  if (!variants.length) {
    return { price: 0, currency: "NGN", formatted: "₦0.00" };
  }

  // Get the lowest price from variants (in cents)
  const lowestPrice = variants.reduce(
    (min, variant) => (variant.price_cents < min ? variant.price_cents : min),
    Infinity,
  );

  const currency = variants[0]?.currency || "NGN";
  const priceInCents = lowestPrice !== Infinity ? lowestPrice : 0;

  return {
    price: priceInCents,
    currency,
    formatted: formatCurrency(priceInCents, currency, true),
  };
};

/**
 * Get price range for products with multiple variants (backend response with cents)
 * @param {array} variants - Array of variants
 * @returns {string} Formatted price range (e.g., "₦4,000 - ₦7,000" or "₦7,000")
 */
export const getPriceRange = (variants = []) => {
  if (!variants.length) return "₦0.00";

  const prices = variants.map((v) => v.price_cents);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const currency = variants[0]?.currency || "NGN";

  if (min === max) {
    return formatCurrency(min, currency, true);
  }

  return `${formatCurrency(min, currency, true)} - ${formatCurrency(max, currency, true)}`;
};

/**
 * Get selected variant price (backend response with cents)
 * @param {object} variant - Selected variant
 * @returns {string} Formatted price
 */
export const getVariantPrice = (variant) => {
  if (!variant) return "₦0.00";
  return formatCurrency(variant.price_cents, variant.currency, true);
};
