import { NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/db";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  if (!body.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }
  const booking = updateBookingStatus(id, body.status);
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ booking });
}