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

describe("token refresh", () => {
  const respond = (config, status, data) =>
    status < 400
      ? Promise.resolve({ data, status, headers: {}, config })
      : Promise.reject(
          Object.assign(new Error(`Request failed with status code ${status}`), {
            config,
            response: { status, data },
          }),
        );

  // Stands in for a server that retires a refresh token once it is used.
  const rotatingServer = () => {
    let generation = 1;
    let validRefresh = "refresh-token";
    const refreshCalls = [];

    const adapter = vi.fn((config) => {
      if (config.url.includes("/v1/auth/refresh")) {
        const sent = JSON.parse(config.data).refresh_token;
        refreshCalls.push(sent);
        if (sent !== validRefresh) return respond(config, 401, {});
        generation += 1;
        validRefresh = `refresh-token-${generation}`;
        return respond(config, 200, {
          data: {
            tokens: {
              access_token: `access-token-${generation}`,
              refresh_token: validRefresh,
            },
          },
        });
      }

      const fresh = config.headers.Authorization !== "Bearer access-token";
      return fresh
        ? respond(config, 200, { status: true })
        : respond(config, 401, {});
    });

    return { adapter, refreshCalls };
  };

  let originalAdapter;
  beforeEach(() => {
    vi.useRealTimers();
    originalAdapter = api.defaults.adapter;
  });
  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    vi.useFakeTimers();
  });

  it("refreshes once when several requests find the token expired together", async () => {
    const { adapter, refreshCalls } = rotatingServer();
    api.defaults.adapter = adapter;

    const responses = await Promise.all([
      api.get("/v1/cart"),
      api.get("/v1/orders"),
      api.get("/v1/me/addresses"),
    ]);

    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
    expect(refreshCalls).toEqual(["refresh-token"]);
    expect(useUserStore.getState()).toMatchObject({
      isAuthenticated: true,
      accessToken: "access-token-2",
      refreshToken: "refresh-token-2",
    });
  });

  it("starts a new refresh the next time the token expires", async () => {
    const { adapter, refreshCalls } = rotatingServer();
    api.defaults.adapter = adapter;

    await api.get("/v1/cart");
    useUserStore.getState().setTokens("access-token", "refresh-token-2");
    await api.get("/v1/cart");

    expect(refreshCalls).toEqual(["refresh-token", "refresh-token-2"]);
  });

  it("signs the shopper out when the server refuses the refresh token", async () => {
    api.defaults.adapter = vi.fn((config) => respond(config, 401, {}));

    await expect(api.get("/v1/orders")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(useUserStore.getState().isAuthenticated).toBe(false);
  });

  it("keeps the shopper signed in when the refresh never gets an answer", async () => {
    api.defaults.adapter = vi.fn((config) =>
      config.url.includes("/v1/auth/refresh")
        ? Promise.reject(Object.assign(new Error("Network Error"), { config }))
        : respond(config, 401, {}),
    );

    await expect(api.get("/v1/orders")).rejects.toThrow("Network Error");
    expect(useUserStore.getState()).toMatchObject({
      isAuthenticated: true,
      refreshToken: "refresh-token",
    });
  });

  it("keeps the shopper signed in when the API is erroring", async () => {
    api.defaults.adapter = vi.fn((config) =>
      config.url.includes("/v1/auth/refresh")
        ? respond(config, 503, {})
        : respond(config, 401, {}),
    );

    await expect(api.get("/v1/orders")).rejects.toMatchObject({
      response: { status: 503 },
    });
    expect(useUserStore.getState().isAuthenticated).toBe(true);
  });

  it("adopts the tokens another tab already refreshed instead of signing out", async () => {
    const adapter = vi.fn((config) => {
      if (config.url.includes("/v1/auth/refresh")) {
        // The other tab's refresh landed first and wrote its pair to storage.
        localStorage.setItem(
          "user-storage",
          JSON.stringify({
            state: {
              user: { id: "u1" },
              accessToken: "access-token-other-tab",
              refreshToken: "refresh-token-other-tab",
              isAuthenticated: true,
            },
            version: 0,
          }),
        );
        return respond(config, 401, {});
      }
      return config.headers.Authorization === "Bearer access-token-other-tab"
        ? respond(config, 200, { status: true })
        : respond(config, 401, {});
    });
    api.defaults.adapter = adapter;

    const response = await api.get("/v1/orders");

    expect(response.status).toBe(200);
    expect(useUserStore.getState()).toMatchObject({
      isAuthenticated: true,
      refreshToken: "refresh-token-other-tab",
    });
  });
});
