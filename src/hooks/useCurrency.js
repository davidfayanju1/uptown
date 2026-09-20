// hooks/useCurrency.js — the one place the UI reads or changes the display
// currency. Prices are converted server-side (lib/axios.js sends the currency
// with every priced request), so changing it means refetching what's on screen.
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useCurrencyStore from "../stores/currency-store";
import { getCurrencyOption } from "../domain/currency";
import { getCurrencySymbol } from "../utils/currency";

export const useCurrency = () => {
  const queryClient = useQueryClient();
  const currency = useCurrencyStore((state) => state.currency);
  const hasConfirmed = useCurrencyStore((state) => state.hasConfirmed);
  const persistCurrency = useCurrencyStore((state) => state.setCurrency);

  const setCurrency = useCallback(
    (next) => {
      persistCurrency(next);
      if (next !== currency) queryClient.invalidateQueries();
    },
    [currency, persistCurrency, queryClient],
  );

  return {
    currency,
    symbol: getCurrencySymbol(currency),
    option: getCurrencyOption(currency),
    hasConfirmed,
    setCurrency,
  };
};
