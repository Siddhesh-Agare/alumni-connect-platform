import bcrypt from "bcrypt";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, status: u.status });

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, graduationYear } = req.body; // already validated
  if (await User.findOne({ email })) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
    graduationYear,
    status: role === "alumni" ? "pending" : "approved",
  });

  if (user.status === "pending") {
    return res.status(201).json({
      message: "Registered. An admin must approve your alumni account before you can log in.",
    });
  }
  res.status(201).json({ message: "Registration successful", token: generateToken(user._id), user: publicUser(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(400);
    throw new Error("Invalid email or password");
  }
  if (user.status === "pending") {
    res.status(403);
    throw new Error("Your alumni account is waiting for admin approval");
  }
  if (user.status === "rejected") {
    res.status(403);
    throw new Error("Your registration request was rejected by the admin");
  }
  res.json({ message: "Login successful", token: generateToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => res.json(req.user));
