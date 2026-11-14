// domain/shipping.js — where each region ships to and how its delivery is
// priced. Pure data and guards: nothing here knows about React or the API.
import { getCurrencyOption } from "./currency";

// The region the shopper picked decides the destination; they are never asked
// for a country. "International" is the United States only.
const DESTINATIONS = {
  NGN: { country: "NG", name: "Nigeria" },
  GBP: { country: "GB", name: "United Kingdom" },
  USD: { country: "US", name: "United States" },
};

export const getDestination = (currency) =>
  DESTINATIONS[getCurrencyOption(currency).code];

// Nigeria is priced by state through FEZ. Everywhere else the couriers come
// back on the checkout quote, and only once the whole address is known.
export const usesCourierQuote = (country) => country !== "NG";

const ADDRESS_FIELDS = {
  NG: {
    stateLabel: "State",
    zipLabel: "ZIP code",
    phonePlaceholder: "Mobile number",
  },
  GB: {
    stateLabel: "County",
    zipLabel: "Postal Code",
    phonePlaceholder: "+44 7700 900123",
  },
  US: {
    stateLabel: "State",
    zipLabel: "ZIP code",
    phonePlaceholder: "+1 212 555 0123",
  },
};

export const getAddressFields = (country) =>
  ADDRESS_FIELDS[country] || ADDRESS_FIELDS.NG;

export const normalisePhone = (phone) =>
  String(phone || "").replace(/[\s().-]/g, "");

// Couriers outside Nigeria need the number in international form.
export const hasCountryCode = (phone) =>
  /^\+\d{8,15}$/.test(normalisePhone(phone));

export const isCourierAddressComplete = (form) =>
  [
    form.email,
    form.firstName,
    form.lastName,
    form.address,
    form.city,
    form.state,
    form.zipCode,
  ].every((value) => String(value || "").trim()) && hasCountryCode(form.phone);

// The API takes the two-letter code, not the state's name.
export const US_STATES = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "District of Columbia"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
].map(([code, name]) => ({ code, name }));
