import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import env from "../config/env.js";
import { validateRegisterInput, validateLoginInput } from "../validations/authValidator.js";

const invalidRequest = (message) => Object.assign(new Error(message), { status: 400 });
const unauthorized = (message) => Object.assign(new Error(message), { status: 401 });

const SALT_ROUNDS = 10;

const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), email: user.email }, env.jwt_secret, {
    expiresIn: env.jwt_expires_in,
  });

export const registerUser = async (body) => {
  const validation = validateRegisterInput(body);
  if (!validation.isValid) throw invalidRequest(validation.errors.join(", "));

  const existing = await User.findOne({ email: validation.data.email }).select("_id");
  if (existing) throw invalidRequest("An account with this email already exists");

  const passwordHash = await bcrypt.hash(validation.data.password, SALT_ROUNDS);
  const user = await User.create({
    name: validation.data.name,
    email: validation.data.email,
    passwordHash,
  });

  return { user: toSafeUser(user), token: signToken(user) };
};

export const loginUser = async (body) => {
  const validation = validateLoginInput(body);
  if (!validation.isValid) throw invalidRequest(validation.errors.join(", "));

  const user = await User.findOne({ email: validation.data.email }).select("+passwordHash");
  if (!user) throw unauthorized("Invalid email or password");

  const matches = await bcrypt.compare(validation.data.password, user.passwordHash);
  if (!matches) throw unauthorized("Invalid email or password");

  return { user: toSafeUser(user), token: signToken(user) };
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw unauthorized("User not found");
  return toSafeUser(user);
};
