// Reusable Tailwind class strings, so JSX stays readable
const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";
const variants = {
  primary: "bg-primary text-white shadow-sm hover:bg-primary-dark",
  soft: "bg-tint text-primary-dark hover:bg-teal-100",
  ghost: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  dark: "bg-slate-900 text-white hover:bg-slate-800",
  light: "bg-white text-slate-900 shadow-sm hover:bg-slate-100",
  outlineLight: "border border-white/30 text-white hover:bg-white/10",
};
const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" };

export const btn = (variant = "primary", size = "md") => `${base} ${variants[variant]} ${sizes[size]}`;

export const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
export const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-2 focus:outline-primary/25 disabled:bg-slate-100 disabled:text-slate-500";
export const label = "flex flex-col gap-1.5 text-sm font-medium text-slate-700";
export const badge =
  "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700";
export const roleBadge = {
  student: "inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-sky-700",
  alumni: "inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-amber-800",
  admin: "inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-violet-700",
};
export const statusBadge = {
  pending: "inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-amber-800",
  approved: "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-700",
  rejected: "inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-red-700",
};
export const page = "mx-auto w-full max-w-6xl px-5 pb-16 pt-8";
export const pageNarrow = "mx-auto w-full max-w-3xl px-5 pb-16 pt-8";
export const h1 = "text-3xl font-bold tracking-tight text-slate-900";
export const h2 = "text-lg font-bold text-slate-900";
export const subtle = "text-sm text-muted";
