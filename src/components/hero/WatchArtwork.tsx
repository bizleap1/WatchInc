"use client";

import React from "react";
import Image from "next/image";
import type { HeroSlide } from "./heroSlides";

interface WatchArtworkProps {
  slide: HeroSlide;
  variant: "moody" | "front";
  priority?: boolean;
  className?: string;
}

export default function WatchArtwork({
  slide,
  variant,
  priority = false,
  className = "",
}: WatchArtworkProps) {
  const src = variant === "moody" ? slide.moodySrc : slide.frontSrc;
  const alt =
    variant === "moody"
      ? `${slide.titleLine1} ${slide.titleLine2} — angled studio timepiece`
      : `${slide.titleLine1} ${slide.titleLine2} — front view`;

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      <Image
        key={src}
        src={src}
        alt={alt}
        fill
        quality={90}
        priority={priority}
        loading={priority ? undefined : "eager"}
        sizes={
          variant === "moody"
            ? "(max-width: 768px) 90vw, 48vw"
            : "(max-width: 768px) 60vw, 38vw"
        }
        className={`object-contain pointer-events-none select-none ${
          variant === "front"
            ? "drop-shadow-[0_24px_38px_rgba(0,0,0,0.34)]"
            : "drop-shadow-[0_28px_54px_rgba(0,0,0,0.55)]"
        }`}
      />
    </div>
  );
}
