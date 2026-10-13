import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import api, { getError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { btn, input, page } from "../ui";

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottom = useRef(null);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const { data } = await api.get("/connections");
        setFriends(data.filter((c) => c.status === "accepted").map((c) => (c.requester._id === user._id ? c.recipient : c.requester)));
      } catch (e) {
        toast.error(getError(e));
      }
    };
    loadFriends();
  }, [user]);

  useEffect(() => {
    setMessages([]);
    if (!userId) return;
    let active = true;
    const load = async () => {
      try {
        const { data } = await api.get(`/messages/${userId}`);
        if (active) setMessages(data);
      } catch { /* ignore polling errors */ }
    };
    load();
    const t = setInterval(load, 4000);
    return () => { active = false; clearInterval(t); };
  }, [userId]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await api.post(`/messages/${userId}`, { text });
      setMessages((prev) => [...prev, data]);
      setText("");
    } catch (err) { toast.error(getError(err)); }
  };

  const current = friends.find((f) => f._id === userId);

  return (
    <div className={`${page} max-w-7xl mx-auto px-6 py-6 grid h-[calc(100vh-6rem)] min-h-[560px] gap-6 md:grid-cols-[340px_1fr]`}>
      {/* conversation list */}
      <aside className={`${userId ? "hidden md:flex" : "flex"} flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm`}>
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {friends.length === 0 && <p className="p-4 text-sm text-slate-500 text-center">Connect with someone to start chatting.</p>}
          {friends.map((f) => (
            <button key={f._id} onClick={() => navigate(`/chat/${f._id}`)}
              className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left transition-all ${f._id === userId ? "bg-teal-50/80 ring-1 ring-teal-500/20" : "hover:bg-slate-50"}`}>
              <Avatar name={f.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-slate-900">{f.name}</span>
                <span className="block text-xs font-medium capitalize text-slate-500">{f.role}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* conversation */}
      <section className={`${userId ? "flex" : "hidden md:flex"} flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm`}>
        {!userId ? (
          <div className="grid flex-1 place-items-center p-8 text-center bg-slate-50/30">
            <div>
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-teal-50 text-teal-600 shadow-sm"><MessageCircle size={32} /></span>
              <p className="mt-5 text-lg font-bold text-slate-900">Select a conversation</p>
              <p className="mt-1 text-sm text-slate-500">Pick one of your connections to start chatting.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 bg-white/80 backdrop-blur-md">
              <button onClick={() => navigate("/chat")} className="rounded-xl p-2 hover:bg-slate-100 md:hidden text-slate-600" aria-label="Back to conversations"><ArrowLeft size={20} /></button>
              <Avatar name={current?.name || "?"} />
              <div className="min-w-0 flex-1">
                <Link to={`/u/${userId}`} className="block truncate font-bold text-slate-900 hover:text-teal-600 transition-colors">{current?.name || "Conversation"}</Link>
                <p className="text-xs font-medium capitalize text-slate-500">{current?.role}</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/50 px-6 py-6">
              {messages.length === 0 && <p className="m-auto text-sm text-slate-500">No messages yet. Say hello!</p>}
              {messages.map((m) => {
                const mine = m.sender === user._id;
                return (
                  <div key={m._id} className={`max-w-[75%] break-words rounded-2xl px-5 py-3 text-sm shadow-sm ${mine ? "self-end rounded-br-sm bg-teal-600 text-white shadow-teal-600/10" : "self-start rounded-bl-sm bg-white text-slate-900 border border-slate-200/60"}`}>
                    {m.text}
                    <time className={`mt-1.5 block text-[11px] font-medium ${mine ? "text-teal-100" : "text-slate-400"}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </time>
                  </div>
                );
              })}
              <div ref={bottom} />
            </div>

            <form className="flex gap-3 border-t border-slate-100 p-4 bg-white" onSubmit={send}>
              <input className={`${input} py-3 rounded-2xl border-slate-200 shadow-sm flex-1`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" aria-label="Message" maxLength={1000} />
              <button className={`${btn("primary")} px-5 rounded-2xl shadow-md`} aria-label="Send"><Send size={18} /></button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}