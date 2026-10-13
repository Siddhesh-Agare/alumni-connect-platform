import { z } from "zod";
import { text, personName, httpUrl, yearField, emptyToUndefined } from "./common.js";

// ignore rows the user added but left completely blank
const dropEmpty = (v) =>
  Array.isArray(v)
    ? v.filter((it) => it && typeof it === "object" && Object.values(it).some((x) => String(x ?? "").trim()))
    : v;

const workItem = z.object({
  company: text("Company", { required: true, max: 100 }),
  role: text("Role", { required: true, max: 100 }),
  period: text("Period", { max: 60 }),
  description: text("Description", { max: 600 }),
});

const achievementItem = z.object({
  title: text("Achievement title", { required: true, max: 120 }),
  year: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{4}$/.test(v) && +v >= 1950 && +v <= 2100), "Achievement year must be a 4-digit year")
    .optional(),
  description: text("Achievement details", { max: 400 }),
});

const skills = z
  .preprocess(
    (v) => (typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v),
    z
      .array(z.string().trim().min(1).max(40, "Each skill must be at most 40 characters"), {
        invalid_type_error: "Skills must be a comma separated list",
      })
      .max(30, "Add at most 30 skills")
      .transform((a) => [...new Set(a)])
  )
  .optional();

// Used for "update my profile" and for the admin "edit user" action
export const profileBody = z.object({
  name: personName(false),
  headline: text("Headline", { max: 120 }),
  location: text("Location", { max: 100 }),
  department: text("Department", { max: 100 }),
  graduationYear: yearField("Graduation year"),
  linkedin: httpUrl("LinkedIn link", "linkedin.com"),
  bio: text("Bio", { max: 1500 }),
  skills,
  internships: z.preprocess(dropEmpty, z.array(workItem).max(20, "Add at most 20 internships")).optional(),
  experience: z.preprocess(dropEmpty, z.array(workItem).max(20, "Add at most 20 experience entries")).optional(),
  achievements: z.preprocess(dropEmpty, z.array(achievementItem).max(20, "Add at most 20 achievements")).optional(),
  // students cannot set these (the controller ignores them); alumni and admins can
  companyName: text("Company name", { max: 100 }),
  jobTitle: text("Job title", { max: 100 }),
});

export const companyRequestBody = z.object({
  companyName: text("Company name", { required: true, min: 2, max: 100 }),
  jobTitle: text("Job title", { required: true, min: 2, max: 100 }),
  proof: httpUrl("Proof link"),
});

export const directoryQuery = z.object({
  search: text("Search", { max: 50 }),
  role: z.preprocess(
    emptyToUndefined,
    z.enum(["student", "alumni"], { errorMap: () => ({ message: "Role filter must be student or alumni" }) }).optional()
  ),
});
