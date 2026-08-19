"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";

const EMPTY_FORM = {
  name: "",
  brand: "",
  category: "Sedan",
  transmission: "Automatic",
  seats: 5,
  fuel: "Petrol",
  pricePerDay: 50,
  location: "Islamabad",
  image: "",
  description: "",
  features: "",
};

export default function AdminPage() {
  const { user, ready } = useAuth();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("cars");

  const isAdmin = user?.role === "admin";

  async function loadData() {
    const [carsRes, bookingsRes] = await Promise.all([
      fetch("/api/cars").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ]);
    setCars(carsRes.cars || []);
    setBookings(bookingsRes.bookings || []);
  }

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  async function handleAddCar(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          seats: Number(form.seats),
          pricePerDay: Number(form.pricePerDay),
          features: form.features
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add car");
      setCars((prev) => [data.car, ...prev]);
      setForm(EMPTY_FORM);
      setMessage("Car added to the fleet.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAvailability(car) {
    const res = await fetch(`/api/cars/${car.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !car.available }),
    });
    const data = await res.json();
    setCars((prev) => prev.map((c) => (c.id === car.id ? data.car : c)));
  }

  async function removeCar(id) {
    if (!confirm("Remove this car from the fleet?")) return;
    await fetch(`/api/cars/${id}`, { method: "DELETE" });
    setCars((prev) => prev.filter((c) => c.id !== id));
  }

  async function setBookingStatus(id, status) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setBookings((prev) => prev.map((b) => (b.id === id ? data.booking : b)));
  }

  if (ready && !user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-display text-3xl uppercase mb-3">Admin sign-in required</p>
        <p className="text-asphalt/60 font-body">
          Sign in from the top-right corner and choose the "Admin" role.
        </p>
      </div>
    );
  }

  if (ready && user && !isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-display text-3xl uppercase mb-3">Admins only</p>
        <p className="text-asphalt/60 font-body">
          You're signed in as a renter. Sign out and sign back in with the "Admin" role to manage the fleet.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="eyebrow mb-1">Fleet management</p>
      <h1 className="font-display text-4xl uppercase mb-8">Admin panel</h1>

      <div className="flex gap-2 mb-8 font-mono text-xs uppercase tracking-widest2">
        {[
          ["cars", "Cars"],
          ["add", "Add a car"],
          ["bookings", "All bookings"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 border ${
              tab === key ? "bg-asphalt text-paper border-asphalt" : "border-asphalt/20 text-asphalt/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "add" && (
        <form onSubmit={handleAddCar} className="card p-6 grid sm:grid-cols-2 gap-4 max-w-3xl">
          <div>
            <label className="label-field">Model name</label>
            <input required className="input-field" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Brand</label>
            <input required className="input-field" value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Category</label>
            <select className="input-field" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {["Sedan", "SUV", "Hatchback", "Luxury", "Electric", "Van"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Transmission</label>
            <select className="input-field" value={form.transmission}
              onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
              <option>Automatic</option>
              <option>Manual</option>
            </select>
          </div>
          <div>
            <label className="label-field">Seats</label>
            <input type="number" min={1} max={15} className="input-field" value={form.seats}
              onChange={(e) => setForm({ ...form, seats: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Fuel</label>
            <select className="input-field" value={form.fuel}
              onChange={(e) => setForm({ ...form, fuel: e.target.value })}>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </select>
          </div>
          <div>
            <label className="label-field">Price per day (USD)</label>
            <input type="number" min={1} className="input-field" value={form.pricePerDay}
              onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Pickup location</label>
            <input className="input-field" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label-field">Image URL (optional)</label>
            <input className="input-field" placeholder="https://..." value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label-field">Description</label>
            <textarea className="input-field" rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label-field">Features (comma separated)</label>
            <input className="input-field" placeholder="Sunroof, Cruise Control, ..." value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })} />
          </div>

          {message && <p className="sm:col-span-2 font-body text-sm text-steel">{message}</p>}

          <button type="submit" disabled={submitting} className="btn-primary sm:col-span-2">
            {submitting ? "Adding…" : "Add car to fleet"}
          </button>
        </form>
      )}

      {tab === "cars" && (
        <div className="grid gap-4">
          {cars.map((car) => (
            <div key={car.id} className="card p-4 flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="relative h-20 w-full sm:w-32 shrink-0 overflow-hidden">
                <Image src={car.image} alt={car.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg uppercase">{car.brand} {car.name}</h3>
                <p className="font-mono text-xs text-asphalt/60">
                  {car.category} &bull; ${car.pricePerDay}/day &bull; {car.location}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleAvailability(car)}
                  className={`font-mono text-[10px] uppercase tracking-widest2 px-3 py-2 border ${
                    car.available ? "border-signal text-signal" : "border-taillight text-taillight"
                  }`}
                >
                  {car.available ? "Available" : "Booked out"}
                </button>
                <button
                  onClick={() => removeCar(car.id)}
                  className="font-mono text-[10px] uppercase tracking-widest2 text-taillight hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {cars.length === 0 && <p className="font-mono text-sm text-asphalt/50">No cars yet.</p>}
        </div>
      )}

      {tab === "bookings" && (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-widest2 text-asphalt/50 text-left border-b border-asphalt/10">
                <th className="p-4">Renter</th>
                <th className="p-4">Car</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-asphalt/5 last:border-0">
                  <td className="p-4">
                    <p className="font-body">{b.userName}</p>
                    <p className="font-mono text-[10px] text-asphalt/50">{b.userEmail}</p>
                  </td>
                  <td className="p-4 font-display uppercase text-xs">{b.carName}</td>
                  <td className="p-4 font-mono text-xs">{b.startDate} → {b.endDate}</td>
                  <td className="p-4 font-mono text-xs">${b.totalPrice}</td>
                  <td className="p-4 font-mono text-[10px] uppercase tracking-widest2">{b.status}</td>
                  <td className="p-4">
                    <div className="flex gap-3 font-mono text-[10px] uppercase tracking-widest2">
                      {b.status === "upcoming" && (
                        <button onClick={() => setBookingStatus(b.id, "active")} className="text-steel hover:underline">
                          Start
                        </button>
                      )}
                      {b.status === "active" && (
                        <button onClick={() => setBookingStatus(b.id, "completed")} className="text-signal hover:underline">
                          Complete
                        </button>
                      )}
                      {["upcoming", "active"].includes(b.status) && (
                        <button onClick={() => setBookingStatus(b.id, "cancelled")} className="text-taillight hover:underline">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 font-mono text-sm text-asphalt/50">No bookings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
