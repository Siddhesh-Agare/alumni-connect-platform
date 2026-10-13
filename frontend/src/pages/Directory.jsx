import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, UserPlus, Check, Clock, MapPin, GraduationCap, Users } from "lucide-react";
import api, { getError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import VerifiedBadge from "../components/VerifiedBadge";
import EmptyState from "../components/EmptyState";
import { btn, input, roleBadge, page, h1 } from "../ui";

const filters = [["", "Everyone"], ["alumni", "Alumni"], ["student", "Students"]];

export default function Directory() {
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [conns, setConns] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [people, connections] = await Promise.all([
        api.get("/users", { params: { search, role } }),
        api.get("/connections"),
      ]);
      setUsers(people.data);
      setConns(connections.data);
    } catch (e) {
      toast.error(getError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search, role]);

  const stateOf = (id) => {
    const c = conns.find((c) => c.requester._id === id || c.recipient._id === id);
    if (!c) return "none";
    if (c.status === "accepted") return "connected";
    return c.requester._id === me._id ? "sent" : "received";
  };

  const connect = async (e, id) => {
    e.stopPropagation();
    try { const { data } = await api.post(`/connections/request/${id}`); toast.success(data.message); load(); }
    catch (err) { toast.error(getError(err)); }
  };

  return (
    <div className={`${page} max-w-7xl mx-auto px-6 py-10`}>
      <div>
        <h1 className={`${h1} text-3xl font-extrabold tracking-tight text-slate-900`}>Directory</h1>
        <p className="mt-1.5 text-slate-600">Find alumni and students. Click a card to see the full profile.</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[280px] flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={`${input} pl-11 py-3 rounded-2xl border-slate-200 shadow-sm`} placeholder="Search name, company, skill, department…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search directory" />
        </div>
        <div className="flex gap-1.5 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60">
          {filters.map(([v, text]) => (
            <button key={v} onClick={() => setRole(v)} className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all ${role === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>{text}</button>
          ))}
        </div>
      </div>

      {!loading && users.length === 0 && (
        <div className="mt-12"><EmptyState icon={Users} title="No one matches your search" text="Try a different keyword or clear the filters." /></div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => {
          const state = stateOf(u._id);
          const position = [u.jobTitle, u.companyName].filter(Boolean).join(" at ");
          return (
            <article
              key={u._id}
              onClick={() => navigate(`/u/${u._id}`)}
              className="group flex cursor-pointer flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-900/5"
            >
              <div className="flex items-start gap-4">
                <Avatar name={u.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <Link to={`/u/${u._id}`} onClick={(e) => e.stopPropagation()} className="block truncate text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{u.name}</Link>
                  <span className={`mt-1 inline-block ${roleBadge[u.role]}`}>{u.role}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm text-slate-600 flex-1">
                {(u.headline || position) && (
                  <p className="line-clamp-2 font-medium text-slate-800">{u.headline || position}{!u.headline && u.companyVerified && <VerifiedBadge className="ml-1.5 align-middle" />}</p>
                )}
                {u.headline && position && <p className="truncate text-slate-500">{position}{u.companyVerified && <VerifiedBadge className="ml-1 align-middle" />}</p>}
                {u.location && <p className="flex items-center gap-2 text-slate-500"><MapPin size={15} className="text-slate-400" />{u.location}</p>}
                {u.graduationYear && <p className="flex items-center gap-2 text-slate-500"><GraduationCap size={15} className="text-slate-400" />Class of {u.graduationYear}</p>}
              </div>

              {u.skills?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {u.skills.slice(0, 4).map((s) => <span key={s} className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">{s}</span>)}
                  {u.skills.length > 4 && <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">+{u.skills.length - 4}</span>}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100">
                {state === "none" && <button className={`${btn("soft")} w-full justify-center rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100`} onClick={(e) => connect(e, u._id)}><UserPlus size={16} /> Connect</button>}
                {state === "sent" && <span className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-500"><Clock size={16} /> Request sent</span>}
                {state === "received" && <span className="flex items-center justify-center rounded-xl bg-amber-50 py-2.5 text-sm font-semibold text-amber-700">Wants to connect</span>}
                {state === "connected" && <span className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700"><Check size={16} /> Connected</span>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}