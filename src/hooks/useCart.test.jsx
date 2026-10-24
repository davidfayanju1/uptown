import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCart } from "./useCart";
import { notifyCartChanged } from "../lib/cart-sync";

vi.mock("../services/cartServices", () => ({
  fetchCart: vi.fn(async () => ({ items: [{ id: "i1", quantity: 2 }] })),
  addToCartAPI: vi.fn(async () => ({ status: true })),
  updateCartItemAPI: vi.fn(async () => ({ status: true })),
  removeCartItemAPI: vi.fn(async () => ({ status: true })),
}));

vi.mock("../lib/cart-sync", () => ({ notifyCartChanged: vi.fn() }));

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

let queryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false },
    },
  });
});

afterEach(() => {
  queryClient.clear();
  vi.clearAllMocks();
});

const renderUseCart = (options) =>
  renderHook(() => useCart(options), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

const cartObserverOptions = () =>
  queryClient.getQueryCache().find({ queryKey: ["cart"] }).observers[0]
    .options;

describe("useCart", () => {
  it("never treats the cached cart as current, overriding the app default", async () => {
    const { result } = renderUseCart();
    await waitFor(() => expect(result.current.cartCount).toBe(2));

    expect(cartObserverOptions()).toMatchObject({
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: false,
    });
  });

  it("polls only when asked to", async () => {
    const { result } = renderUseCart({ poll: true });
    await waitFor(() => expect(result.current.cartCount).toBe(2));

    expect(cartObserverOptions().refetchInterval).toBe(30_000);
  });

  it.each([
    ["adding", (cart) => cart.addToCart({ variantId: "v1", quantity: 1 })],
    ["updating", (cart) => cart.updateCartItem({ itemId: "i1", quantity: 3 })],
    ["removing", (cart) => cart.removeCartItem({ itemId: "i1" })],
  ])("tells the other tabs after %s an item", async (_label, mutate) => {
    const { result } = renderUseCart();
    await waitFor(() => expect(result.current.cartCount).toBe(2));

    act(() => mutate(result.current));

    await waitFor(() => expect(notifyCartChanged).toHaveBeenCalledTimes(1));
  });
});
