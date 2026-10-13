import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, MapPin, Clock, Trash2, ExternalLink, Search, Briefcase, BadgeCheck, Hourglass, XCircle } from "lucide-react";
import api, { getError, getFieldErrors } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Field from "../components/Field";
import { rules, clean, hasErrors } from "../utils/validators";
import { btn, input, statusBadge, page, h1 } from "../ui";

const empty = { title: "", company: "", location: "", type: "Full-time", description: "", applyLink: "" };
const types = ["Full-time", "Part-time", "Internship", "Contract"];

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: "" }); };

  const load = async () => {
    try {
      const { data } = await api.get("/jobs");
      setJobs(data);
    } catch (e) {
      toast.error(getError(e));
    }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    const found = clean({
      title: rules.required(form.title, "Job title", 3, 100),
      company: rules.required(form.company, "Company", 2, 100),
      location: rules.max(form.location, "Location", 100),
      description: rules.required(form.description, "Description", 20, 3000),
      applyLink: rules.url(form.applyLink, "Application link"),
    });
    setErrors(found);
    if (hasErrors(found)) return;
    try {
      const { data } = await api.post("/jobs", form);
      toast.success(data.message, { duration: 5000 });
      setForm(empty); setErrors({}); setOpen(false); load();
    } catch (err) {
      const fe = getFieldErrors(err);
      if (hasErrors(fe)) setErrors(fe); else toast.error(getError(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this job post?")) return;
    try { const { data } = await api.delete(`/jobs/${id}`); toast.success(data.message); load(); }
    catch (err) { toast.error(getError(err)); }
  };

  const canDelete = (j) => user.role === "admin" || j.postedBy?._id === user._id;
  const shown = jobs.filter((j) =>
    (!type || j.type === type) &&
    (!q || [j.title, j.company, j.location].join(" ").toLowerCase().includes(q.toLowerCase()))
  );
  const liveCount = jobs.filter((j) => j.status === "approved").length;

  const statusInfo = {
    pending: [Hourglass, "Awaiting admin verification"],
    rejected: [XCircle, "Rejected by admin"],
  };

  return (
    <div className={`${page} max-w-7xl mx-auto px-6 py-10`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={`${h1} text-3xl font-extrabold tracking-tight text-slate-900`}>Job opportunities</h1>
          <p className="mt-1.5 text-slate-600">{liveCount} verified {liveCount === 1 ? "opening" : "openings"} shared by alumni</p>
        </div>
        {user.role === "alumni" && <button className={`${btn("primary")} shadow-lg shadow-teal-600/20`} onClick={() => setOpen(true)}><Plus size={18} /> Post a job</button>}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[280px] flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={`${input} pl-11 py-3 rounded-2xl border-slate-200 shadow-sm`} placeholder="Search title, company, location…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search jobs" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["", ...types].map((t) => (
            <button key={t} onClick={() => setType(t)} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${type === t ? "border-teal-600 bg-teal-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{t || "All"}</button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {shown.length === 0 && <div className="lg:col-span-2"><EmptyState icon={Briefcase} title="No jobs found" text="Verified job posts will appear here." /></div>}
        {shown.map((j) => {
          const [StatusIcon, statusText] = statusInfo[j.status] || [];
          return (
            <article key={j._id} className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-teal-500/30">
              <div className="flex items-start gap-4">
                <Avatar name={j.company} size="lg" square />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold text-slate-900">{j.title}</h3>
                  <p className="truncate text-sm font-semibold text-slate-600">{j.company}</p>
                </div>
                {canDelete(j) && (
                  <button onClick={() => remove(j._id)} aria-label="Delete job" className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
                <span className="rounded-full bg-teal-50 px-3 py-1 font-semibold text-teal-700">{j.type}</span>
                {j.location && <span className="inline-flex items-center gap-1.5 text-slate-500"><MapPin size={14} />{j.location}</span>}
                <span className="inline-flex items-center gap-1.5 text-slate-500"><Clock size={14} />{new Date(j.createdAt).toLocaleDateString()}</span>
                {j.status === "approved" && <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600"><BadgeCheck size={15} />Verified</span>}
                {StatusIcon && <span className={`${statusBadge[j.status]} gap-1.5`}><StatusIcon size={14} />{statusText}</span>}
              </div>

              <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{j.description}</p>

              <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <p className="truncate text-xs text-slate-400">Posted by {j.postedBy?.name || "an alumnus"}</p>
                {j.applyLink && j.status === "approved" && <a className={`${btn("primary", "sm")} rounded-xl shadow-md`} href={j.applyLink} target="_blank" rel="noreferrer">Apply <ExternalLink size={14} /></a>}
              </div>
            </article>
          );
        })}
      </div>

      {open && (
        <Modal title="Post a job" onClose={() => setOpen(false)} wide>
          <p className="mb-6 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
            For safety, every job is checked by an admin before students can see it.
          </p>
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={create} noValidate>
            <Field label="Job title" error={errors.title} value={form.title} onChange={set("title")} maxLength={100} />
            <Field label="Company" error={errors.company} value={form.company} onChange={set("company")} maxLength={100} />
            <Field label="Location" error={errors.location} value={form.location} onChange={set("location")} placeholder="Remote / Pune" maxLength={100} />
            <Field as="select" label="Type" value={form.type} onChange={set("type")}>{types.map((t) => <option key={t}>{t}</option>)}</Field>
            <Field className="sm:col-span-2" as="textarea" rows="4" label="Description" error={errors.description} hint={`${form.description.length}/3000 · at least 20 characters`} value={form.description} onChange={set("description")} maxLength={3000} />
            <Field className="sm:col-span-2" label="Application link" error={errors.applyLink} type="url" placeholder="https://" value={form.applyLink} onChange={set("applyLink")} />
            <button className={`${btn("primary", "lg")} sm:col-span-2 rounded-2xl shadow-lg`}>Submit for verification</button>
          </form>
        </Modal>
      )}
    </div>
  );
}