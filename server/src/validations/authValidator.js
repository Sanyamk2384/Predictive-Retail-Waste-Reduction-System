const toTrimmedString = (value) => (value == null ? "" : String(value).trim());
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegisterInput = (body = {}) => {
  body ??= {};
  const errors = [];
  const name = toTrimmedString(body.name);
  const email = toTrimmedString(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!name) errors.push("Name is required");
  if (!email || !EMAIL_RE.test(email)) errors.push("A valid email is required");
  if (password.length < 8) errors.push("Password must be at least 8 characters");

  return { isValid: errors.length === 0, errors, data: { name, email, password } };
};

export const validateLoginInput = (body = {}) => {
  body ??= {};
  const errors = [];
  const email = toTrimmedString(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !EMAIL_RE.test(email)) errors.push("A valid email is required");
  if (!password) errors.push("Password is required");

  return { isValid: errors.length === 0, errors, data: { email, password } };
};
