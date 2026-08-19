import fs from "fs";
import path from "path";

// NOTE: This is a lightweight, file-based "database" meant for local
// development and demoing the product end-to-end without wiring up a real
// DB. On serverless hosts (Vercel) the filesystem is read-only/ephemeral in
// production, so swap this out for Postgres/Mongo/etc. before shipping.
// See README.md -> "Going to production".

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function readDb() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// ---- Cars ----
export function getCars() {
  return readDb().cars;
}

export function getCarById(id) {
  return readDb().cars.find((c) => c.id === id) || null;
}

export function addCar(car) {
  const db = readDb();
  const newCar = {
    id: uid("c"),
    available: true,
    features: [],
    image:
      car.image ||
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    ...car,
  };
  db.cars.unshift(newCar);
  writeDb(db);
  return newCar;
}

export function updateCar(id, patch) {
  const db = readDb();
  const idx = db.cars.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.cars[idx] = { ...db.cars[idx], ...patch };
  writeDb(db);
  return db.cars[idx];
}

export function deleteCar(id) {
  const db = readDb();
  db.cars = db.cars.filter((c) => c.id !== id);
  writeDb(db);
  return true;
}

// ---- Bookings ----
export function getBookings() {
  return readDb().bookings;
}

export function getBookingsByUser(email) {
  return readDb().bookings.filter(
    (b) => b.userEmail.toLowerCase() === email.toLowerCase()
  );
}

export function addBooking(booking) {
  const db = readDb();
  const car = db.cars.find((c) => c.id === booking.carId);
  if (!car) throw new Error("Car not found");
  if (!car.available) throw new Error("Car is not available");

  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);
  const totalDays = Math.max(
    1,
    Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  );

  const newBooking = {
    id: uid("bk"),
    carId: car.id,
    carName: `${car.brand} ${car.name}`,
    carImage: car.image,
    pricePerDay: car.pricePerDay,
    userName: booking.userName,
    userEmail: booking.userEmail,
    startDate: booking.startDate,
    endDate: booking.endDate,
    totalDays,
    totalPrice: totalDays * car.pricePerDay,
    status: "upcoming",
    createdAt: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);
  // Mark the car unavailable while it's booked out
  car.available = false;
  writeDb(db);
  return newBooking;
}

export function updateBookingStatus(id, status) {
  const db = readDb();
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  db.bookings[idx].status = status;

  // Free up the car again on cancel/complete
  if (status === "cancelled" || status === "completed") {
    const car = db.cars.find((c) => c.id === db.bookings[idx].carId);
    if (car) car.available = true;
  }

  writeDb(db);
  return db.bookings[idx];
}
