import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus, GraduationCap, Briefcase } from "lucide-react";
import api, { getError, getFieldErrors } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import { rules, clean, hasErrors, MIN_YEAR, MAX_YEAR } from "../utils/validators";
import { btn, h1 } from "../ui";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", graduationYear: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = clean({
      name: rules.name(form.name),
      email: rules.email(form.email),
      password: rules.password(form.password),
      graduationYear: rules.year(form.graduationYear),
    });
    setErrors(found);
    if (hasErrors(found)) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      toast.success(data.message, { duration: 6000 });
      if (data.token) { saveSession(data); navigate("/"); }
      else navigate("/login"); // alumni: wait for approval
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (hasErrors(fieldErrors)) setErrors(fieldErrors);
      else toast.error(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const roles = [["student", "Student", GraduationCap], ["alumni", "Alumni", Briefcase]];

  return (
    <AuthLayout>
      <form className="flex w-full max-w-sm flex-col gap-4" onSubmit={submit} noValidate>
        <div>
          <h1 className={h1}>Create your account</h1>
          <p className="mt-1 text-muted">Join students and alumni from your campus.</p>
        </div>

        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="I am a">
          {roles.map(([value, text, Icon]) => (
            <button
              type="button" key={value} role="radio" aria-checked={form.role === value}
              onClick={() => setForm({ ...form, role: value })}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${form.role === value ? "border-primary bg-tint text-primary-dark" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
            >
              <Icon size={18} /> {text}
            </button>
          ))}
        </div>

        <Field label="Full name" error={errors.name} autoComplete="name" value={form.name} onChange={set("name")} maxLength={60} />
        <Field label="Email" error={errors.email} type="email" autoComplete="email" value={form.email} onChange={set("email")} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Password" error={errors.password} hint="8+ chars, letter and number" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} maxLength={64} />
          <Field label="Graduation year" error={errors.graduationYear} type="number" min={MIN_YEAR} max={MAX_YEAR} value={form.graduationYear} onChange={set("graduationYear")} />
        </div>
        {form.role === "alumni" && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            Alumni accounts are reviewed by an admin. You can log in once approved.
          </p>
        )}
        <button className={btn("primary", "lg")} disabled={loading}><UserPlus size={18} />{loading ? "Creating…" : "Create account"}</button>
        <p className="text-center text-sm text-muted">Already registered? <Link className="font-semibold text-primary hover:underline" to="/login">Log in</Link></p>
      </form>
    </AuthLayout>
  );
}
