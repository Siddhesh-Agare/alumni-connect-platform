import { Link } from "react-router-dom";
import { GraduationCap, Users, Briefcase, MessageCircle, ShieldCheck, BadgeCheck, ArrowRight, Sparkles, MapPin, UserPlus, Send, Building2 } from "lucide-react";
import Avatar from "../components/Avatar";
import { btn } from "../ui";

const features = [
  [Users, "Find your people", "Search alumni and students by company, skill or department and send a connection request."],
  [Briefcase, "Verified opportunities", "Every job post is checked by an admin before students can see it."],
  [MessageCircle, "Private conversations", "Chat with your connections. Remove a connection and the chat is erased too."],
  [ShieldCheck, "Trusted profiles", "Alumni are approved by an admin and student companies must be verified."],
];

const steps = [
  [UserPlus, "Create your profile", "Register as a student or alumni and add your skills, internships and achievements."],
  [Users, "Grow your network", "Send requests, accept new connections and start meaningful conversations."],
  [Briefcase, "Find your next step", "Browse verified jobs shared by alumni who care about your success."],
];

const stats = [
  ["50+", "Active Students"],
  ["120+", "Verified Alumni"],
  ["20+", "Partner Companies"],
  ["98%", "Connection Rate"],
];

export default function Landing() {
  return (
    <div className="bg-white font-sans text-slate-900 selection:bg-teal-500 selection:text-white overflow-x-hidden">
      {/* top bar */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6 py-5 sm:py-6">
          <Link to="/" className="group flex items-center gap-2.5 sm:gap-3 text-white">
            <span className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/30 backdrop-blur-md transition-transform group-hover:scale-105">
              <GraduationCap size={22} className="text-teal-300" />
            </span>
            <span className="text-lg sm:text-xl font-bold tracking-tight">Alumni Connect</span>
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link to="/login" className={btn("outlineLight")}>Log in</Link>
            <Link to="/register" className={`${btn("light")} hidden sm:inline-flex shadow-lg shadow-teal-900/20`}>Get started</Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden bg-slate-950 pb-20 sm:pb-28 pt-32 sm:pt-36 text-white lg:pt-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="pointer-events-none absolute -right-32 top-10 h-[24rem] sm:h-[32rem] w-[24rem] sm:w-[32rem] rounded-full bg-teal-500/20 blur-[100px] sm:blur-[120px]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[20rem] sm:h-[28rem] w-[20rem] sm:w-[28rem] rounded-full bg-emerald-500/15 blur-[100px] sm:blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 sm:gap-16 px-5 sm:px-6 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-teal-300 ring-1 ring-teal-500/30 backdrop-blur-md">
              <Sparkles size={15} className="text-teal-400" /> Verified student–alumni network
            </div>
            <h1 className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Learn from alumni who{" "}
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                walked your path.
              </span>
            </h1>
            <p className="mt-5 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Connect directly with graduates, discover verified job and internship openings, and receive personalized career mentorship.
            </p>
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start items-center gap-3.5">
              <Link to="/register" className={`${btn("light", "lg")} shadow-xl shadow-teal-500/20 hover:scale-[1.02] transition-transform w-full sm:w-auto justify-center`}>
                Join the network <ArrowRight size={18} />
              </Link>
              <Link to="/login" className={`${btn("outlineLight", "lg")} hover:bg-white/10 transition-colors w-full sm:w-auto justify-center`}>
                I already have an account
              </Link>
            </div>
          </div>

          {/* floating product preview - Responsive scale for mobile */}
          <div className="relative mx-auto h-[380px] sm:h-[460px] w-full max-w-md lg:max-w-none">
            <div className="motion-safe:animate-float absolute left-0 top-2 sm:top-4 w-64 sm:w-72 rounded-3xl bg-white/95 p-4 sm:p-5 text-slate-900 shadow-2xl shadow-black/40 ring-1 ring-slate-900/10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Avatar name="Siddhesh Agare" size="lg" />
                <div>
                  <p className="flex items-center gap-1 font-bold text-slate-900 text-sm sm:text-base">
                    Siddhesh Agare <BadgeCheck size={16} className="text-emerald-600 shrink-0" />
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">Software Engineer</p>
                  <p className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 mt-0.5"><MapPin size={12} /> Mumbai · Class of 2026</p>
                </div>
              </div>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {["React", "Node.js", "MongoDB"].map((s) => (
                  <span key={s} className="rounded-md bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">{s}</span>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-center text-xs sm:text-sm font-semibold text-white shadow-md shadow-teal-600/20">Connect</div>
            </div>

            <div className="motion-safe:animate-float-slow absolute bottom-8 sm:bottom-12 right-0 w-60 sm:w-72 rounded-3xl bg-white/95 p-4 sm:p-5 text-slate-900 shadow-2xl shadow-black/40 ring-1 ring-slate-900/10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 font-bold shrink-0">
                  <Building2 size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">Frontend Intern</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">Acme Labs · Remote</p>
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                  <BadgeCheck size={13} /> Verified by admin
                </span>
              </div>
            </div>

            <div className="motion-safe:animate-float absolute bottom-0 left-4 sm:left-6 flex items-center gap-2 rounded-2xl rounded-bl-sm bg-gradient-to-r from-teal-600 to-emerald-600 px-3.5 sm:px-4.5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-teal-900/30">
              <Send size={15} className="text-teal-200 shrink-0" /> Happy to review your resume!
            </div>
          </div>
        </div>

        {/* Stats Ticker */}
        <div className="relative mx-auto mt-16 sm:mt-20 max-w-7xl px-5 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 rounded-3xl bg-slate-900/85 p-6 sm:p-8 ring-1 ring-slate-800 backdrop-blur-xl sm:grid-cols-4 lg:gap-8 shadow-2xl">
            {stats.map(([value, label]) => (
              <div key={label} className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{value}</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">Everything your campus community needs</h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600">Purpose-built networking tools centered around verified safety and genuine career growth.</p>
        </div>
        <div className="mt-12 sm:mt-16 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([Icon, title, text]) => (
            <div key={title} className="group rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-900/5">
              <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                <Icon size={24} />
              </span>
              <h3 className="mt-5 sm:mt-6 text-lg sm:text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="bg-slate-50/70 py-20 sm:py-28 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">How Alumni Connect works</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600">Get onboarded and start building meaningful professional relationships in three steps.</p>
          </div>
          <div className="mt-12 sm:mt-16 grid gap-6 sm:gap-8 md:grid-cols-3">
            {steps.map(([Icon, title, text], i) => (
              <div key={title} className="relative rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md">
                <span className="absolute -top-3.5 left-6 sm:left-8 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-teal-600 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-600/30">
                  0{i + 1}
                </span>
                <div className="mt-1 sm:mt-2 text-teal-600">
                  <Icon size={26} />
                </div>
                <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 py-20 sm:py-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 px-6 sm:px-12 py-12 sm:py-16 text-center text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />
          
          <h2 className="relative text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">Ready to join your alumni network?</h2>
          <p className="relative mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-lg text-teal-100/90 font-normal">
            Students join instantly. Alumni are approved by an admin to keep the community trusted.
          </p>
          <div className="relative mt-8 sm:mt-10 flex justify-center">
            <Link to="/register" className={`${btn("light", "lg")} w-full sm:w-auto justify-center shadow-xl shadow-black/20 hover:scale-105 transition-transform`}>
              Create your account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 sm:py-10 text-center text-xs sm:text-sm text-slate-500">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© Alumni Connect · Built with the MERN stack</p>
          <div className="flex gap-6 text-slate-600 font-medium">
            <Link to="/login" className="hover:text-teal-600 transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-teal-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}