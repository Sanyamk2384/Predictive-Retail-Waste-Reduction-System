import { registerUser, loginUser, getUserById } from "../services/auth.service.js";

export const register = async (req, res) => {
  const { user, token } = await registerUser(req.body);
  return res.status(201).json({ success: true, message: "Account created successfully", data: { user, token } });
};

export const login = async (req, res) => {
  const { user, token } = await loginUser(req.body);
  return res.status(200).json({ success: true, message: "Logged in successfully", data: { user, token } });
};

export const me = async (req, res) => {
  const user = await getUserById(req.user.id);
  return res.status(200).json({ success: true, data: { user } });
};
