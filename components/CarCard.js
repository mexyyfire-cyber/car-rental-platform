import Image from "next/image";
import Link from "next/link";

export default function CarCard({ car }) {
  return (
    <Link href={`/cars/${car.id}`} className="card group flex flex-col overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden bg-asphalt/5">
        <Image
          src={car.image}
          alt={`${car.brand} ${car.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!car.available && (
          <span className="absolute top-3 left-3 bg-taillight text-paper font-mono text-[10px] uppercase tracking-widest2 px-2 py-1">
            Booked out
          </span>
        )}
        <span className="absolute top-3 right-3 bg-asphalt/80 text-paper font-mono text-[10px] uppercase tracking-widest2 px-2 py-1">
          {car.category}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <p className="eyebrow">{car.brand}</p>
          <h3 className="font-display text-xl uppercase leading-tight">{car.name}</h3>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-asphalt/60">
          <span>{car.seats} seats</span>
          <span>{car.transmission}</span>
          <span>{car.fuel}</span>
          <span>{car.location}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-asphalt/10">
          <span className="plate text-sm">
            ${car.pricePerDay}
            <span className="text-[10px] font-body normal-case tracking-normal text-asphalt/50">/day</span>
          </span>
          <span className="font-mono text-xs uppercase tracking-widest2 text-steel group-hover:text-lane transition-colors">
            View &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
