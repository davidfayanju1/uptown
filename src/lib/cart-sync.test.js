import { afterEach, describe, expect, it } from "vitest";
import { notifyCartChanged } from "./cart-sync";
import { queryClient } from "./query-client";

let otherTab;

afterEach(() => {
  otherTab?.close();
  queryClient.clear();
});

const nextMessage = (channel) =>
  new Promise((resolve) => {
    channel.onmessage = (event) => resolve(event.data);
  });

describe("cart sync", () => {
  it("tells the other tabs the cart changed", async () => {
    otherTab = new BroadcastChannel("cart");
    const received = nextMessage(otherTab);

    notifyCartChanged();

    await expect(received).resolves.toBe("invalidate");
  });

  it("marks this tab's cart stale when another tab changes it", async () => {
    queryClient.setQueryData(["cart"], { items: [] });
    otherTab = new BroadcastChannel("cart");

    otherTab.postMessage("invalidate");

    await expect
      .poll(() => queryClient.getQueryState(["cart"]).isInvalidated)
      .toBe(true);
  });
});
