"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function HistoryPage() {
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

  if (ready && !user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-display text-3xl uppercase mb-3">Sign in to see your history</p>
        <p className="text-asphalt/60 font-body">Use the sign-in button in the top-right corner.</p>
      </div>
    );
  }

  const past = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="eyebrow mb-1">Past rentals</p>
      <h1 className="font-display text-4xl uppercase mb-8">Rental history</h1>

      {loading ? (
        <p className="font-mono text-sm text-asphalt/50">Loading…</p>
      ) : past.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl uppercase mb-2">Nothing here yet</p>
          <p className="text-asphalt/60 font-body text-sm">
            Completed or cancelled bookings will show up in this list.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-widest2 text-asphalt/50 text-left border-b border-asphalt/10">
                <th className="p-4">Car</th>
                <th className="p-4">Pickup</th>
                <th className="p-4">Return</th>
                <th className="p-4">Days</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {past.map((b) => (
                <tr key={b.id} className="border-b border-asphalt/5 last:border-0">
                  <td className="p-4 font-display uppercase">{b.carName}</td>
                  <td className="p-4 font-mono text-xs">{b.startDate}</td>
                  <td className="p-4 font-mono text-xs">{b.endDate}</td>
                  <td className="p-4 font-mono text-xs">{b.totalDays}</td>
                  <td className="p-4 font-mono text-xs">${b.totalPrice}</td>
                  <td className="p-4">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-widest2 px-2 py-1 ${
                        b.status === "completed"
                          ? "bg-asphalt/10 text-asphalt/60"
                          : "bg-taillight/10 text-taillight"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
