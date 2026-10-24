import { queryClient } from "./query-client";

// Every tab in this browser shares one server-side cart, so a change made in
// one tab tells the others to refetch. Other browsers catch up through the
// cart query's focus refetch and polling instead — a channel can't reach them.
const channel =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("cart") : null;

if (channel) {
  channel.onmessage = () => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };
}

export const notifyCartChanged = () => {
  channel?.postMessage("invalidate");
};
