const parseQuantity = (value) => {
  if (value == null || String(value).trim() === "") return Number.NaN;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : Number.NaN;
};
const toTrimmedString = (value) => (value == null ? "" : String(value).trim());
const parseDate = (value) =>
  value == null || toTrimmedString(value) === "" ? new Date(Number.NaN) : new Date(value);

export const validateInventoryRow = (row = {}) => {
  row ??= {};
  const errors = [];
  const batchId = toTrimmedString(row.batch_id);
  const sku = toTrimmedString(row.sku);
  const storeCode = toTrimmedString(row.store_code);
  const quantityRemaining = parseQuantity(row.quantity_current);
  const initialQuantity = parseQuantity(row.quantity_received);
  const expirationDate = parseDate(row.expiry_date);
  const receivedDate = parseDate(row.received_date);

  if (!batchId) errors.push("Invalid batch_id");
  if (!sku) errors.push("Invalid sku");
  if (!storeCode) errors.push("Invalid store_code");
  if (!Number.isSafeInteger(quantityRemaining) || quantityRemaining < 0)
    errors.push("Invalid quantity_current");
  if (!Number.isSafeInteger(initialQuantity) || initialQuantity < 0)
    errors.push("Invalid quantity_received");
  if (Number.isSafeInteger(quantityRemaining) && Number.isSafeInteger(initialQuantity) && quantityRemaining > initialQuantity)
    errors.push("quantity_current cannot exceed quantity_received");
  if (Number.isNaN(expirationDate.getTime())) errors.push("Invalid expiry_date");
  if (Number.isNaN(receivedDate.getTime())) errors.push("Invalid received_date");

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      batchId,
      sku,
      storeCode,
      quantityRemaining,
      initialQuantity,
      expirationDate,
      receivedDate,
    },
  };
};
