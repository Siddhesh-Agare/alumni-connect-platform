import { z } from "zod";
import { personName, email, yearField } from "./common.js";

const strongPassword = z
  .string({ required_error: "Password is required", invalid_type_error: "Password must be text" })
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");

export const registerBody = z.object({
  name: personName(),
  email,
  password: strongPassword,
  role: z.enum(["student", "alumni"], { errorMap: () => ({ message: "Role must be student or alumni" }) }),
  graduationYear: yearField("Graduation year"),
});

// login is intentionally lenient on password rules so older accounts can still sign in
export const loginBody = z.object({
  email,
  password: z
    .string({ required_error: "Password is required", invalid_type_error: "Password must be text" })
    .min(1, "Password is required")
    .max(64, "Password is too long"),
});
