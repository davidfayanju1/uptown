import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Nav from "./Nav";
import { logoutUser } from "../../lib/axios";
import useUserStore from "../../stores/auth-store";

vi.mock("../../lib/axios", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { status: true, data: [] } })),
    defaults: { headers: { common: {} } },
  },
  logoutUser: vi.fn(),
}));

vi.mock("../../hooks/useCart", () => ({
  useCart: () => ({
    cartCount: 2,
    cartItems: [
      {
        id: "i1",
        product_id: "p1",
        product_title: "DP BOXY TEE",
        quantity: 2,
        unit_price_snapshot_cents: 2000,
        currency: "GBP",
      },
    ],
    isLoading: false,
    removeCartItem: vi.fn(),
  }),
}));

const Location = () => <span data-testid="path">{useLocation().pathname}</span>;

const renderNav = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/cart"]}>
        <Nav />
        <Location />
      </MemoryRouter>
    </QueryClientProvider>,
  );

beforeEach(() => {
  vi.useFakeTimers();
  useUserStore
    .getState()
    .setUserData({ id: "u1", first_name: "Ada" }, "token", "refresh");
});

afterEach(() => {
  vi.useRealTimers();
  useUserStore.getState().clearUserData();
  vi.clearAllMocks();
});

describe("Nav sign out", () => {
  it("signs the shopper out and lands them on home", () => {
    renderNav();

    act(() => {
      screen.getAllByLabelText("Cart")[0].click();
    });
    act(() => {
      screen.getByText("Sign Out").click();
    });

    expect(logoutUser).toHaveBeenCalled();

    // The menu plays its exit animation before the route changes.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("path")).toHaveTextContent("/");
  });

  it("waits for the menu to animate out before changing route", () => {
    renderNav();

    act(() => {
      screen.getAllByLabelText("Cart")[0].click();
    });
    act(() => {
      screen.getByText("Sign Out").click();
    });

    expect(screen.getByTestId("path")).toHaveTextContent("/cart");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("path")).toHaveTextContent("/");
  });
});
