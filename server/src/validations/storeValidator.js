const toTrimmedString = (value) => (value == null ? "" : String(value).trim());

export const validateStoreRow = (row = {}) => {
  row ??= {};
  const errors = [];
  const storeCode = toTrimmedString(row.store_code);
  const name = toTrimmedString(row.name);
  const location = toTrimmedString(row.location);

  if (!storeCode) errors.push("Invalid store_code");
  if (!name) errors.push("Invalid name");
  if (!location) errors.push("Invalid location");

  return {
    isValid: errors.length === 0,
    errors,
    data: { name, storeCode, location },
  };
};
