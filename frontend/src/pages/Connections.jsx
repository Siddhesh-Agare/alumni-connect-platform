import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, X, MessageCircle, UserMinus, Network } from "lucide-react";
import api, { getError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import { btn, card, roleBadge, pageNarrow, h1 } from "../ui";

export default function Connections() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [tab, setTab] = useState("connected");

  const load = async () => {
    try {
      const { data } = await api.get("/connections");
      setList(data);
    } catch (e) {
      toast.error(getError(e));
    }
  };
  useEffect(() => { load(); }, []);

  const act = async (request) => {
    try {
      const { data } = await request();
      toast.success(data.message);
      load();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  const other = (c) => (c.requester._id === user._id ? c.recipient : c.requester);
  const groups = {
    connected: list.filter((c) => c.status === "accepted"),
    received: list.filter((c) => c.status === "pending" && c.recipient._id === user._id),
    sent: list.filter((c) => c.status === "pending" && c.requester._id === user._id),
  };
  const tabs = [["connected", "Connected"], ["received", "Requests"], ["sent", "Sent"]];
  const empty = {
    connected: ["No connections yet", "Find people in the directory and send a request."],
    received: ["No pending requests", "New requests will show up here."],
    sent: ["No outgoing requests", "Requests you send will wait here until accepted."],
  };

  const remove = (c) => {
    if (window.confirm(`Remove ${other(c).name}? Your chat history with them will be permanently deleted.`)) {
      act(() => api.delete(`/connections/${c._id}`));
    }
  };

  return (
    <div className={`${pageNarrow} max-w-4xl mx-auto px-6 py-10`}>
      <h1 className={`${h1} text-3xl font-extrabold tracking-tight text-slate-900`}>My network</h1>

      <div className="mt-8 flex gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60" role="tablist">
        {tabs.map(([key, text]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            {text}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${key === "received" && groups.received.length ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"}`}>{groups[key].length}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {groups[tab].length === 0 && (
          <EmptyState icon={Network} title={empty[tab][0]} text={empty[tab][1]}>
            {tab === "connected" && <Link to="/directory" className={`${btn("primary")} mt-4 rounded-xl`}>Open directory</Link>}
          </EmptyState>
        )}
        {groups[tab].map((c) => {
          const o = other(c);
          return (
            <div key={c._id} className={`${card} flex flex-wrap items-center gap-5 border-slate-200/80 p-5 rounded-3xl shadow-sm transition-all hover:border-teal-500/30`}>
              <Avatar name={o.name} size="lg" />
              <div className="min-w-0 flex-1">
                <Link to={`/u/${o._id}`} className="block truncate text-lg font-bold text-slate-900 hover:text-teal-600 transition-colors">{o.name}</Link>
                <span className={`mt-1 inline-block ${roleBadge[o.role]}`}>{o.role}</span>
                {(o.jobTitle || o.companyName) && <p className="mt-1 truncate text-sm text-slate-500">{[o.jobTitle, o.companyName].filter(Boolean).join(" at ")}</p>}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {tab === "received" && (
                  <>
                    <button className={`${btn("primary", "sm")} rounded-xl`} onClick={() => act(() => api.put(`/connections/${c._id}/accept`))}><Check size={16} /> Accept</button>
                    <button className={`${btn("ghost", "sm")} rounded-xl text-slate-600`} onClick={() => act(() => api.put(`/connections/${c._id}/reject`))}><X size={16} /> Reject</button>
                  </>
                )}
                {tab === "sent" && <button className={`${btn("ghost", "sm")} rounded-xl text-slate-600`} onClick={() => act(() => api.delete(`/connections/${c._id}`))}>Cancel request</button>}
                {tab === "connected" && (
                  <>
                    <Link to={`/chat/${o._id}`} className={`${btn("primary", "sm")} rounded-xl`}><MessageCircle size={16} /> Message</Link>
                    <button className={`${btn("danger", "sm")} rounded-xl`} onClick={() => remove(c)}><UserMinus size={16} /> Remove</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}