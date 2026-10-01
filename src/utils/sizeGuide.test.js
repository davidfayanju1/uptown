import { describe, expect, it } from "vitest";
import { convertMeasurement, normalizeSizeGuide } from "./sizeGuide";

const API_SIZE_GUIDE = {
  image_url: "",
  model_info: "Shiva is 180cm wearing size M",
  measurements: [
    { Size: "XS" },
    { Size: "S" },
    {
      Size: "M",
      "Chest (A)": "22",
      "Sleeve (C)": "24",
      "Total Length (B)": "26",
    },
    { Size: "L" },
    { Size: "XL" },
  ],
  fit_description: "Relaxed fit, slightly cropped box drop shoulder silhouette ",
};

describe("normalizeSizeGuide", () => {
  it("takes its columns from the labels the measurements carry", () => {
    const guide = normalizeSizeGuide(API_SIZE_GUIDE);

    expect(guide.columns).toEqual([
      "Chest (A)",
      "Sleeve (C)",
      "Total Length (B)",
    ]);
  });

  it("keeps the API row order and blanks the sizes with no measurements", () => {
    const { rows } = normalizeSizeGuide(API_SIZE_GUIDE);

    expect(rows.map((row) => row.label)).toEqual(["XS", "S", "M", "L", "XL"]);
    expect(rows[2].values).toEqual({
      "Chest (A)": "22",
      "Sleeve (C)": "24",
      "Total Length (B)": "26",
    });
    expect(rows[0].values).toEqual({
      "Chest (A)": "",
      "Sleeve (C)": "",
      "Total Length (B)": "",
    });
  });

  it("carries the fit copy and trims the trailing space", () => {
    const guide = normalizeSizeGuide(API_SIZE_GUIDE);

    expect(guide.modelInfo).toBe("Shiva is 180cm wearing size M");
    expect(guide.fitDescription).toBe(
      "Relaxed fit, slightly cropped box drop shoulder silhouette",
    );
    expect(guide.diagramImage).toBe("");
    expect(guide.unit).toBe("cm");
  });

  it("reads the declared unit when the API sends one", () => {
    expect(normalizeSizeGuide({ ...API_SIZE_GUIDE, unit: "in" }).unit).toBe("in");
  });

  it("falls back to the standard chart when there is no guide", () => {
    const guide = normalizeSizeGuide(undefined);

    expect(guide.rows.map((row) => row.label)).toEqual([
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ]);
    expect(guide.columns).toContain("Chest (A)");
    expect(guide.modelInfo).toBe("");
    expect(guide.fitDescription).toBe("");
  });

  it("falls back when every measurement row is empty", () => {
    const guide = normalizeSizeGuide({
      measurements: [{ Size: "S" }, { Size: "M" }],
    });

    expect(guide.rows).toHaveLength(6);
  });

  it("ignores rows that are not objects", () => {
    const guide = normalizeSizeGuide({
      measurements: [null, "M", { Size: "M", Shoulder: "18" }],
    });

    expect(guide.columns).toEqual(["Shoulder"]);
    expect(guide.rows).toEqual([{ label: "M", values: { Shoulder: "18" } }]);
  });
});

describe("convertMeasurement", () => {
  it("leaves values alone when the units match", () => {
    expect(convertMeasurement("22", "cm", "cm")).toBe("22");
  });

  it("converts between centimetres and inches", () => {
    expect(convertMeasurement("50.8", "cm", "in")).toBe("20.0");
    expect(convertMeasurement("20", "in", "cm")).toBe("50.8");
  });

  it("passes through blanks and non-numeric values", () => {
    expect(convertMeasurement("", "cm", "in")).toBe("");
    expect(convertMeasurement(undefined, "cm", "in")).toBe("");
    expect(convertMeasurement("one size", "cm", "in")).toBe("one size");
  });
});
