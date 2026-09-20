// domain/currency.js — the currencies the store sells in. Pure data and
// guards: nothing here knows about React, storage or the API.

export const DEFAULT_CURRENCY = "NGN";

// The API converts prices from NGN on the fly for the other two.
export const CURRENCY_OPTIONS = [
  { code: "NGN", region: "Nigeria", label: "Nigeria - NGN" },
  { code: "GBP", region: "United Kingdom", label: "United Kingdom - GBP" },
  { code: "USD", region: "International", label: "International - USD" },
];

export const isSupportedCurrency = (code) =>
  CURRENCY_OPTIONS.some((option) => option.code === code);

export const getCurrencyOption = (code) =>
  CURRENCY_OPTIONS.find((option) => option.code === code) ||
  CURRENCY_OPTIONS[0];
