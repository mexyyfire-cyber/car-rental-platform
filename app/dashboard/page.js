"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";

const STATUS_STYLES = {
  upcoming: "bg-steel/10 text-steel",
  active: "bg-signal/10 text-signal",
  completed: "bg-asphalt/10 text-asphalt/60",
  cancelled: "bg-taillight/10 text-taillight",
};

export default function DashboardPage() {
  const { user, ready } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch(`/api/bookings?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  }, [user]);

  async function cancelBooking(id) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
  }

  if (ready && !user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-display text-3xl uppercase mb-3">Sign in to see your dashboard</p>
        <p className="text-asphalt/60 font-body">
          Use the sign-in button in the top-right corner, then come back here.
        </p>
      </div>
    );
  }

  const active = bookings.filter((b) => ["upcoming", "active"].includes(b.status));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="eyebrow mb-1">Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}</p>
      <h1 className="font-display text-4xl uppercase mb-8">My dashboard</h1>

      {loading ? (
        <p className="font-mono text-sm text-asphalt/50">Loading bookings…</p>
      ) : active.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl uppercase mb-2">No active bookings</p>
          <p className="text-asphalt/60 font-body text-sm mb-5">
            Reserve a car from the fleet to see it show up here.
          </p>
          <Link href="/" className="btn-primary">
            Browse the fleet
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {active.map((b) => (
            <div key={b.id} className="card p-5 flex flex-col sm:flex-row gap-5 sm:items-center">
              <div className="relative h-24 w-full sm:w-36 shrink-0 overflow-hidden">
                <Image src={b.carImage} alt={b.carName} fill className="object-cover" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-display text-lg uppercase">{b.carName}</h3>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest2 px-2 py-1 ${STATUS_STYLES[b.status]}`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="font-mono text-xs text-asphalt/60 mt-1">
                  {b.startDate} &rarr; {b.endDate} &bull; {b.totalDays} day{b.totalDays > 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="plate">${b.totalPrice}</span>
                {b.status === "upcoming" && (
                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="font-mono text-xs uppercase tracking-widest2 text-taillight hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 font-mono text-xs text-asphalt/50">
        Looking for past rentals? Check your{" "}
        <Link href="/history" className="text-steel underline">
          rental history
        </Link>
        .
      </p>
    </div>
  );
}
