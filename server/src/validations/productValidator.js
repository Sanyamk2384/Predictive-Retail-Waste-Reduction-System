const parsePrice = (value) => {
  if (value == null || String(value).trim() === "") return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};
const toTrimmedString = (value) => (value == null ? "" : String(value).trim());

export const validateProductRow = (row = {}) => {
  row ??= {};
  const errors = [];
  const sku = toTrimmedString(row.sku);
  const name = toTrimmedString(row.name);
  const category = toTrimmedString(row.category);
  const costPrice = parsePrice(row.cost_price);
  const sellingPrice = parsePrice(row.selling_price);
  const unit = toTrimmedString(row.unit);
  const shelfLife =
    toTrimmedString(row.shelf_life) === ""
      ? Number.NaN
      : Number(row.shelf_life);

  if (!sku) errors.push("Invalid sku");
  if (!name) errors.push("Invalid name");
  if (!category) errors.push("Invalid category");
  if (!Number.isFinite(costPrice) || costPrice < 0) errors.push("Invalid cost_price");
  if (!Number.isFinite(sellingPrice) || sellingPrice < 0)
    errors.push("Invalid selling_price");
  if (!["pcs", "kg", "g", "pack"].includes(unit))
    errors.push("Invalid unit");
  if (!Number.isSafeInteger(shelfLife) || shelfLife < 1)
    errors.push("Invalid shelf_life");

  return {
    isValid: errors.length === 0,
    errors,
    data: { sku, name, category, costPrice, sellingPrice, unit, shelfLife },
  };
};
