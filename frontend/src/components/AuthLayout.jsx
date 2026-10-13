import { Link } from "react-router-dom";
import { GraduationCap, BadgeCheck, Users, Briefcase } from "lucide-react";

// Split layout shared by Login and Register
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20"><GraduationCap size={22} /></span>
          <span className="text-xl font-extrabold tracking-tight">Alumni Connect</span>
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Your campus network, all in one place.</h2>
          <ul className="mt-8 space-y-5 text-teal-50/90">
            {[
              [Users, "Meet alumni who studied what you study"],
              [Briefcase, "Admin-verified jobs and internships"],
              [BadgeCheck, "Verified companies, no fake profiles"],
            ].map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10"><Icon size={18} /></span>{text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-teal-100/60">© Alumni Connect</p>
      </aside>
      <main className="grid place-items-center p-6">{children}</main>
    </div>
  );
}
