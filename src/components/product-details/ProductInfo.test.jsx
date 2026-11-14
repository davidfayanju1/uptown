import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductInfo from "./ProductInfo";

const product = {
  id: "p1",
  name: "Uptown The Voice Tee",
  description: "Heavyweight cotton tee.",
  details: [],
  sizeGuide: null,
};

const renderInfo = () =>
  render(
    <ProductInfo
      product={product}
      currentPrice="$40.00"
      selectedColor={null}
      selectedSize={null}
      uniqueColors={[]}
      uniqueSizes={[]}
      isColorAvailable={() => true}
      isSizeAvailable={() => true}
      isVariantAvailable={() => true}
      needsColor={false}
      needsSize={false}
      hasAnyAvailableVariant
      isAddingToCart={false}
      onColorSelect={() => {}}
      onSizeSelect={() => {}}
      onAddToCart={() => {}}
    />,
  );

const bookmarkIcon = (button) => button.querySelector("svg");

afterEach(() => {
  localStorage.clear();
});

describe("ProductInfo bookmark", () => {
  it("starts unsaved with an outlined ribbon", () => {
    renderInfo();

    const button = screen.getByRole("button", { name: "Save for later" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(bookmarkIcon(button)).toHaveAttribute("fill", "none");
  });

  it("fills the ribbon and remembers the piece once saved", async () => {
    renderInfo();

    await userEvent.click(screen.getByRole("button", { name: "Save for later" }));

    const button = screen.getByRole("button", { name: "Remove from wishlist" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(bookmarkIcon(button)).toHaveAttribute("fill", "currentColor");
    expect(JSON.parse(localStorage.getItem("uptown:wishlist"))).toEqual(["p1"]);
  });

  it("comes back saved on a later visit", () => {
    localStorage.setItem("uptown:wishlist", JSON.stringify(["p1"]));

    renderInfo();

    expect(
      screen.getByRole("button", { name: "Remove from wishlist" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
