import api from "../services/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Network, UserPlus, ArrowRight, ShieldCheck, Building2, BadgeCheck, Sparkles, TrendingUp, Compass, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { btn, card, page, h2 } from "../ui";

function Stat({ to, icon: Icon, value, label, tone = "text-teal-600 bg-teal-50 ring-teal-500/20" }) {
  return (
    <Link to={to} className={`${card} group relative overflow-hidden flex items-center gap-5 border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-900/5 bg-white rounded-3xl`}>
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ring-1 ${tone}`}><Icon size={26} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">{value ?? "0"}</p>
        <p className="mt-1.5 text-sm font-medium text-slate-500 truncate">{label}</p>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-teal-600">
        <ArrowRight size={18} />
      </div>
    </Link>
  );
}

function completion(p) {
  const checks = [
    p.headline, p.bio, p.graduationYear, p.location, p.department, p.linkedin,
    p.skills?.length, p.achievements?.length,
    p.role === "alumni" ? p.experience?.length : p.internships?.length,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [people, setPeople] = useState([]);
  const [counts, setCounts] = useState({ connections: 0, requests: 0 });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get("/jobs");
        setJobs(data.filter((j) => j.status === "approved"));
      } catch { /* ignore */ }

      if (isAdmin) {
        try {
          const { data } = await api.get("/admin/stats");
          setStats(data);
        } catch { /* ignore */ }
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setProfile(data);
      } catch { /* ignore */ }

      try {
        const { data } = await api.get("/users");
        setPeople(data.slice(0, 4));
      } catch { /* ignore */ }

      try {
        const { data } = await api.get("/connections");
        setCounts({
          connections: data.filter((c) => c.status === "accepted").length,
          requests: data.filter((c) => c.status === "pending" && c.recipient._id === user._id).length,
        });
      } catch { /* ignore */ }
    };
    loadDashboard();
  }, [user, isAdmin]);

  const percent = profile ? completion(profile) : 0;

  return (
    <div className={`${page} space-y-8 max-w-7xl mx-auto px-6 py-10`}>
      {/* welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-8 text-white shadow-2xl sm:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-15" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-teal-500/20 blur-[100px]" />
        
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar name={user.name} size="xl" className="ring-4 ring-white/20 shadow-xl bg-teal-600 text-white" />
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-500/30 mb-2">
                <Sparkles size={13} /> Active Session
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome back, {user.name}</h1>
              <p className="mt-1 text-sm text-slate-300 capitalize font-medium">Logged in as <span className="text-teal-300">{user.role}</span></p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!isAdmin && (
              <>
                <Link to="/directory" className={`${btn("light")} shadow-lg shadow-black/20 rounded-xl px-5 py-3`}>
                  <Compass size={16} /> Explore directory
                </Link>
                <Link to="/connections" className={`${btn("outlineLight")} rounded-xl px-4 py-3`}>
                  <Network size={16} /> My network
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className={`${btn("light")} shadow-lg shadow-black/20 rounded-xl px-5 py-3`}>
                Open admin panel <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* stats section */}
      {isAdmin ? (
        stats && (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Stat to="/admin" icon={UserPlus} value={stats.pendingAlumni} label="Alumni awaiting approval" tone="bg-amber-50 text-amber-600 ring-amber-500/20" />
            <Stat to="/admin" icon={Building2} value={stats.pendingCompany} label="Company requests" tone="bg-sky-50 text-sky-600 ring-sky-500/20" />
            <Stat to="/admin" icon={ShieldCheck} value={stats.pendingJobs} label="Jobs to verify" tone="bg-violet-50 text-violet-600 ring-violet-500/20" />
            <Stat to="/jobs" icon={Briefcase} value={stats.jobs} label="Live job posts" tone="bg-emerald-50 text-emerald-600 ring-emerald-500/20" />
          </section>
        )
      ) : (
        <section className="grid gap-5 sm:grid-cols-3">
          <Stat to="/jobs" icon={Briefcase} value={jobs.length} label="Verified job openings" tone="bg-teal-50 text-teal-600 ring-teal-500/20" />
          <Stat to="/connections" icon={Network} value={counts.connections} label="Active connections" tone="bg-sky-50 text-sky-600 ring-sky-500/20" />
          <Stat to="/connections" icon={UserPlus} value={counts.requests} label="Pending connection requests" tone="bg-amber-50 text-amber-600 ring-amber-500/20" />
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* latest jobs */}
          <section className={`${card} border-slate-200/80 p-7 shadow-sm rounded-3xl bg-white`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className={`${h2} text-xl font-bold text-slate-900`}>Latest opportunities</h2>
                <p className="text-xs text-slate-500 mt-0.5">Verified postings from alumni network</p>
              </div>
              <Link to="/jobs" className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {jobs.length === 0 && <p className="text-sm text-slate-500 py-6 text-center">No verified jobs available right now.</p>}
            <ul className="divide-y divide-slate-100">
              {jobs.slice(0, 4).map((j) => (
                <li key={j._id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 group">
                  <Avatar name={j.company} square />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{j.title}</p>
                    <p className="truncate text-sm text-slate-500">{j.company}{j.location && ` · ${j.location}`}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-600 shrink-0">{j.type}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* people */}
          {!isAdmin && (
            <section className={`${card} border-slate-200/80 p-7 shadow-sm rounded-3xl bg-white`}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className={`${h2} text-xl font-bold text-slate-900`}>People you may know</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Connect with alumni & peers from your college</p>
                </div>
                <Link to="/directory" className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
                  See directory <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {people.map((p) => (
                  <Link key={p._id} to={`/u/${p._id}`} className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 p-4 transition-all hover:border-teal-500/40 hover:bg-teal-50/20 hover:shadow-md">
                    <Avatar name={p.name} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate font-bold text-slate-900">{p.name}</p>
                      <p className="truncate text-xs text-slate-500 font-medium">{p.headline || [p.jobTitle, p.companyName].filter(Boolean).join(" at ") || p.role}</p>
                    </div>
                  </Link>
                ))}
                {people.length === 0 && <p className="text-sm text-slate-500 col-span-2 text-center py-6">No other members discovered yet.</p>}
              </div>
            </section>
          )}
        </div>

        {/* profile completion sidebar */}
        {!isAdmin && profile && (
          <aside className={`${card} h-fit border-slate-200/80 p-7 shadow-sm rounded-3xl bg-white space-y-6`}>
            <div>
              <h2 className={`${h2} text-xl font-bold text-slate-900`}>Profile strength</h2>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-4xl font-extrabold tracking-tight text-teal-600">{percent}%</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completion</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/50" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700" style={{ width: `${percent}%` }} />
              </div>
            </div>
            
            <p className="text-sm leading-relaxed text-slate-600">
              {percent < 100 ? "A complete profile gets more connection requests and referrals. Add your headline, skills and achievements." : "Your profile looks fully optimized!"}
            </p>

            {user.role === "student" && (
              <div className="flex items-start gap-3 rounded-2xl bg-teal-50/60 p-4 ring-1 ring-teal-500/20 text-xs text-slate-700">
                <BadgeCheck size={20} className="mt-0.5 shrink-0 text-teal-600" />
                <span>Working somewhere? Request company verification directly from your profile settings.</span>
              </div>
            )}

            <Link to="/profile" className={`${btn("primary")} w-full justify-center rounded-2xl shadow-md py-3`}>
              Edit profile details
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}