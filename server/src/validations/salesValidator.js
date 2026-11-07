const parseMoney = (value) => {
  if (value == null || String(value).trim() === "") return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};
const toTrimmedString = (value) => (value == null ? "" : String(value).trim());
const parseDate = (value) =>
  value == null || toTrimmedString(value) === "" ? new Date(Number.NaN) : new Date(value);

export const validateSalesRow = (row = {}) => {
  row ??= {};
  const errors = [];
  const sku = toTrimmedString(row.sku);
  const storeCode = toTrimmedString(row.store_code);
  const quantitySold =
    toTrimmedString(row.quantity_sold) === ""
      ? Number.NaN
      : Number(row.quantity_sold);
  const date = parseDate(row.date);
  const totalAmount = parseMoney(row.revenue);
  const discountAppliedPercentage =
    toTrimmedString(row.discount_applied) === ""
      ? 0
      : parseMoney(row.discount_applied);

  if (!sku) errors.push("Invalid sku");
  if (!storeCode) errors.push("Invalid store_code");
  if (!Number.isSafeInteger(quantitySold) || quantitySold < 1)
    errors.push("Invalid quantity_sold");
  if (Number.isNaN(date.getTime())) errors.push("Invalid date");
  if (!Number.isFinite(totalAmount) || totalAmount < 0)
    errors.push("Invalid revenue");
  if (
    !Number.isFinite(discountAppliedPercentage) ||
    discountAppliedPercentage < 0 ||
    discountAppliedPercentage > 100
  ) {
    errors.push("Invalid discount_applied");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { sku, storeCode, quantitySold, date, totalAmount, discountAppliedPercentage },
  };
};
