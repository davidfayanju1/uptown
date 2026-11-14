import { describe, expect, it } from "vitest";
import {
  getAddressFields,
  getDestination,
  hasCountryCode,
  isCourierAddressComplete,
  normalisePhone,
  usesCourierQuote,
  US_STATES,
} from "./shipping";

const address = {
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  address: "1 Deansgate",
  city: "Manchester",
  state: "Greater Manchester",
  zipCode: "M3 1AZ",
  phone: "+44 7700 900123",
};

describe("getDestination", () => {
  it("maps each region to the country it ships to", () => {
    expect(getDestination("NGN").country).toBe("NG");
    expect(getDestination("GBP").country).toBe("GB");
    expect(getDestination("USD").country).toBe("US");
  });

  it("falls back to Nigeria for a currency the store doesn't sell in", () => {
    expect(getDestination("EUR").country).toBe("NG");
  });
});

describe("usesCourierQuote", () => {
  it("keeps Nigeria on state-based rates and quotes couriers elsewhere", () => {
    expect(usesCourierQuote("NG")).toBe(false);
    expect(usesCourierQuote("GB")).toBe(true);
    expect(usesCourierQuote("US")).toBe(true);
  });
});

describe("getAddressFields", () => {
  it("asks UK shoppers for a county and a postal code", () => {
    expect(getAddressFields("GB")).toMatchObject({
      stateLabel: "County",
      zipLabel: "Postal Code",
    });
  });

  it("asks US shoppers for a state and a ZIP code", () => {
    expect(getAddressFields("US")).toMatchObject({
      stateLabel: "State",
      zipLabel: "ZIP code",
    });
  });
});

describe("phone numbers", () => {
  it("strips the punctuation shoppers type", () => {
    expect(normalisePhone("+1 (212) 555-0123")).toBe("+12125550123");
  });

  it("accepts a number only when it carries a country code", () => {
    expect(hasCountryCode("+44 7700 900123")).toBe(true);
    expect(hasCountryCode("07700 900123")).toBe(false);
    expect(hasCountryCode("+44")).toBe(false);
    expect(hasCountryCode("")).toBe(false);
  });
});

describe("isCourierAddressComplete", () => {
  it("passes a fully typed address", () => {
    expect(isCourierAddressComplete(address)).toBe(true);
  });

  it.each(["email", "firstName", "lastName", "address", "city", "state", "zipCode"])(
    "fails without %s",
    (field) => {
      expect(isCourierAddressComplete({ ...address, [field]: " " })).toBe(false);
    },
  );

  it("fails when the phone has no country code", () => {
    expect(isCourierAddressComplete({ ...address, phone: "07700900123" })).toBe(
      false,
    );
  });
});

describe("US_STATES", () => {
  it("lists every state plus DC by its two-letter code", () => {
    expect(US_STATES).toHaveLength(51);
    expect(US_STATES.every((state) => /^[A-Z]{2}$/.test(state.code))).toBe(true);
    expect(US_STATES).toContainEqual({ code: "NY", name: "New York" });
  });
});
