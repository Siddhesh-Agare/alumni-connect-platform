const gradients = [
  "from-teal-500 to-emerald-600",
  "from-sky-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
];
const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-28 w-28 text-4xl",
};

// Initials avatar with a colour derived from the name. `square` is used for company logos.
export default function Avatar({ name = "?", size = "md", square = false, className = "" }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
  const hash = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center bg-gradient-to-br font-bold text-white ${gradients[hash % gradients.length]} ${sizes[size]} ${square ? "rounded-xl" : "rounded-full"} ${className}`}
    >
      {initials}
    </span>
  );
}
