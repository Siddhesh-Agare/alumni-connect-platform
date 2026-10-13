import { z } from "zod";
import { text, httpUrl } from "./common.js";

export const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract"];

export const createJobBody = z.object({
  title: text("Job title", { required: true, min: 3, max: 100 }),
  company: text("Company", { required: true, min: 2, max: 100 }),
  location: text("Location", { max: 100 }),
  type: z.enum(JOB_TYPES, { errorMap: () => ({ message: `Job type must be one of: ${JOB_TYPES.join(", ")}` }) }).default("Full-time"),
  description: text("Description", { required: true, min: 20, max: 3000 }),
  applyLink: httpUrl("Application link"),
});
