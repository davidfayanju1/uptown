// stores/currency-store.js — the shopper's display currency. Persisted so the
// choice made on the welcome screen survives reloads and new tabs.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CURRENCY, isSupportedCurrency } from "../domain/currency";

const useCurrencyStore = create(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      // False until the shopper confirms a currency on the welcome screen
      hasConfirmed: false,

      setCurrency: (currency) => {
        if (!isSupportedCurrency(currency)) return;
        set({ currency, hasConfirmed: true });
      },
    }),
    {
      name: "currency-storage",
      // A currency we stop supporting must not survive in storage
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        currency: isSupportedCurrency(persisted?.currency)
          ? persisted.currency
          : DEFAULT_CURRENCY,
      }),
    },
  ),
);

export default useCurrencyStore;
