# Route 61 — Car Rental Platform (Next.js)

A working car rental platform built with **Next.js 14 (App Router)** and **Tailwind CSS**.

## Features

- **Fleet listing** — grid of cars with photos, specs, and pricing
- **Search / filter** — by name/brand, category, city, and max price/day
- **Booking dates** — pick-up/return date picker with live price calculation
- **Checkout / payment page** — clicking "Proceed to payment" on a car takes you to `/payment`, where you enter card details (name, number, expiry, CVV) before anything is booked. The booking is only created after the simulated payment succeeds.
- **User dashboard** — see and cancel your upcoming/active bookings
- **Admin panel** — add new cars, toggle availability, delete cars, and manage every booking (start / complete / cancel)
- **Rental history** — table of your completed/cancelled rentals

## Payment flow (demo)

This ships with a **simulated** checkout, not a real payment gateway:
- The card form validates format locally (16-digit number, MM/YY expiry, 3–4 digit CVV) and never sends card details anywhere — nothing is stored or transmitted.
- On "Pay", it waits ~1.4s to mimic a processor round-trip, then creates the actual booking via `POST /api/bookings`.
- If the "payment" step fails validation, no booking is created — the car stays available.

**Before accepting real payments**, replace the simulated delay in `app/payment/page.js` with a real gateway integration (Stripe, PayFast, JazzCash, etc.) — typically: create a PaymentIntent/order on the server, collect card details through the gateway's own secure hosted fields (never your own raw `<input>` for card numbers), confirm the charge, and only then call `POST /api/bookings`.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

> Runs on **Next.js 16** (upgraded from an earlier 14.x build to close out known security advisories — `npm audit` reports 0 vulnerabilities as of this version).

## How sign-in works (demo auth)

There's no password system. Click **Sign in** (top right), enter a name + email,
and pick a role:
- **Renter** → can browse, book cars, and use the dashboard/history
- **Admin** → unlocks `/admin` to manage the fleet and all bookings

Session is stored in `localStorage` only — this is intentionally simple so you
can try every feature immediately. Swap in real auth (NextAuth.js, Clerk, etc.)
before shipping to real users.

## Data storage

Cars and bookings live in `data/db.json`, read/written by `lib/db.js`. This
keeps the demo dependency-free (no database needed to try it), but it's a
**local file**, not a real database.

### Going to production
Before deploying (e.g. to Vercel), swap `lib/db.js` for a real database:
- Postgres (with Prisma or Drizzle) — easiest to reason about relational data (cars/bookings/users)
- Or any managed DB (Supabase, PlanetScale, MongoDB Atlas)

Because the API routes (`app/api/**/route.js`) already isolate all data access
inside `lib/db.js`, you can swap the implementation there without touching
any page code.

## Project structure

```
app/
  page.js                 → home page (listing + search/filter)
  cars/[id]/page.js        → car detail + date picker ("Proceed to payment")
  payment/page.js          → checkout: order summary + card form, creates the booking on success
  dashboard/page.js        → user's upcoming/active bookings
  history/page.js          → user's completed/cancelled bookings
  admin/page.js             → add cars, manage fleet, manage all bookings
  api/cars/route.js         → GET all cars, POST new car
  api/cars/[id]/route.js    → GET/PUT/DELETE one car
  api/bookings/route.js     → GET bookings (optionally by ?email=), POST new booking
  api/bookings/[id]/route.js → PATCH booking status
components/
  AuthProvider.js   → mock session context
  Navbar.js         → nav + sign-in popover
  CarCard.js        → fleet grid card
  SearchFilter.js   → search/filter bar
lib/db.js            → JSON-file "database" helpers
data/db.json          → seed cars + bookings
```

## Notes

- Car images default to Unsplash URLs; the admin form lets you paste your own image URL when adding a car.
- Booking a car marks it unavailable until the booking is cancelled or completed by an admin.
