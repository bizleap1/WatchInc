"use client";

import React from "react";
import Image from "next/image";

/**
 * WatchArtwork component.
 * Renders high-resolution studio photography directly with GPU-accelerated styling
 * and the client's diagonal-aligned CSS fade mask for the moody angle.
 */
export default function WatchArtwork({
  slide,
  variant = "moody",
  priority = false,
  className = "",
}) {
  const isMoody = variant === "moody";
  const src = isMoody ? slide.moodySrc : slide.frontSrc;

  return (
    <div
      className={`relative w-full h-full select-none ${
        isMoody ? "hero-moody-mask" : ""
      } ${className}`}
    >
      <Image
        key={src}
        src={src}
        alt={`${slide.titleLine1} ${slide.titleLine2}`}
        fill
        quality={90}
        priority={priority}
        loading={priority ? undefined : "eager"}
        sizes={
          isMoody
            ? "(max-width: 768px) 90vw, 48vw"
            : "(max-width: 768px) 60vw, 38vw"
        }
        className={`object-contain pointer-events-none select-none ${
          isMoody
            ? "drop-shadow-[0_28px_54px_rgba(0,0,0,0.55)]"
            : "drop-shadow-[0_24px_38px_rgba(0,0,0,0.34)]"
        }`}
      />
    </div>
  );
}

