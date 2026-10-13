import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Save, BadgeCheck, Clock, XCircle, Send, AlertCircle } from "lucide-react";
import api, { getError, getFieldErrors } from "../services/api";
import Avatar from "../components/Avatar";
import Field from "../components/Field";
import ListEditor from "../components/ListEditor";
import { rules, clean, hasErrors, validateRows, MIN_YEAR, MAX_YEAR } from "../utils/validators";
import { btn, card, pageNarrow, h1, h2 } from "../ui";

const workFields = [
  { key: "company", label: "Company / organisation *", placeholder: "Acme Labs", half: true },
  { key: "role", label: "Role *", placeholder: "Frontend Intern", half: true },
  { key: "period", label: "Period", placeholder: "Jun 2024 – Aug 2024", half: true },
  { key: "description", label: "What did you do?", textarea: true, placeholder: "Built dashboards with React…" },
];
const achievementFields = [
  { key: "title", label: "Title *", placeholder: "Winner, Smart India Hackathon", half: true },
  { key: "year", label: "Year", placeholder: "2024", half: true },
  { key: "description", label: "Details (optional)", textarea: true },
];

function Section({ title, hint, children }) {
  return (
    <section className={`${card} border-slate-200/80 p-8 rounded-3xl shadow-sm`}>
      <h2 className={`${h2} text-xl font-bold text-slate-900`}>{title}</h2>
      {hint ? <p className="mb-6 mt-1.5 text-sm text-slate-500 leading-relaxed">{hint}</p> : <div className="mb-6" />}
      {children}
    </section>
  );
}

function RowProblems({ problems }) {
  if (!problems?.length) return null;
  return (
    <ul role="alert" className="mt-4 space-y-1.5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
      {problems.map((p) => <li key={p} className="flex items-center gap-2.5"><AlertCircle size={16} />{p}</li>)}
    </ul>
  );
}

function CompanyVerification({ profile, onUpdated }) {
  const [form, setForm] = useState({ companyName: "", jobTitle: "", proof: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const req = profile.companyRequest;
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: "" }); };

  const submit = async (e) => {
    e.preventDefault();
    const found = clean({
      companyName: rules.required(form.companyName, "Company name", 2),
      jobTitle: rules.required(form.jobTitle, "Job title", 2),
      proof: rules.url(form.proof, "Proof link"),
    });
    setErrors(found);
    if (hasErrors(found)) return;

    setSending(true);
    try {
      const { data } = await api.post("/users/company-request", form);
      toast.success(data.message);
      onUpdated(data.user);
      setForm({ companyName: "", jobTitle: "", proof: "" });
    } catch (err) {
      const fe = getFieldErrors(err);
      if (hasErrors(fe)) setErrors(fe); else toast.error(getError(err));
    } finally { setSending(false); }
  };

  return (
    <Section
      title="Current company"
      hint="To prevent fake claims, students cannot type a company directly. Send a request and an admin will verify it."
    >
      {profile.companyName && profile.companyVerified && (
        <div className="mb-6 flex items-center gap-3.5 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200 text-slate-800">
          <BadgeCheck className="shrink-0 text-emerald-600" size={24} />
          <p className="text-sm"><b>{profile.jobTitle}</b> at <b>{profile.companyName}</b> <span className="text-emerald-700 font-semibold">· Verified by admin</span></p>
        </div>
      )}
      {req?.status === "pending" && (
        <div className="mb-6 flex items-center gap-3.5 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200 text-slate-800">
          <Clock className="shrink-0 text-amber-600" size={24} />
          <p className="text-sm">Waiting for admin verification: <b>{req.jobTitle}</b> at <b>{req.companyName}</b></p>
        </div>
      )}
      {req?.status === "rejected" && (
        <div className="mb-6 flex items-center gap-3.5 rounded-2xl bg-red-50 p-5 ring-1 ring-red-200 text-slate-800">
          <XCircle className="shrink-0 text-red-600" size={24} />
          <p className="text-sm">Your last request for <b>{req.companyName}</b> was rejected. Add proof (offer letter or LinkedIn link) and try again.</p>
        </div>
      )}
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name" error={errors.companyName} value={form.companyName} onChange={set("companyName")} maxLength={100} />
        <Field label="Job title" error={errors.jobTitle} value={form.jobTitle} onChange={set("jobTitle")} maxLength={100} />
        <Field className="sm:col-span-2" label="Proof link (offer letter, LinkedIn, ID card photo link)" error={errors.proof} type="url" placeholder="https://" value={form.proof} onChange={set("proof")} />
        <button className={`${btn("soft")} sm:col-span-2 sm:w-fit rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100`} disabled={sending || req?.status === "pending"}>
          <Send size={16} /> {sending ? "Sending…" : "Request verification"}
        </button>
      </form>
    </Section>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [rowProblems, setRowProblems] = useState({});
  const [saving, setSaving] = useState(false);

  const hydrate = (p) => {
    setProfile(p);
    setForm({
      name: p.name || "", headline: p.headline || "", location: p.location || "", department: p.department || "",
      graduationYear: p.graduationYear || "", linkedin: p.linkedin || "", bio: p.bio || "",
      skills: (p.skills || []).join(", "), companyName: p.companyName || "", jobTitle: p.jobTitle || "",
      internships: p.internships || [], experience: p.experience || [], achievements: p.achievements || [],
    });
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/auth/me");
        hydrate(data);
      } catch (e) {
        toast.error(getError(e));
      }
    };
    loadProfile();
  }, []);

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: "" }); };

  const skillCount = form ? form.skills.split(",").map((s) => s.trim()).filter(Boolean).length : 0;

  const save = async (e) => {
    e.preventDefault();
    const isAlumni = profile.role === "alumni";
    const found = clean({
      name: rules.name(form.name),
      headline: rules.max(form.headline, "Headline", 120),
      department: rules.max(form.department, "Department", 100),
      location: rules.max(form.location, "Location", 100),
      graduationYear: rules.year(form.graduationYear),
      linkedin: rules.url(form.linkedin, "LinkedIn link", "linkedin.com"),
      bio: rules.max(form.bio, "Bio", 1500),
      skills: skillCount > 30 ? "Add at most 30 skills" : form.skills.split(",").some((s) => s.trim().length > 40) ? "Each skill must be at most 40 characters" : "",
      ...(isAlumni ? { companyName: rules.max(form.companyName, "Company name", 100), jobTitle: rules.max(form.jobTitle, "Job title", 100) } : {}),
    });
    const rows = {
      work: validateRows(isAlumni ? form.experience : form.internships, "work"),
      achievements: validateRows(form.achievements, "achievement"),
    };
    setErrors(found);
    setRowProblems(rows);
    if (hasErrors(found) || rows.work.length || rows.achievements.length) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", form);
      hydrate(data);
      toast.success("Profile saved");
    } catch (err) {
      const fe = getFieldErrors(err);
      if (hasErrors(fe)) setErrors(fe);
      toast.error(getError(err));
    } finally { setSaving(false); }
  };

  if (!form) return <div className={`${pageNarrow} max-w-4xl mx-auto px-6 py-20 text-center text-slate-500`}>Loading…</div>;
  const isAlumni = profile.role === "alumni";

  return (
    <div className={`${pageNarrow} max-w-4xl mx-auto px-6 py-10 space-y-6`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={profile.name} size="xl" />
          <div>
            <h1 className={`${h1} text-3xl font-extrabold tracking-tight text-slate-900`}>My profile</h1>
            <p className="text-sm font-semibold capitalize text-teal-600 mt-0.5">{profile.role}</p>
          </div>
        </div>
        <Link to={`/u/${profile._id}`} className={`${btn("ghost")} rounded-xl text-slate-600`}><Eye size={16} /> View public profile</Link>
      </div>

      {!isAlumni && <CompanyVerification profile={profile} onUpdated={hydrate} />}

      <form onSubmit={save} noValidate className="space-y-6">
        <Section title="Basic information">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" error={errors.name} value={form.name} onChange={set("name")} maxLength={60} />
            <Field label="Headline" error={errors.headline} value={form.headline} onChange={set("headline")} placeholder="Final-year CSE student | Web developer" maxLength={120} />
            <Field label="Department / course" error={errors.department} value={form.department} onChange={set("department")} placeholder="Computer Science" maxLength={100} />
            <Field label="Graduation year" error={errors.graduationYear} type="number" min={MIN_YEAR} max={MAX_YEAR} value={form.graduationYear} onChange={set("graduationYear")} />
            <Field label="Location" error={errors.location} value={form.location} onChange={set("location")} placeholder="Mumbai, India" maxLength={100} />
            <Field label="LinkedIn link" error={errors.linkedin} type="url" value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/…" />
            <Field className="sm:col-span-2" label="Skills (comma separated)" error={errors.skills} hint={`${skillCount}/30 skills`} value={form.skills} onChange={set("skills")} placeholder="React, Node.js, MongoDB" />
            <Field className="sm:col-span-2" as="textarea" rows="4" label="About you" error={errors.bio} hint={`${form.bio.length}/1500`} value={form.bio} onChange={set("bio")} placeholder="Tell others about your interests and goals." maxLength={1500} />
          </div>
        </Section>

        {isAlumni && (
          <Section title="Current position" hint="Alumni are approved by an admin, so you can edit this directly.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Company name" error={errors.companyName} value={form.companyName} onChange={set("companyName")} maxLength={100} />
              <Field label="Job title" error={errors.jobTitle} value={form.jobTitle} onChange={set("jobTitle")} maxLength={100} />
            </div>
          </Section>
        )}

        {isAlumni ? (
          <Section title="Work experience" hint="Add the roles that shaped your career. Fields marked * are required.">
            <ListEditor items={form.experience} onChange={(v) => setForm({ ...form, experience: v })} fields={workFields} addLabel="Add experience" emptyText="No experience added yet." />
            <RowProblems problems={rowProblems.work} />
          </Section>
        ) : (
          <Section title="Internships" hint="Internships you have completed (self-reported). Fields marked * are required.">
            <ListEditor items={form.internships} onChange={(v) => setForm({ ...form, internships: v })} fields={workFields} addLabel="Add internship" emptyText="No internships added yet." />
            <RowProblems problems={rowProblems.work} />
          </Section>
        )}

        <Section title="Achievements" hint="Awards, certifications, hackathons, publications.">
          <ListEditor items={form.achievements} onChange={(v) => setForm({ ...form, achievements: v })} fields={achievementFields} addLabel="Add achievement" emptyText="No achievements added yet." />
          <RowProblems problems={rowProblems.achievements} />
        </Section>

        <div className="sticky bottom-6 flex justify-end z-20">
          <button className={`${btn("primary", "lg")} rounded-2xl shadow-xl shadow-teal-600/20`} disabled={saving}><Save size={18} />{saving ? "Saving…" : "Save profile"}</button>
        </div>
      </form>
    </div>
  );
}