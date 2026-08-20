"use client";

import { useState } from "react";
import Image from "next/image";

export default function CarImage({ src, alt, fill, className, sizes, priority }) {
  const [failed, setFailed] = useState(false);

  const safeAlt = alt || "Car photo";
  const fallbackSrc = `https://placehold.co/800x600/17181B/F2B705.png?text=${encodeURIComponent(
    safeAlt
  )}`;

  return (
    <Image
      src={failed || !src ? fallbackSrc : src}
      alt={safeAlt}
      fill={fill}
      sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
      unoptimized={failed}
    />
  );
}