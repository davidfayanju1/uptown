import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SizeGuideModal from "./SizeGuideModal";
import { normalizeSizeGuide } from "../../utils/sizeGuide";

const sizeGuide = normalizeSizeGuide({
  image_url: "https://cdn.example/diagram.jpg",
  model_info: "Shiva is 180cm wearing size M",
  measurements: [
    { Size: "S" },
    { Size: "M", "Chest (A)": "22", "Total Length (B)": "26" },
  ],
  fit_description: "Relaxed fit, slightly cropped box drop shoulder silhouette",
});

const renderModal = (overrides = {}) =>
  render(
    <SizeGuideModal
      onClose={() => {}}
      modelFitNote={sizeGuide.modelInfo}
      fitNote={sizeGuide.fitDescription}
      sizeGuide={sizeGuide}
      diagramImage={sizeGuide.diagramImage}
      {...overrides}
    />,
  );

describe("SizeGuideModal", () => {
  it("renders a column per measurement label from the API", () => {
    renderModal();

    expect(
      screen.getByRole("columnheader", { name: "Chest (A)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Total Length (B)" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Shoulder" }),
    ).not.toBeInTheDocument();
  });

  it("fills the row for the size that has measurements", () => {
    renderModal();

    const row = screen.getByRole("row", { name: /^M/ });
    expect(row).toHaveTextContent("22");
    expect(row).toHaveTextContent("26");
  });

  it("converts the table to inches when the unit is switched", async () => {
    renderModal();

    await userEvent.click(screen.getByRole("button", { name: "in" }));

    expect(screen.getByRole("row", { name: /^M/ })).toHaveTextContent("8.7");
  });

  it("shows the product diagram and the fit copy", () => {
    renderModal();

    expect(
      screen.getByAltText("Where each garment measurement is taken"),
    ).toHaveAttribute("src", "https://cdn.example/diagram.jpg");
    expect(screen.getByText(/Relaxed fit/)).toBeInTheDocument();
    expect(
      screen.getByText("Shiva is 180cm wearing size M"),
    ).toBeInTheDocument();
  });

  it("hides the fit section when the product has no fit description", () => {
    renderModal({ fitNote: "" });

    expect(screen.queryByText("Fit & Silhouette")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });
});
