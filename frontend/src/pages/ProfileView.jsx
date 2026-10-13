import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, GraduationCap, ExternalLink, MessageCircle, UserPlus, Check, Clock, Pencil, Building2, Award, Briefcase } from "lucide-react";
import api, { getError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import VerifiedBadge from "../components/VerifiedBadge";
import { btn, card, roleBadge, h2 } from "../ui";

function Timeline({ items, icon: Icon }) {
  return (
    <ol className="relative ml-3 space-y-6 border-l-2 border-slate-200">
      {items.map((it, i) => (
        <li key={i} className="relative pl-7">
          <span className="absolute -left-[17px] top-0 grid h-8 w-8 place-items-center rounded-full bg-tint text-primary ring-4 ring-white"><Icon size={15} /></span>
          <p className="font-bold">{it.role || it.title}</p>
          <p className="text-sm text-slate-600">{[it.company, it.period || it.year].filter(Boolean).join(" · ")}</p>
          {it.description && <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{it.description}</p>}
        </li>
      ))}
    </ol>
  );
}

export default function ProfileView() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [conn, setConn] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/users/${id}`);
      setP(data);
    } catch {
      setNotFound(true);
    }
    if (me.role !== "admin") {
      try {
        const { data } = await api.get("/connections");
        setConn(data.find((c) => c.requester._id === id || c.recipient._id === id) || null);
      } catch { /* connection state is optional */ }
    }
  };
  useEffect(() => { setP(null); setNotFound(false); load(); }, [id]);

  const connect = async () => {
    try { const { data } = await api.post(`/connections/request/${id}`); toast.success(data.message); load(); }
    catch (e) { toast.error(getError(e)); }
  };

  if (notFound) return <div className="mx-auto max-w-3xl p-10 text-center text-muted">This profile could not be found.</div>;
  if (!p) return <div className="mx-auto max-w-3xl p-10 text-muted">Loading…</div>;

  const isMe = p._id === me._id;
  const state = !conn ? "none" : conn.status === "accepted" ? "connected" : conn.requester._id === me._id ? "sent" : "received";
  const work = p.role === "alumni" ? p.experience : p.internships;
  const workTitle = p.role === "alumni" ? "Experience" : "Internships";
  const position = [p.jobTitle, p.companyName].filter(Boolean).join(" at ");

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-6">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-slate-900">
        <ArrowLeft size={16} /> Back
      </button>

      {/* header */}
      <section className={`${card} overflow-hidden p-0`}>
        <div className="h-36 bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-700 sm:h-44">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.25),transparent_45%)]" />
        </div>
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
            <Avatar name={p.name} size="xl" className="ring-4 ring-white" />
            <div className="flex flex-wrap gap-2 pb-1">
              {isMe && <Link to="/profile" className={btn("primary")}><Pencil size={16} /> Edit profile</Link>}
              {!isMe && me.role !== "admin" && state === "none" && <button className={btn("primary")} onClick={connect}><UserPlus size={16} /> Connect</button>}
              {!isMe && state === "sent" && <span className={`${btn("ghost")} cursor-default`}><Clock size={16} /> Request sent</span>}
              {!isMe && state === "received" && <Link to="/connections" className={btn("primary")}>Respond to request</Link>}
              {!isMe && state === "connected" && (
                <>
                  <span className={`${btn("soft")} cursor-default`}><Check size={16} /> Connected</span>
                  <Link to={`/chat/${p._id}`} className={btn("primary")}><MessageCircle size={16} /> Message</Link>
                </>
              )}
              {p.linkedin && <a href={p.linkedin} target="_blank" rel="noreferrer" className={btn("ghost")}><ExternalLink size={16} /> LinkedIn</a>}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight">{p.name}</h1>
              <span className={roleBadge[p.role]}>{p.role}</span>
            </div>
            {p.headline && <p className="mt-1 text-lg text-slate-700">{p.headline}</p>}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
              {position && <span className="inline-flex items-center gap-1.5"><Building2 size={15} />{position}{p.companyVerified && <VerifiedBadge />}</span>}
              {p.location && <span className="inline-flex items-center gap-1.5"><MapPin size={15} />{p.location}</span>}
              {(p.department || p.graduationYear) && (
                <span className="inline-flex items-center gap-1.5"><GraduationCap size={15} />{[p.department, p.graduationYear && `Class of ${p.graduationYear}`].filter(Boolean).join(" · ")}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={card}>
            <h2 className={`${h2} mb-3`}>About</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-700">{p.bio || "This member has not added a bio yet."}</p>
          </section>

          {work?.length > 0 && (
            <section className={card}>
              <h2 className={`${h2} mb-5`}>{workTitle}</h2>
              <Timeline items={work} icon={Briefcase} />
            </section>
          )}

          {p.achievements?.length > 0 && (
            <section className={card}>
              <h2 className={`${h2} mb-5`}>Achievements</h2>
              <Timeline items={p.achievements} icon={Award} />
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className={card}>
            <h2 className={`${h2} mb-3`}>Skills</h2>
            {p.skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {p.skills.map((s) => <span key={s} className="rounded-lg bg-tint px-3 py-1 text-sm font-medium text-primary-dark">{s}</span>)}
              </div>
            ) : <p className="text-sm text-muted">No skills listed.</p>}
          </section>
          <section className={card}>
            <h2 className={`${h2} mb-3`}>Details</h2>
            <dl className="space-y-3 text-sm">
              {[["Role", p.role], ["Department", p.department], ["Graduation", p.graduationYear], ["Company", p.companyName]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="font-semibold capitalize">{v}</dd></div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
