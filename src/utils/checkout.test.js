import { describe, expect, it } from "vitest";
import { buildQuotePayload } from "./checkout";

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
});
