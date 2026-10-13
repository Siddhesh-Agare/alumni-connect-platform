import { input, label } from "../ui";

// Label + control + inline error message.
// <Field label="Email" error={errors.email} type="email" value=... onChange=... />
// Use as="textarea" or as="select" (with children) for other controls.
export default function Field({ label: text, error, hint, as: Tag = "input", className = "", children, ...props }) {
  return (
    <label className={`${label} ${className}`}>
      {text}
      <Tag
        className={`${input} ${error ? "border-red-400 focus:border-red-500 focus:outline-red-200" : ""}`}
        aria-invalid={error ? "true" : undefined}
        {...props}
      >
        {children}
      </Tag>
      {error ? (
        <span role="alert" className="text-xs font-normal text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs font-normal text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
