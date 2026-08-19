"use client";

import { useEffect, useMemo, useState } from "react";
import CarCard from "@/components/CarCard";
import SearchFilter from "@/components/SearchFilter";

export default function HomePage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    location: "",
    maxPrice: 250,
    onlyAvailable: false,
  });

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then((data) => setCars(data.cars || []))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(cars.map((c) => c.category))].sort(),
    [cars]
  );
  const locations = useMemo(
    () => [...new Set(cars.map((c) => c.location))].sort(),
    [cars]
  );

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      const q = filters.q.trim().toLowerCase();
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q);
      const matchesCategory = !filters.category || c.category === filters.category;
      const matchesLocation = !filters.location || c.location === filters.location;
      const matchesPrice = c.pricePerDay <= filters.maxPrice;
      return matchesQ && matchesCategory && matchesLocation && matchesPrice;
    });
  }, [cars, filters]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-asphalt text-paper">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-[1.3fr,1fr] gap-10 items-end">
          <div>
            <p className="eyebrow text-lane mb-4">Fleet across Pakistan &mdash; booked by the day</p>
            <h1 className="font-display text-5xl sm:text-6xl uppercase leading-[0.95] tracking-tight">
              Pick a lane.
              <br />
              Take the wheel.
            </h1>
            <p className="mt-6 max-w-md text-paper/70 font-body">
              {cars.length || "—"} vehicles ready to book, from city hatchbacks to
              executive saloons. Reserve online, pick up at the counter, drive.
            </p>
          </div>
          <div className="flex gap-8 font-mono text-sm">
            <div>
              <p className="text-4xl font-display text-lane">{cars.filter((c) => c.available).length}</p>
              <p className="text-paper/60 uppercase tracking-widest2 text-xs mt-1">Available now</p>
            </div>
            <div>
              <p className="text-4xl font-display text-lane">{locations.length}</p>
              <p className="text-paper/60 uppercase tracking-widest2 text-xs mt-1">Pickup cities</p>
            </div>
            <div>
              <p className="text-4xl font-display text-lane">{categories.length}</p>
              <p className="text-paper/60 uppercase tracking-widest2 text-xs mt-1">Categories</p>
            </div>
          </div>
        </div>
      </section>
      <div className="lane-divider" />

      {/* Listing */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <SearchFilter
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          locations={locations}
        />

        <div className="mt-8">
          {loading ? (
            <p className="font-mono text-sm text-asphalt/50">Loading fleet…</p>
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="font-display text-2xl uppercase mb-2">No cars match that search</p>
              <p className="text-asphalt/60 font-body text-sm">
                Try widening the price range or clearing a filter.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
