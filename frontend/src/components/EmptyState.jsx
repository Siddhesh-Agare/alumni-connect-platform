export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      {Icon && <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-tint text-primary"><Icon size={22} /></span>}
      <p className="font-semibold text-slate-800">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
