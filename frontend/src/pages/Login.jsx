import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";
import api, { getError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import { rules, clean, hasErrors } from "../utils/validators";
import { btn, h1 } from "../ui";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
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
    const found = clean({ email: rules.email(form.email), password: form.password ? "" : "Password is required" });
    setErrors(found);
    if (hasErrors(found)) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      saveSession(data);
      toast.success(`Welcome back, ${data.user.name}`);
      navigate("/");
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="flex w-full max-w-sm flex-col gap-5" onSubmit={submit} noValidate>
        <div>
          <h1 className={h1}>Welcome back</h1>
          <p className="mt-1 text-muted">Log in to your Alumni Connect account.</p>
        </div>
        <Field label="Email" error={errors.email} type="email" autoComplete="email" value={form.email} onChange={set("email")} />
        <Field label="Password" error={errors.password} type="password" autoComplete="current-password" value={form.password} onChange={set("password")} />
        <button className={btn("primary", "lg")} disabled={loading}><LogIn size={18} />{loading ? "Logging in…" : "Log in"}</button>
        <p className="text-center text-sm text-muted">New here? <Link className="font-semibold text-primary hover:underline" to="/register">Create an account</Link></p>
      </form>
    </AuthLayout>
  );
}
