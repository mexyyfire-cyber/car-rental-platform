import { NextResponse } from "next/server";
import { addCar, getCars } from "@/lib/db";

export async function GET() {
  const cars = getCars();
  return NextResponse.json({ cars });
}

export async function POST(request) {
  const body = await request.json();

  const required = ["name", "brand", "category", "pricePerDay"];
  const missing = required.filter((k) => !body[k]);
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const car = addCar({
    name: body.name,
    brand: body.brand,
    category: body.category,
    transmission: body.transmission || "Automatic",
    seats: Number(body.seats) || 5,
    fuel: body.fuel || "Petrol",
    pricePerDay: Number(body.pricePerDay),
    location: body.location || "Islamabad",
    image: body.image,
    description: body.description || "",
    features: body.features || [],
  });

  return NextResponse.json({ car }, { status: 201 });
}