import { Plus, Trash2 } from "lucide-react";
import { btn, input, label } from "../ui";

// Generic "add / remove rows" editor used for internships, experience and achievements.
// fields: [{ key, label, placeholder, textarea?, half? }]
export default function ListEditor({ items, onChange, fields, addLabel, emptyText }) {
  const update = (i, key, value) => onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  const add = () => onChange([...items, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && <p className="text-sm text-muted">{emptyText}</p>}
      {items.map((item, i) => (
        <div key={i} className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove entry"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
          <div className="grid gap-3 pr-8 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} className={`${label} ${f.half ? "" : "sm:col-span-2"}`}>
                {f.label}
                {f.textarea ? (
                  <textarea rows="3" className={input} value={item[f.key] || ""} placeholder={f.placeholder} onChange={(e) => update(i, f.key, e.target.value)} />
                ) : (
                  <input className={input} value={item[f.key] || ""} placeholder={f.placeholder} onChange={(e) => update(i, f.key, e.target.value)} />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className={`${btn("soft", "sm")} self-start`}>
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}
