"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/", label: "Fleet" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "user" });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    login(form);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-asphalt text-paper">
      <div className="lane-divider" />
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="font-display text-2xl uppercase tracking-wide">
          Route<span className="text-lane">61</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors hover:text-lane ${
                pathname === l.href ? "text-lane" : "text-paper/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="relative">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm leading-tight">{user.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest2 text-lane">
                  {user.role}
                </p>
              </div>
              <button onClick={logout} className="btn-ghost-light !px-4 !py-2 text-xs">
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={() => setOpen((o) => !o)} className="btn-ghost-light !px-4 !py-2 text-xs">
              Sign in
            </button>
          )}

          {open && !user && (
            <form
              onSubmit={handleSubmit}
              className="absolute right-0 mt-3 w-72 card bg-white text-asphalt p-5 flex flex-col gap-3"
            >
              <p className="eyebrow">Quick sign-in (demo)</p>
              <input
                required
                placeholder="Full name"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <select
                className="input-field"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">Renter</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="btn-primary w-full">
                Continue
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
