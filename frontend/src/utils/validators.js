// Client-side rules. They mirror backend/validators so users get instant feedback;
// the server still validates everything again.
export const MIN_YEAR = 1950;
export const MAX_YEAR = new Date().getFullYear() + 6;
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;

export const isHttpUrl = (v, host) => {
  try {
    const u = new URL(v);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    return host ? u.hostname === host || u.hostname.endsWith(`.${host}`) : true;
  } catch { return false; }
};

export const rules = {
  name(v = "") {
    const s = v.trim();
    if (!s) return "Name is required";
    if (s.length < 2) return "Name must be at least 2 characters";
    if (s.length > 60) return "Name must be at most 60 characters";
    if (!NAME_RE.test(s)) return "Name can only contain letters, spaces and . ' -";
    return "";
  },
  email(v = "") {
    const s = v.trim();
    if (!s) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return "Enter a valid email address";
    return "";
  },
  password(v = "") {
    if (!v) return "Password is required";
    if (v.length < 8) return "Password must be at least 8 characters";
    if (v.length > 64) return "Password must be at most 64 characters";
    if (!/[A-Za-z]/.test(v)) return "Password must contain at least one letter";
    if (!/\d/.test(v)) return "Password must contain at least one number";
    return "";
  },
  year(v, label = "Graduation year") {
    if (v === "" || v == null) return "";
    const n = Number(v);
    if (!Number.isInteger(n)) return `${label} must be a whole number`;
    if (n < MIN_YEAR || n > MAX_YEAR) return `${label} must be between ${MIN_YEAR} and ${MAX_YEAR}`;
    return "";
  },
  url(v = "", label = "Link", host) {
    if (!v.trim()) return "";
    if (v.length > 300) return `${label} is too long`;
    return isHttpUrl(v.trim(), host) ? "" : host ? `${label} must be a valid ${host} link (https://…)` : `${label} must start with http:// or https://`;
  },
  required(v = "", label, min = 1, max = 100) {
    const s = v.trim();
    if (!s) return `${label} is required`;
    if (s.length < min) return `${label} must be at least ${min} characters`;
    if (s.length > max) return `${label} must be at most ${max} characters`;
    return "";
  },
  max(v = "", label, max) {
    return v.trim().length > max ? `${label} must be at most ${max} characters` : "";
  },
};

export const clean = (errors) => Object.fromEntries(Object.entries(errors).filter(([, m]) => m));
export const hasErrors = (errors) => Object.keys(errors).length > 0;

// Validate repeated rows (internships / experience / achievements).
// Completely blank rows are ignored (the server drops them too).
export function validateRows(rows, kind) {
  const problems = [];
  rows.forEach((r, i) => {
    if (!Object.values(r).some((x) => String(x ?? "").trim())) return;
    const n = i + 1;
    if (kind === "work") {
      if (!r.company?.trim()) problems.push(`Entry ${n}: company is required`);
      if (!r.role?.trim()) problems.push(`Entry ${n}: role is required`);
      if ((r.description || "").length > 600) problems.push(`Entry ${n}: description is too long (max 600)`);
    } else {
      if (!r.title?.trim()) problems.push(`Achievement ${n}: title is required`);
      if (r.year?.trim() && !/^\d{4}$/.test(r.year.trim())) problems.push(`Achievement ${n}: year must be 4 digits`);
    }
  });
  return problems;
}
