import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Account from "./Account";
import useCurrencyStore from "../stores/currency-store";

vi.mock("../layout/PrimaryLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../stores/auth-store", () => ({
  default: () => ({ user: { email: "shopper@example.com" }, isAuthenticated: true }),
}));

vi.mock("../lib/axios", () => ({
  default: { get: vi.fn().mockResolvedValue({ data: { status: true, data: [] } }) },
  logoutUser: vi.fn(),
}));

const renderAccount = (initialSection = "currency") =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <Account initialSection={initialSection} />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("Account currency section", () => {
  beforeEach(() => {
    useCurrencyStore.setState({ currency: "NGN" });
  });

  it("does not clip a panel opened by a deep link, so the menu can hang below it", () => {
    renderAccount();

    expect(screen.getByTestId("account-panel-currency")).not.toHaveClass(
      "overflow-hidden",
    );
  });

  it("stops clipping a panel the shopper opens once it has finished expanding", async () => {
    const user = userEvent.setup();
    renderAccount(null);

    await user.click(screen.getByRole("button", { name: "Currency" }));

    await waitFor(() =>
      expect(screen.getByTestId("account-panel-currency")).not.toHaveClass(
        "overflow-hidden",
      ),
    );
  });

  it("lets the shopper pick another currency from the menu", async () => {
    const user = userEvent.setup();
    renderAccount();

    await user.click(screen.getByRole("button", { name: /Nigeria - NGN/i }));
    const menu = screen.getByRole("listbox");
    await user.click(
      within(menu).getByRole("button", { name: /United Kingdom - GBP/i }),
    );

    expect(useCurrencyStore.getState().currency).toBe("GBP");
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: /United Kingdom - GBP/i }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});
