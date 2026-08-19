import { NextResponse } from "next/server";
import { addBooking, getBookings, getBookingsByUser } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const bookings = email ? getBookingsByUser(email) : getBookings();
  return NextResponse.json({ bookings });
}

export async function POST(request) {
  const body = await request.json();
  const required = ["carId", "userName", "userEmail", "startDate", "endDate"];
  const missing = required.filter((k) => !body[k]);
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  if (new Date(body.endDate) < new Date(body.startDate)) {
    return NextResponse.json(
      { error: "End date must be after start date" },
      { status: 400 }
    );
  }

  try {
    const booking = addBooking(body);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
