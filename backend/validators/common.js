import { z } from "zod";

export const MIN_YEAR = 1950;
export const MAX_YEAR = new Date().getFullYear() + 6; // students may graduate in the future

// text(label, { min, max, required })
export const text = (label, { min = 0, max = 200, required = false } = {}) => {
  const lower = min || (required ? 1 : 0);
  let s = z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} must be text` })
    .trim();
  if (lower) s = s.min(lower, lower === 1 ? `${label} is required` : `${label} must be at least ${lower} characters`);
  s = s.max(max, `${label} must be at most ${max} characters`);
  return required ? s : s.optional();
};

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;
export const personName = (required = true) => {
  const s = text("Name", { min: 2, max: 60, required }).refine(
    (v) => v === undefined || NAME_RE.test(v),
    "Name can only contain letters, spaces and . ' -"
  );
  return s;
};

export const email = z
  .string({ required_error: "Email is required", invalid_type_error: "Email must be text" })
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(100, "Email must be at most 100 characters")
  .email("Enter a valid email address");

export const isHttpUrl = (value, host) => {
  try {
    const u = new URL(value);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    return host ? u.hostname === host || u.hostname.endsWith(`.${host}`) : true;
  } catch {
    return false;
  }
};

// optional link; empty string is allowed so users can clear it
export const httpUrl = (label, host) =>
  z
    .string({ invalid_type_error: `${label} must be text` })
    .trim()
    .max(300, `${label} must be at most 300 characters`)
    .refine(
      (v) => v === "" || isHttpUrl(v, host),
      host ? `${label} must be a valid ${host} link (https://…)` : `${label} must be a valid link starting with http:// or https://`
    )
    .optional();

const emptyToUndefined = (v) => (v === "" || v === null ? undefined : v);

export const yearField = (label, min = MIN_YEAR, max = MAX_YEAR) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ invalid_type_error: `${label} must be a number` })
      .int(`${label} must be a whole number`)
      .min(min, `${label} must be ${min} or later`)
      .max(max, `${label} must be ${max} or earlier`)
      .optional()
  );

export const objectId = (label = "id") =>
  z.string({ required_error: `${label} is required` }).regex(/^[a-f\d]{24}$/i, `Invalid ${label}`);

export const idParams = z.object({ id: objectId() });
export const userIdParams = z.object({ userId: objectId("user id") });

export const statusQuery = z.object({
  status: z.preprocess(
    emptyToUndefined,
    z.enum(["pending", "approved", "rejected"], { errorMap: () => ({ message: "Invalid status filter" }) }).optional()
  ),
});

export { emptyToUndefined };
