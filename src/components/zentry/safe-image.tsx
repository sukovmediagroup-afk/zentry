"use client";
import { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src?: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  fallbackGradient?: string; // tailwind gradient classes
}

/**
 * SafeImage — wrapper around next/image that gracefully falls back to a
 * gradient placeholder when the image URL is broken (404, network error,
 * external host down). This prevents broken-image icons from appearing
 * on the page and keeps the layout intact.
 *
 * Usage: same as <Image>, but with automatic onError handling.
 */
export function SafeImage({
  src,
  alt,
  fill,
  priority,
  sizes,
  className,
  fallbackGradient = "from-graphite to-espresso",
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`}
        aria-label={alt}
        role="img"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
