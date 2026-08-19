"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState({ startDate: todayStr(), endDate: todayStr() });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/cars/${id}`)
      .then((r) => r.json())
      .then((data) => setCar(data.car))
      .finally(() => setLoading(false));
  }, [id]);

  const days =
    dates.startDate && dates.endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(dates.endDate) - new Date(dates.startDate)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 1;
  const total = car ? days * car.pricePerDay : 0;

  function handleProceedToPayment(e) {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Sign in from the top-right corner before booking.");
      return;
    }
    if (new Date(dates.endDate) < new Date(dates.startDate)) {
      setError("Return date must be after the pickup date.");
      return;
    }

    // Booking is NOT created yet — we only pass the intended dates along.
    // The actual reservation is created after payment succeeds on /payment.
    const params = new URLSearchParams({
      carId: car.id,
      startDate: dates.startDate,
      endDate: dates.endDate,
    });
    router.push(`/payment?${params.toString()}`);
  }

  if (loading) {
    return <p className="max-w-6xl mx-auto px-6 py-16 font-mono text-sm text-asphalt/50">Loading…</p>;
  }

  if (!car) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="font-display text-2xl uppercase mb-4">Car not found</p>
        <Link href="/" className="text-steel underline">
          Back to fleet
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1.3fr,1fr] gap-10">
      <div>
        <Link href="/" className="font-mono text-xs uppercase tracking-widest2 text-steel">
          &larr; Back to fleet
        </Link>

        <div className="relative h-72 sm:h-96 w-full mt-4 overflow-hidden">
          <Image src={car.image} alt={car.name} fill className="object-cover" priority />
        </div>

        <div className="mt-6">
          <p className="eyebrow">{car.brand}</p>
          <h1 className="font-display text-4xl uppercase">{car.name}</h1>
          <p className="mt-4 text-asphalt/70 font-body max-w-xl">{car.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              ["Category", car.category],
              ["Transmission", car.transmission],
              ["Seats", car.seats],
              ["Fuel", car.fuel],
              ["Location", car.location],
              ["Status", car.available ? "Available" : "Booked out"],
            ].map(([label, value]) => (
              <div key={label} className="card p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest2 text-asphalt/50">
                  {label}
                </p>
                <p className="font-display text-lg uppercase mt-1">{value}</p>
              </div>
            ))}
          </div>

          {car.features?.length > 0 && (
            <div className="mt-6">
              <p className="label-field">Features</p>
              <div className="flex flex-wrap gap-2">
                {car.features.map((f) => (
                  <span key={f} className="font-mono text-xs border border-asphalt/20 px-3 py-1">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking panel */}
      <div className="card p-6 h-fit sticky top-24">
        <p className="eyebrow mb-1">Book this car</p>
        <p className="plate text-lg mb-6">
          ${car.pricePerDay}
          <span className="text-[10px] font-body normal-case tracking-normal text-asphalt/50">/day</span>
        </p>

        {!car.available && (
          <p className="bg-taillight/10 text-taillight text-sm font-body p-3 mb-4">
            This car is currently booked out. Check back later or pick another vehicle.
          </p>
        )}

        <form onSubmit={handleProceedToPayment} className="flex flex-col gap-4">
          <div>
            <label className="label-field">Pickup date</label>
            <input
              type="date"
              min={todayStr()}
              required
              className="input-field"
              value={dates.startDate}
              onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Return date</label>
            <input
              type="date"
              min={dates.startDate}
              required
              className="input-field"
              value={dates.endDate}
              onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between border-t border-asphalt/10 pt-4 font-mono text-sm">
            <span className="text-asphalt/60">{days} day{days > 1 ? "s" : ""}</span>
            <span className="text-lg font-semibold">${total}</span>
          </div>

          {error && <p className="text-taillight text-sm font-body">{error}</p>}

          <button type="submit" disabled={!car.available} className="btn-primary w-full">
            Proceed to payment
          </button>
          {!user && (
            <p className="text-xs text-asphalt/50 font-body text-center">
              You'll need to sign in first (top-right corner).
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
