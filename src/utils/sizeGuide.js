// Shown when a product carries no measurements yet, so the guide still opens on
// a recognisable chart instead of an empty box.
const DEFAULT_ROW_LABELS = ["XS", "S", "M", "L", "XL", "XXL"];
const DEFAULT_COLUMNS = [
  "Chest (A)",
  "Total Length (B)",
  "Sleeve (C)",
  "Shoulder",
];

const ROW_LABEL_KEYS = ["Size", "size", "SIZE"];

const rowLabelOf = (row) => {
  for (const key of ROW_LABEL_KEYS) {
    if (row[key]) return String(row[key]);
  }
  return "";
};

const hasValue = (value) => value !== null && value !== undefined && value !== "";

// The API names each measurement by the label it should appear under, and the
// set differs per garment, so columns are whatever the rows actually carry.
const columnsOf = (rows) => {
  const seen = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (ROW_LABEL_KEYS.includes(key)) continue;
      if (!hasValue(row[key])) continue;
      if (!seen.includes(key)) seen.push(key);
    }
  }
  return seen;
};

export const normalizeSizeGuide = (sizeGuide) => {
  const measurements = Array.isArray(sizeGuide?.measurements)
    ? sizeGuide.measurements.filter((row) => row && typeof row === "object")
    : [];

  const columns = columnsOf(measurements);
  const rows = columns.length
    ? measurements
        .filter((row) => rowLabelOf(row))
        .map((row) => ({
          label: rowLabelOf(row),
          values: Object.fromEntries(
            columns.map((column) => [column, row[column] ?? ""]),
          ),
        }))
    : DEFAULT_ROW_LABELS.map((label) => ({ label, values: {} }));

  return {
    modelInfo: sizeGuide?.model_info || "",
    fitDescription: sizeGuide?.fit_description?.trim() || "",
    diagramImage: sizeGuide?.image_url || "",
    // Measurements arrive unitless; the backend may start declaring one.
    unit: sizeGuide?.unit === "in" ? "in" : "cm",
    columns: columns.length ? columns : DEFAULT_COLUMNS,
    rows,
  };
};

export const convertMeasurement = (value, fromUnit, toUnit) => {
  if (!hasValue(value)) return "";
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  if (fromUnit === toUnit) return String(value);
  return toUnit === "in"
    ? (number / 2.54).toFixed(1)
    : (number * 2.54).toFixed(1);
};
