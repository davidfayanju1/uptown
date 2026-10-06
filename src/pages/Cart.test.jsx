import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cart from "./Cart";

const cartItems = [
  {
    id: "i1",
    product_id: "p1",
    product_title: "DP STEP IN2 D LIGHT",
    sku: "DPSIN2L",
    color: "Grey",
    size: "M",
    quantity: 1,
    unit_price_snapshot_cents: 3679,
    currency: "GBP",
    variant_images: ["https://cdn.example/shirt.jpg"],
  },
  {
    id: "i2",
    product_id: "p2",
    product_title: "DP BOXY TEE",
    sku: "DPBT",
    color: "Black",
    size: "L",
    quantity: 3,
    unit_price_snapshot_cents: 2000,
    currency: "GBP",
    variant_images: [],
  },
];

vi.mock("../hooks/useCart", () => ({
  useCart: () => ({
    cartItems,
    isLoading: false,
    error: null,
    refetchCart: vi.fn(),
    updateCartItem: vi.fn(),
    removeCartItem: vi.fn(),
    isRemovingFromCart: false,
  }),
}));

vi.mock("../hooks/useGatewayBackGuard", () => ({
  useGatewayBackGuard: () => {},
}));

vi.mock("../layout/PrimaryLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

// The page renders both layouts and hides one with a Tailwind class, so the
// assertions have to say which of the two they mean.
const renderCart = () => {
  const { container } = render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>,
  );
  return {
    mobileList: container.querySelector(".md\\:hidden.space-y-4"),
  };
};

describe("Cart", () => {
  it("shows each item's unit price on the mobile card", () => {
    const { mobileList } = renderCart();

    const card = within(mobileList).getByText("DP STEP IN2 D LIGHT").closest(
      "div.relative",
    );
    expect(within(card).getByText("£36.79")).toBeInTheDocument();
  });

  it("shows a line total on the mobile card once quantity passes one", () => {
    const { mobileList } = renderCart();

    const card = within(mobileList)
      .getByText("DP BOXY TEE")
      .closest("div.relative");
    expect(within(card).getByText("£20.00")).toBeInTheDocument();
    expect(within(card).getByText("Line total")).toBeInTheDocument();
    expect(within(card).getByText("£60.00")).toBeInTheDocument();
  });

  it("leaves the line total off a single-quantity item", () => {
    const { mobileList } = renderCart();

    const card = within(mobileList)
      .getByText("DP STEP IN2 D LIGHT")
      .closest("div.relative");
    expect(within(card).queryByText("Line total")).not.toBeInTheDocument();
  });

  it("keeps the price in the desktop table", () => {
    renderCart();

    expect(screen.getAllByText("£36.79").length).toBeGreaterThan(1);
  });
});
