import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";

await mongoose.connect(process.env.MONGO_URI);
const email = process.env.ADMIN_EMAIL.toLowerCase();
if (await User.findOne({ email })) {
  console.log("Admin already exists");
} else {
  await User.create({
    name: process.env.ADMIN_NAME,
    email,
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
    role: "admin",
    status: "approved",
  });
  console.log(`Admin created: ${email}`);
}
await mongoose.disconnect();
