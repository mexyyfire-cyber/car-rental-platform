"use client";

export default function SearchFilter({ filters, setFilters, categories, locations }) {
  function update(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-2">
        <label className="label-field">Search</label>
        <input
          className="input-field"
          placeholder="Search by name or brand..."
          value={filters.q}
          onChange={(e) => update("q", e.target.value)}
        />
      </div>

      <div>
        <label className="label-field">Category</label>
        <select
          className="input-field"
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Location</label>
        <select
          className="input-field"
          value={filters.location}
          onChange={(e) => update("location", e.target.value)}
        >
          <option value="">All</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Max price / day (${filters.maxPrice})</label>
        <input
          type="range"
          min={20}
          max={250}
          step={5}
          className="w-full accent-lane"
          value={filters.maxPrice}
          onChange={(e) => update("maxPrice", Number(e.target.value))}
        />
      </div>
    </div>
  );
}
