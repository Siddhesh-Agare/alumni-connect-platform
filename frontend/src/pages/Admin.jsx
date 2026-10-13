import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, X, Pencil, Trash2, ExternalLink, UserCheck, Building2, Briefcase, Users, ShieldCheck } from "lucide-react";
import api, { getError } from "../services/api";
import Avatar from "../components/Avatar";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Field from "../components/Field";
import { rules, clean, hasErrors } from "../utils/validators";
import { btn, card, statusBadge, roleBadge, page, h1 } from "../ui";

function AdminEditForm({ user, onSave }) {
  const [f, setF] = useState({
    name: user.name || "", headline: user.headline || "", department: user.department || "",
    graduationYear: user.graduationYear || "", companyName: user.companyName || "", jobTitle: user.jobTitle || "",
    skills: (user.skills || []).join(", "), linkedin: user.linkedin || "", bio: user.bio || "",
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: "" }); };
  const submit = (e) => {
    e.preventDefault();
    const found = clean({
      name: rules.name(f.name),
      graduationYear: rules.year(f.graduationYear),
      linkedin: rules.url(f.linkedin, "LinkedIn link", "linkedin.com"),
      companyName: rules.max(f.companyName, "Company", 100),
      jobTitle: rules.max(f.jobTitle, "Job title", 100),
      bio: rules.max(f.bio, "Bio", 1500),
    });
    setErrors(found);
    if (!hasErrors(found)) onSave(f);
  };
  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
      <Field label="Name" error={errors.name} value={f.name} onChange={set("name")} />
      <Field label="Headline" value={f.headline} onChange={set("headline")} maxLength={120} />
      <Field label="Department" value={f.department} onChange={set("department")} maxLength={100} />
      <Field label="Graduation year" error={errors.graduationYear} type="number" value={f.graduationYear} onChange={set("graduationYear")} />
      <Field label="Company (verified)" error={errors.companyName} value={f.companyName} onChange={set("companyName")} />
      <Field label="Job title" error={errors.jobTitle} value={f.jobTitle} onChange={set("jobTitle")} />
      <Field className="sm:col-span-2" label="Skills (comma separated)" value={f.skills} onChange={set("skills")} />
      <Field className="sm:col-span-2" label="LinkedIn" error={errors.linkedin} value={f.linkedin} onChange={set("linkedin")} />
      <Field className="sm:col-span-2" as="textarea" rows="3" label="Bio" error={errors.bio} value={f.bio} onChange={set("bio")} />
      <button className={`${btn("primary")} sm:col-span-2 rounded-xl`}>Save changes</button>
    </form>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("alumni");
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [companyReqs, setCompanyReqs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState("pending");
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("");
  const [editing, setEditing] = useState(null);

  const loadAll = async () => {
    try {
      const [statsRes, pendingRes, companyRes, jobsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users", { params: { status: "pending" } }),
        api.get("/admin/company-requests"),
        api.get("/admin/jobs", { params: jobFilter ? { status: jobFilter } : {} }),
        api.get("/admin/users", { params: userFilter ? { status: userFilter } : {} }),
      ]);
      setStats(statsRes.data);
      setPendingUsers(pendingRes.data);
      setCompanyReqs(companyRes.data);
      setJobs(jobsRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      toast.error(getError(e));
    }
  };
  useEffect(() => { loadAll(); }, [jobFilter, userFilter]);

  const act = async (request) => {
    try {
      const { data } = await request();
      toast.success(data.message);
      setEditing(null);
      loadAll();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  const tabs = [
    ["alumni", "Alumni approvals", UserCheck, stats?.pendingAlumni],
    ["company", "Company requests", Building2, stats?.pendingCompany],
    ["jobs", "Job posts", Briefcase, stats?.pendingJobs],
    ["users", "All users", Users],
  ];
  const stat = [
    ["Students", stats?.students], ["Approved alumni", stats?.alumni], ["Live jobs", stats?.jobs], ["Pending jobs", stats?.pendingJobs],
  ];

  const Row = ({ children }) => <div className={`${card} flex flex-wrap items-center gap-4 p-5 rounded-3xl border-slate-200/80 shadow-sm`}>{children}</div>;
  const Pills = ({ value, onChange, options }) => (
    <div className="mb-6 flex flex-wrap gap-2">
      {options.map(([v, text]) => (
        <button key={v} onClick={() => onChange(v)} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${value === v ? "border-teal-600 bg-teal-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{text}</button>
      ))}
    </div>
  );

  return (
    <div className={`${page} max-w-7xl mx-auto px-6 py-10`}>
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-600"><ShieldCheck size={26} /></span>
        <h1 className={`${h1} text-3xl font-extrabold tracking-tight text-slate-900`}>Admin panel</h1>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stat.map(([name, v]) => (
          <div key={name} className={`${card} border-slate-200/80 p-6 rounded-3xl shadow-sm`}>
            <p className="text-3xl font-extrabold text-teal-600">{v ?? "–"}</p>
            <p className="mt-1.5 text-sm font-medium text-slate-500">{name}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60" role="tablist">
        {tabs.map(([key, text, Icon, count]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold transition-all ${tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            <Icon size={18} />{text}
            {count > 0 && <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">{count}</span>}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "alumni" && (
          <div className="space-y-4">
            {pendingUsers.length === 0 && <EmptyState icon={UserCheck} title="No alumni waiting" text="New alumni registrations will appear here for approval[." />}
            {pendingUsers.map((u) => (
              <Row key={u._id}>
                <Avatar name={u.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">{u.name}</p>
                  <p className="text-sm text-slate-500">{u.email}{u.graduationYear && ` · Class of ${u.graduationYear}`}</p>
                </div>
                <div className="flex gap-2.5">
                  <button className={`${btn("primary", "sm")} rounded-xl`} onClick={() => act(() => api.put(`/admin/users/${u._id}/approve`))}><Check size={16} /> Approve</button>
                  <button className={`${btn("danger", "sm")} rounded-xl`} onClick={() => act(() => api.put(`/admin/users/${u._id}/reject`))}><X size={16} /> Reject</button>
                </div>
              </Row>
            ))}
          </div>
        )}

        {tab === "company" && (
          <div className="space-y-4">
            {companyReqs.length === 0 && <EmptyState icon={Building2} title="No company requests" text="When a student claims a company, it shows up here to verify." />}
            {companyReqs.map((u) => (
              <Row key={u._id}>
                <Avatar name={u.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">{u.name} <span className="text-sm font-normal text-slate-500">({u.email})</span></p>
                  <p className="text-sm text-slate-600 mt-0.5">Claims: <b>{u.companyRequest.jobTitle}</b> at <b>{u.companyRequest.companyName}</b></p>
                  {u.companyRequest.proof
                    ? <a href={u.companyRequest.proof} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:underline mt-1">View proof <ExternalLink size={14} /></a>
                    : <p className="text-sm text-amber-700 mt-1">No proof provided</p>}
                </div>
                <div className="flex gap-2.5">
                  <button className={`${btn("primary", "sm")} rounded-xl`} onClick={() => act(() => api.put(`/admin/company-requests/${u._id}/approve`))}><Check size={16} /> Verify</button>
                  <button className={`${btn("danger", "sm")} rounded-xl`} onClick={() => act(() => api.put(`/admin/company-requests/${u._id}/reject`))}><X size={16} /> Reject</button>
                </div>
              </Row>
            ))}
          </div>
        )}

        {tab === "jobs" && (
          <>
            <Pills value={jobFilter} onChange={setJobFilter} options={[["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["", "All"]]} />
            <div className="space-y-4">
              {jobs.length === 0 && <EmptyState icon={Briefcase} title="No jobs here" text="Nothing matches this filter." />}
              {jobs.map((j) => (
                <Row key={j._id}>
                  <Avatar name={j.company} square size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 flex items-center gap-2">{j.title} <span className={statusBadge[j.status]}>{j.status}</span></p>
                    <p className="text-sm font-medium text-slate-600">{j.company}{j.location && ` · ${j.location}`} · {j.type}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{j.description}</p>
                    <p className="mt-1.5 text-xs text-slate-400">By {j.postedBy?.name} ({j.postedBy?.email})
                      {j.applyLink && <> · <a href={j.applyLink} target="_blank" rel="noreferrer" className="font-semibold text-teal-600 hover:underline">Open apply link</a></>}
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    {j.status !== "approved" && <button className={`${btn("primary", "sm")} rounded-xl`} onClick={() => act(() => api.put(`/admin/jobs/${j._id}/approve`))}><Check size={16} /> Approve</button>}
                    {j.status === "pending" && <button className={`${btn("ghost", "sm")} rounded-xl text-slate-600`} onClick={() => act(() => api.put(`/admin/jobs/${j._id}/reject`))}><X size={16} /> Reject</button>}
                  </div>
                </Row>
              ))}
            </div>
          </>
        )}

        {tab === "users" && (
          <>
            <Pills value={userFilter} onChange={setUserFilter} options={[["", "All"], ["approved", "Approved"], ["pending", "Pending"], ["rejected", "Rejected"]]} />
            <div className={`${card} overflow-x-auto p-0 rounded-3xl border-slate-200/80 shadow-sm`}>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>{["User", "Role", "Status", "Company", "Actions"].map((h) => <th key={h} className="px-6 py-4 font-bold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <Avatar name={u.name} size="sm" />
                          <div><Link to={`/u/${u._id}`} className="font-bold text-slate-900 hover:text-teal-600 transition-colors">{u.name}</Link><p className="text-xs text-slate-500">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className={roleBadge[u.role]}>{u.role}</span></td>
                      <td className="px-6 py-4"><span className={statusBadge[u.status]}>{u.status}</span></td>
                      <td className="px-6 py-4 font-medium text-slate-600">{u.companyName || "–"}</td>
                      <td className="px-6 py-4">
                        {u.role !== "admin" && (
                          <div className="flex gap-2">
                            {u.status !== "approved" && <button className={`${btn("primary", "sm")} rounded-xl`} onClick={() => act(() => api.put(`/admin/users/${u._id}/approve`))}>Approve</button>}
                            <button aria-label="Edit user" className={`${btn("ghost", "sm")} rounded-xl text-slate-600`} onClick={() => setEditing(u)}><Pencil size={15} /></button>
                            <button aria-label="Delete user" className={`${btn("danger", "sm")} rounded-xl`} onClick={() => window.confirm(`Delete ${u.name}? Their jobs, connections and chats will also be deleted .`) && act(() => api.delete(`/admin/users/${u._id}`))}><Trash2 size={15} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="p-8 text-center text-slate-500">No users found .</p>}
            </div>
          </>
        )}
      </div>

      {editing && (
        <Modal title={`Edit ${editing.name}`} onClose={() => setEditing(null)} wide>
          <AdminEditForm user={editing} onSave={(data) => act(() => api.put(`/admin/users/${editing._id}`, data))} />
        </Modal>
      )}
    </div>
  );
}