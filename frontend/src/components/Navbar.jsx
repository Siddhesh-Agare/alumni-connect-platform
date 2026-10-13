import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GraduationCap, LayoutDashboard, Search, Network, MessageCircle, Briefcase, ShieldCheck, UserCircle, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

const link = ({ isActive }) =>
  `flex items-center gap-2.5 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
    isActive ? "bg-teal-50 text-teal-700 ring-1 ring-teal-500/20" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
  }`;

const mobileLink = ({ isActive }) =>
  `flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-base font-semibold transition-all ${
    isActive ? "bg-teal-50 text-teal-700 ring-1 ring-teal-500/20" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/");
  };

  const items =
    user.role === "admin"
      ? [["/", "Dashboard", LayoutDashboard, true], ["/jobs", "Jobs", Briefcase], ["/admin", "Admin", ShieldCheck]]
      : [
          ["/", "Dashboard", LayoutDashboard, true],
          ["/directory", "Directory", Search],
          ["/connections", "Network", Network],
          ["/chat", "Messages", MessageCircle],
          ["/jobs", "Jobs", Briefcase],
          ["/profile", "My profile", UserCircle],
        ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-md shadow-teal-600/20 transition-transform group-hover:scale-105">
            <GraduationCap size={22} />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Alumni Connect</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {items.map(([to, text, Icon, end]) => (
            <NavLink key={to} to={to} end={end} className={link}>
              <Icon size={18} /> {text}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Info & Logout (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <Avatar name={user.name} size="sm" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs font-medium capitalize text-slate-500">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            aria-label="Log out" 
            title="Log out" 
            className="rounded-xl p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={19} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
          className="rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown / Overlay */}
      {mobileMenuOpen && (
        <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white/95 px-6 py-6 shadow-2xl backdrop-blur-xl lg:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-slate-100">
            <Avatar name={user.name} size="md" />
            <div className="leading-tight">
              <p className="text-base font-bold text-slate-900">{user.name}</p>
              <p className="text-xs font-semibold capitalize text-teal-600 mt-0.5">{user.role}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {items.map(([to, text, Icon, end]) => (
              <NavLink 
                key={to} 
                to={to} 
                end={end} 
                onClick={() => setMobileMenuOpen(false)} 
                className={mobileLink}
              >
                <Icon size={20} /> {text}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <button 
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }} 
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut size={18} /> Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}