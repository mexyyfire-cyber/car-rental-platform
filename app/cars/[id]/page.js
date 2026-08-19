import { NextResponse } from "next/server";
import { deleteCar, getCarById, updateCar } from "@/lib/db";

export async function GET(_request, { params }) {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ car });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const car = await updateCar(id, body);
  if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ car });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  await deleteCar(id);
  return NextResponse.json({ ok: true });
}