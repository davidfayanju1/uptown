import { describe, expect, it } from "vitest";
import { buildQuotePayload, describeCheckoutError } from "./checkout";

const formData = {
  email: "buyer@example.com",
  firstName: "John",
  lastName: "Doe",
  address: "12 Broad Street",
  city: "Lagos",
  state: "Lagos",
  zipCode: "100001",
  phone: "08012345678",
};

describe("buildQuotePayload", () => {
  it("leaves the cart to the server instead of naming a cached cart id", () => {
    expect(buildQuotePayload(formData, "fez", "NGN")).not.toHaveProperty(
      "cart_id",
    );
  });

  it("translates the form into the API's address shape", () => {
    expect(buildQuotePayload(formData, "fez", "NGN")).toEqual({
      contact: { email: "buyer@example.com" },
      shipping_address: {
        first_name: "John",
        last_name: "Doe",
        line1: "12 Broad Street",
        city: "Lagos",
        state: "Lagos",
        zip: "100001",
        phone: "08012345678",
        country: "NG",
      },
      shipping_option_id: "fez",
      currency: "NGN",
    });
  });

  it("sends UK orders to GB with the phone in international form", () => {
    const payload = buildQuotePayload(
      { ...formData, state: "Greater Manchester", phone: "+44 7700 900123" },
      undefined,
      "GBP",
    );

    expect(payload.shipping_address).toMatchObject({
      country: "GB",
      state: "Greater Manchester",
      phone: "+447700900123",
    });
    expect(payload.currency).toBe("GBP");
    expect(payload.shipping_option_id).toBeUndefined();
  });

  it("sends international orders to the US", () => {
    expect(
      buildQuotePayload({ ...formData, state: "NY" }, "easyship:abc", "USD"),
    ).toMatchObject({
      shipping_address: { country: "US", state: "NY" },
      shipping_option_id: "easyship:abc",
      currency: "USD",
    });
  });

  it("never names a saved address", () => {
    expect(
      buildQuotePayload({ ...formData, id: "addr-1" }, undefined, "GBP"),
    ).not.toHaveProperty("address_id");
  });
});

describe("describeCheckoutError", () => {
  it("turns a missing courier into an instruction", () => {
    expect(describeCheckoutError("shipping_option_required")).toBe(
      "Please choose a delivery option to continue.",
    );
  });

  it("passes other messages through", () => {
    expect(describeCheckoutError("Card declined")).toBe("Card declined");
    expect(describeCheckoutError(undefined)).toBeNull();
  });
});
