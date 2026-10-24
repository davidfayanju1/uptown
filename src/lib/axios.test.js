import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api, { getSessionId, logoutUser, setSessionId } from "./axios";
import { queryClient } from "./query-client";
import useUserStore from "../stores/auth-store";

const signIn = () => {
  useUserStore
    .getState()
    .setUserData({ id: "u1" }, "access-token", "refresh-token");
  localStorage.setItem("refresh_token", "refresh-token");
  api.defaults.headers.common["Authorization"] = "Bearer access-token";
  setSessionId("session-1");
  queryClient.setQueryData(["cart"], {
    items: [{ id: "i1", quantity: 1 }],
    cart: { coupon_code: "WELCOME10" },
  });
  queryClient.setQueryData(["me", "addresses"], [{ id: "a1" }]);
  queryClient.setQueryData(["orders"], [{ id: "o1" }]);
  queryClient.setQueryData(["order", "o1"], { id: "o1" });
  queryClient.setQueryData(["allProducts"], [{ id: "p1" }]);
  queryClient.setQueryData(["shippingStates"], ["Lagos"]);
};

beforeEach(() => {
  vi.useFakeTimers();
  signIn();
});

afterEach(() => {
  // Let the guard that debounces repeat logouts expire between tests.
  vi.advanceTimersByTime(1000);
  vi.useRealTimers();
  queryClient.clear();
  localStorage.clear();
});

describe("logoutUser", () => {
  it("clears the signed-in user from the store", () => {
    logoutUser();

    expect(useUserStore.getState().user).toBeNull();
    expect(useUserStore.getState().accessToken).toBeNull();
    expect(useUserStore.getState().isAuthenticated).toBe(false);
  });

  it("drops both tokens and the Authorization header", () => {
    logoutUser();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(api.defaults.headers.common["Authorization"]).toBeUndefined();
  });

  it("clears the session id so the next shopper starts a new one", () => {
    logoutUser();

    expect(getSessionId()).toBeNull();
    expect(localStorage.getItem("x-session-id")).toBeNull();
  });

  it("drops the shopper's cached queries so none of it can be reused", () => {
    expect(queryClient.getQueryData(["cart"])).toBeDefined();

    logoutUser();

    expect(queryClient.getQueryData(["cart"])).toBeUndefined();
    expect(queryClient.getQueryData(["me", "addresses"])).toBeUndefined();
    expect(queryClient.getQueryData(["orders"])).toBeUndefined();
    expect(queryClient.getQueryData(["order", "o1"])).toBeUndefined();
  });

  it("keeps the catalogue and shipping states, which belong to nobody", () => {
    logoutUser();

    expect(queryClient.getQueryData(["allProducts"])).toEqual([{ id: "p1" }]);
    expect(queryClient.getQueryData(["shippingStates"])).toEqual(["Lagos"]);
  });

  it("ignores a repeat call until the guard expires", () => {
    logoutUser();
    signIn();

    logoutUser();
    expect(useUserStore.getState().isAuthenticated).toBe(true);

    vi.advanceTimersByTime(1000);
    logoutUser();
    expect(useUserStore.getState().isAuthenticated).toBe(false);
  });
});

describe("api client", () => {
  const conflict = (config) =>
    Promise.reject(
      Object.assign(new Error("Request failed with status code 409"), {
        config,
        response: {
          status: 409,
          data: {
            message: "cart_stale_refresh_required",
            errors: { active_cart_id: "u", requested_cart_id: "gB" },
          },
        },
      }),
    );
  const ok = (config) =>
    Promise.resolve({ data: { status: true }, status: 200, headers: {}, config });

  let originalAdapter;
  beforeEach(() => {
    originalAdapter = api.defaults.adapter;
  });
  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  it("sends cookies so the server can find the session's cart", () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("retries a stale-cart quote once without the cart id", async () => {
    const adapter = vi.fn().mockImplementationOnce(conflict).mockImplementation(ok);
    api.defaults.adapter = adapter;

    const response = await api.post("/v1/checkout/quote", {
      cart_id: "gB",
      contact: { email: "buyer@example.com" },
    });

    expect(response.data).toEqual({ status: true });
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(JSON.parse(adapter.mock.calls[1][0].data)).toEqual({
      contact: { email: "buyer@example.com" },
    });
    expect(queryClient.getQueryState(["cart"]).isInvalidated).toBe(true);
  });

  it("gives up after one retry rather than looping", async () => {
    const adapter = vi.fn().mockImplementation(conflict);
    api.defaults.adapter = adapter;

    await expect(
      api.post("/v1/checkout/quote", { cart_id: "gB" }),
    ).rejects.toMatchObject({ response: { status: 409 } });
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it("leaves other conflicts to the caller", async () => {
    const adapter = vi.fn().mockImplementation((config) =>
      Promise.reject(
        Object.assign(new Error("conflict"), {
          config,
          response: { status: 409, data: { message: "insufficient_stock" } },
        }),
      ),
    );
    api.defaults.adapter = adapter;

    await expect(api.post("/v1/cart/items", {})).rejects.toMatchObject({
      response: { data: { message: "insufficient_stock" } },
    });
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});
