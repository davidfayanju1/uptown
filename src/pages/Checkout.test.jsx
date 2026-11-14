import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Checkout from "./Checkout";
import api from "../lib/axios";
import useCurrencyStore from "../stores/currency-store";

const cartState = vi.hoisted(() => ({ coupon: null }));

vi.mock("../hooks/useCart", () => ({
  useCart: () => ({
    cartItems: [
      {
        id: "i1",
        product_title: "DP BOXY TEE",
        quantity: 1,
        weight_grams: 400,
        unit_price_snapshot_cents: 4139,
        variant_images: [],
      },
    ],
    cartCoupon: cartState.coupon,
    isLoading: false,
  }),
}));

vi.mock("../hooks/useGatewayBackGuard", () => ({
  useGatewayBackGuard: () => {},
  markGatewayHandoff: () => {},
}));

vi.mock("../stores/auth-store", () => ({
  default: () => ({ user: null }),
}));

vi.mock("../lib/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const ROYAL_MAIL = "easyship:f9be6b22";

const couriers = [
  {
    id: ROYAL_MAIL,
    name: "Royal Mail - Domestic Tracked 48",
    amount: 7580.5,
    currency: "NGN",
    eta: "1-3 day(s)",
  },
  {
    id: "easyship:d70f503c",
    name: "Evri - Parcelshop",
    amount: 8150,
    currency: "NGN",
    eta: "2-5 day(s)",
  },
];

const quoteResponse = (overrides = {}) => ({
  data: {
    status: true,
    data: {
      shipping_options: couriers,
      totals: {
        currency: "GBP",
        subtotal_cents: 4139,
        shipping_cents: 0,
        grand_total_cents: 4139,
      },
      checkout_token: "token-1",
      ...overrides,
    },
  },
});

const quoteCalls = () =>
  api.post.mock.calls.filter(([url]) => url === "/v1/checkout/quote");

const renderCheckout = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    </QueryClientProvider>,
  );

const fillAddress = async (user, fields) => {
  await user.type(screen.getByPlaceholderText("Email *"), "jane@example.com");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Checkout as a Guest" }));

  await user.type(screen.getByLabelText("First name *"), "Jane");
  await user.type(screen.getByLabelText("Last name *"), "Doe");
  await user.type(screen.getByLabelText("Address *"), "1 Deansgate");
  await user.type(screen.getByLabelText("City *"), fields.city);
  await fields.fillState(user);
  await user.type(screen.getByLabelText(fields.zipLabel), fields.zip);
  await user.type(screen.getByLabelText("Mobile number *"), fields.phone);
};

const ukAddress = {
  city: "Manchester",
  fillState: (user) =>
    user.type(screen.getByLabelText("County *"), "Greater Manchester"),
  zipLabel: "Postal Code *",
  zip: "M3 1AZ",
  phone: "+447700900123",
};

describe("Checkout outside Nigeria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { status: true, data: [] } });
    api.post.mockResolvedValue(quoteResponse());
    useCurrencyStore.setState({ currency: "GBP" });
  });

  it("quotes a UK address for couriers instead of asking for state rates", async () => {
    const user = userEvent.setup();
    renderCheckout();
    await fillAddress(user, ukAddress);

    expect(
      await screen.findByText(
        "Royal Mail - Domestic Tracked 48",
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Evri - Parcelshop")).toBeInTheDocument();

    const [, payload] = quoteCalls().at(-1);
    expect(payload).toMatchObject({
      currency: "GBP",
      shipping_address: {
        country: "GB",
        state: "Greater Manchester",
        zip: "M3 1AZ",
        phone: "+447700900123",
      },
    });
    expect(payload.shipping_option_id).toBeUndefined();
    expect(
      api.get.mock.calls.some(([url]) => url.startsWith("/v1/shipping/")),
    ).toBe(false);
  });

  it("never shows the couriers' NGN amounts", async () => {
    const user = userEvent.setup();
    renderCheckout();
    await fillAddress(user, ukAddress);
    await screen.findByText("Evri - Parcelshop", {}, { timeout: 3000 });

    expect(document.body.textContent).not.toMatch(/7,580|8,150|₦/);
    expect(
      screen.getByRole("button", { name: "Select a shipping method" }),
    ).toBeDisabled();
  });

  it("re-quotes with the chosen courier and shows its price in pounds", async () => {
    const user = userEvent.setup();
    renderCheckout();
    await fillAddress(user, ukAddress);
    await screen.findByText("Evri - Parcelshop", {}, { timeout: 3000 });

    api.post.mockResolvedValue(
      quoteResponse({
        totals: {
          currency: "GBP",
          subtotal_cents: 4139,
          shipping_cents: 361,
          grand_total_cents: 4500,
        },
        checkout_token: "token-2",
      }),
    );
    await user.click(
      screen.getByRole("radio", { name: /Royal Mail - Domestic Tracked 48/ }),
    );

    await waitFor(() =>
      expect(quoteCalls().at(-1)[1].shipping_option_id).toBe(ROYAL_MAIL),
    );
    expect((await screen.findAllByText("£3.61")).length).toBeGreaterThan(0);
    expect(screen.getByText("£45")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Generate Quote/ }),
    ).toBeEnabled();
  });

  it("waits for a phone number with a country code before quoting", async () => {
    const user = userEvent.setup();
    renderCheckout();
    await fillAddress(user, { ...ukAddress, phone: "07700900123" });

    await new Promise((resolve) => setTimeout(resolve, 900));
    expect(quoteCalls()).toHaveLength(0);
    expect(screen.getByText(/Include the country code/)).toHaveClass(
      "text-red-600",
    );
  });

  it("offers a retry when no courier can deliver to the address", async () => {
    api.post.mockResolvedValue(quoteResponse({ shipping_options: [] }));
    const user = userEvent.setup();
    renderCheckout();
    await fillAddress(user, ukAddress);

    expect(
      await screen.findByText(
        /We couldn't find delivery options for this address/,
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();

    api.post.mockResolvedValue(quoteResponse());
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByText("Evri - Parcelshop", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it("takes a US state as its two-letter code", async () => {
    useCurrencyStore.setState({ currency: "USD" });
    const user = userEvent.setup();
    renderCheckout();
    await fillAddress(user, {
      city: "New York",
      fillState: (u) =>
        u.selectOptions(screen.getByLabelText("State *"), "New York"),
      zipLabel: "ZIP code *",
      zip: "10001",
      phone: "+12125550123",
    });
    await screen.findByText("Evri - Parcelshop", {}, { timeout: 3000 });

    expect(quoteCalls().at(-1)[1]).toMatchObject({
      currency: "USD",
      shipping_address: { country: "US", state: "NY", zip: "10001" },
    });
  });
});

describe("Checkout in Nigeria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCurrencyStore.setState({ currency: "NGN" });
    api.get.mockImplementation((url) =>
      Promise.resolve({
        data: {
          status: true,
          data: url.startsWith("/v1/shipping/states")
            ? [{ id: 1, state: "Lagos" }]
            : [{ id: "fez", name: "FEZ Delivery", amount: 3500, currency: "NGN", eta: "2 days" }],
        },
      }),
    );
  });

  it("still prices delivery by state through the rates endpoint", async () => {
    const user = userEvent.setup();
    renderCheckout();

    await user.type(screen.getByPlaceholderText("Email *"), "ada@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Checkout as a Guest" }));
    await user.selectOptions(await screen.findByLabelText("State *"), "Lagos");

    expect(await screen.findByText("FEZ Delivery")).toBeInTheDocument();
    expect(screen.getAllByText("₦3,500").length).toBeGreaterThan(0);
    expect(
      api.get.mock.calls.some(([url]) =>
        url.startsWith("/v1/shipping/rates?state=Lagos"),
      ),
    ).toBe(true);
    expect(quoteCalls()).toHaveLength(0);
  });
});

describe("Checkout promo code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCurrencyStore.setState({ currency: "NGN" });
    cartState.coupon = "WELCOME10";
    api.get.mockResolvedValue({ data: { status: true, data: [] } });
  });

  afterEach(() => {
    cartState.coupon = null;
  });

  it("removes an applied code from the cart", async () => {
    api.delete.mockImplementation(() => {
      cartState.coupon = null;
      return Promise.resolve({ data: { status: true } });
    });
    const user = userEvent.setup();
    renderCheckout();

    expect(screen.getByText("WELCOME10")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(api.delete).toHaveBeenCalledWith("/v1/cart/coupon");
    await waitFor(() =>
      expect(screen.queryByText("WELCOME10")).not.toBeInTheDocument(),
    );
    expect(screen.getByPlaceholderText("Enter promo code")).toBeInTheDocument();
  });

  it("keeps the code and says so when it can't be removed", async () => {
    api.delete.mockRejectedValue({
      response: { data: { message: "Something went wrong" } },
    });
    const user = userEvent.setup();
    renderCheckout();

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("WELCOME10")).toBeInTheDocument();
  });
});
