"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Lightweight demo "auth": no passwords, no server session — just captures a
// name/email/role so the dashboard, admin panel, and bookings have someone
// to attach to. Swap for NextAuth/Clerk/etc. before shipping to real users.

const AuthContext = createContext(null);
const STORAGE_KEY = "car-rental-session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore corrupted storage
    }
    setReady(true);
  }, []);

  function login({ name, email, role }) {
    const session = { name, email, role: role || "user" };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
