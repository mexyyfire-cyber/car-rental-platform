"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

// ---- helpers ----------------------------------------------------------

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function detectCardBrand(digits) {
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return "Card";
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ---- page ---------------------------------------------------------------

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <p className="max-w-6xl mx-auto px-6 py-16 font-mono text-sm text-asphalt/50">
          Loading…
        </p>
      }
    >
      <PaymentPageInner />
    </Suspense>
  );
}

function PaymentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, ready } = useAuth();

  const carId = searchParams.get("carId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("form"); // form | processing | success | error
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!carId) {
      setLoading(false);
      return;
    }
    fetch(`/api/cars/${carId}`)
      .then((r) => r.json())
      .then((data) => setCar(data.car))
      .finally(() => setLoading(false));
  }, [carId]);

  const days =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
        )
      : 1;
  const total = car ? days * car.pricePerDay : 0;
  const cardDigits = card.number.replace(/\D/g, "");
  const brand = detectCardBrand(cardDigits);

  function validate() {
    const next = {};
    if (!card.name.trim()) next.name = "Enter the name on the card.";
    if (cardDigits.length !== 16) next.number = "Card number must be 16 digits.";
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
      next.expiry = "Use MM/YY format.";
    } else {
      const [mm, yy] = card.expiry.split("/").map(Number);
      if (mm < 1 || mm > 12) next.expiry = "Enter a valid month.";
    }
    if (!/^\d{3,4}$/.test(card.cvv)) next.cvv = "3 or 4 digits.";
    return next;
  }

  async function handlePay(e) {
    e.preventDefault();
    setServerError("");

    if (!user) {
      setServerError("Sign in from the top-right corner before paying.");
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("processing");

    // Simulate talking to a card processor. This demo never sends card
    // details anywhere — swap this block for a real gateway (Stripe, etc.)
    // before accepting real payments.
    await new Promise((resolve) => setTimeout(resolve, 1400));

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id,
          userName: user.name,
          userEmail: user.email,
          startDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed after payment");
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 1600);
    } catch (err) {
      setStatus("error");
      setServerError(err.message);
    }
  }

  if (loading || !ready) {
    return <p className="max-w-6xl mx-auto px-6 py-16 font-mono text-sm text-asphalt/50">Loading…</p>;
  }

  if (!carId || !car || !startDate || !endDate) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-display text-2xl uppercase mb-3">Nothing to pay for yet</p>
        <p className="text-asphalt/60 font-body mb-6">
          Pick a car and choose your dates first, then you'll land here to pay.
        </p>
        <Link href="/" className="btn-primary">Browse the fleet</Link>
      </div>
    );
  }

  if (ready && !user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-display text-2xl uppercase mb-3">Sign in to continue</p>
        <p className="text-asphalt/60 font-body">
          Use the sign-in button in the top-right corner, then come back to this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-[1fr,1.1fr] gap-10">
      {/* Order summary */}
      <div>
        <Link
          href={`/cars/${car.id}`}
          className="font-mono text-xs uppercase tracking-widest2 text-steel"
        >
          &larr; Back to car
        </Link>

        <p className="eyebrow mt-6 mb-1">Order summary</p>
        <h1 className="font-display text-3xl uppercase mb-6">Checkout</h1>

        <div className="card p-5 flex gap-4 items-center">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden">
            <Image src={car.image} alt={car.name} fill className="object-cover" />
          </div>
          <div>
            <p className="font-display uppercase text-lg leading-tight">
              {car.brand} {car.name}
            </p>
            <p className="font-mono text-xs text-asphalt/60 mt-1">
              {startDate} &rarr; {endDate}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-asphalt/60">Price per day</span>
            <span>${car.pricePerDay}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-asphalt/60">
              Duration ({days} day{days > 1 ? "s" : ""})
            </span>
            <span>${total}</span>
          </div>
          <div className="flex justify-between border-t border-asphalt/10 pt-2 mt-1 text-lg font-semibold">
            <span>Total due</span>
            <span className="plate">${total}</span>
          </div>
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest2 text-asphalt/40">
          Demo checkout — no real charge is made
        </p>
      </div>

      {/* Card form */}
      <div className="card p-6 h-fit">
        {status === "success" ? (
          <div className="text-center py-10">
            <div className="mx-auto h-14 w-14 rounded-full bg-signal/10 flex items-center justify-center text-signal text-2xl mb-4">
              ✓
            </div>
            <p className="font-display text-2xl uppercase mb-2">Payment successful</p>
            <p className="text-asphalt/60 font-body text-sm">
              Your booking is confirmed. Redirecting to your dashboard…
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Card details</p>
              <span className="font-mono text-xs uppercase tracking-widest2 text-steel">{brand}</span>
            </div>

            <div>
              <label className="label-field">Name on card</label>
              <input
                className="input-field"
                placeholder="A. Khan"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
              />
              {errors.name && <p className="text-taillight text-xs font-body mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label-field">Card number</label>
              <input
                className="input-field font-mono tracking-wider"
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
              />
              {errors.number && <p className="text-taillight text-xs font-body mt-1">{errors.number}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Expiry (MM/YY)</label>
                <input
                  className="input-field font-mono"
                  placeholder="MM/YY"
                  inputMode="numeric"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                />
                {errors.expiry && <p className="text-taillight text-xs font-body mt-1">{errors.expiry}</p>}
              </div>
              <div>
                <label className="label-field">CVV</label>
                <input
                  className="input-field font-mono"
                  placeholder="123"
                  inputMode="numeric"
                  value={card.cvv}
                  onChange={(e) =>
                    setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                  }
                />
                {errors.cvv && <p className="text-taillight text-xs font-body mt-1">{errors.cvv}</p>}
              </div>
            </div>

            {serverError && <p className="text-taillight text-sm font-body">{serverError}</p>}

            <button
              type="submit"
              disabled={status === "processing"}
              className="btn-primary w-full mt-2"
            >
              {status === "processing" ? "Processing payment…" : `Pay $${total}`}
            </button>

            <p className="text-[10px] font-mono uppercase tracking-widest2 text-asphalt/40 text-center">
              This is a demo form — card details are never sent or stored.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
