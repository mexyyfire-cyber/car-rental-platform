import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const REDIS_KEY = "car-rental-db";

const REDIS_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);

const redis = useRedis ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

function readSeed() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

async function readDb() {
  if (useRedis) {
    const existing = await redis.get(REDIS_KEY);
    if (existing) return existing;
    const seed = readSeed();
    await redis.set(REDIS_KEY, seed);
    return seed;
  }
  return readSeed();
}

async function writeDb(data) {
  if (useRedis) {
    await redis.set(REDIS_KEY, data);
  } else {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  }
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export async function getCars() {
  const db = await readDb();
  return db.cars;
}

export async function getCarById(id) {
  const db = await readDb();
  return db.cars.find((c) => c.id === id) || null;
}

export async function addCar(car) {
  const db = await readDb();
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
  await writeDb(db);
  return newCar;
}

export async function updateCar(id, patch) {
  const db = await readDb();
  const idx = db.cars.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.cars[idx] = { ...db.cars[idx], ...patch };
  await writeDb(db);
  return db.cars[idx];
}

export async function deleteCar(id) {
  const db = await readDb();
  db.cars = db.cars.filter((c) => c.id !== id);
  await writeDb(db);
  return true;
}

export async function getBookings() {
  const db = await readDb();
  return db.bookings;
}

export async function getBookingsByUser(email) {
  const db = await readDb();
  return db.bookings.filter(
    (b) => b.userEmail.toLowerCase() === email.toLowerCase()
  );
}

export async function addBooking(booking) {
  const db = await readDb();
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
  car.available = false;
  await writeDb(db);
  return newBooking;
}

export async function updateBookingStatus(id, status) {
  const db = await readDb();
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  db.bookings[idx].status = status;

  if (status === "cancelled" || status === "completed") {
    const car = db.cars.find((c) => c.id === db.bookings[idx].carId);
    if (car) car.available = true;
  }

  await writeDb(db);
  return db.bookings[idx];
}