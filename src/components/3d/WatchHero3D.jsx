"use client";

import React, { useState, useEffect, Component } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

// Dynamic import with SSR disabled for WebGL Canvas
const DynamicWatchCanvas = dynamic(() => import("./WatchCanvas"), {
  ssr: false,
  loading: () => null,
});

class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("3D Watch Canvas fallback triggered:", err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function WatchHero3D({
  slide,
  variant = "moody",
  priority = false,
  className = "",
  modelUrl = null,
  forceImage = true,
}) {
  const [modelAvailable, setModelAvailable] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check client mount and verify if the GLB file exists in public/models/
  useEffect(() => {
    setIsClient(true);
    if (forceImage || !modelUrl) {
      setModelAvailable(false);
      return;
    }

    let isMounted = true;
    fetch(modelUrl, { method: "HEAD" })
      .then((res) => {
        if (isMounted) {
          // If the model exists with status 200 and is not an HTML 404
          const contentType = res.headers.get("content-type") || "";
          if (res.ok && !contentType.includes("text/html")) {
            setModelAvailable(true);
          } else {
            setModelAvailable(false);
          }
        }
      })
      .catch(() => {
        if (isMounted) setModelAvailable(false);
      });

    return () => {
      isMounted = false;
    };
  }, [modelUrl, forceImage]);

  const fallbackImage = (
    <div
      className={`relative w-full h-full select-none ${
        variant === "moody" ? "hero-moody-mask" : ""
      } ${className}`}
    >
      <Image
        key={variant === "moody" ? slide.moodySrc : slide.frontSrc}
        src={variant === "moody" ? slide.moodySrc : slide.frontSrc}
        alt={`${slide.titleLine1} ${slide.titleLine2}`}
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

  // If 3D model is unavailable (or during SSR), render the high-res transparent image fallback
  if (!isClient || !modelAvailable || forceImage) {
    return fallbackImage;
  }

  return (
    <ThreeErrorBoundary fallback={fallbackImage}>
      <div className={`relative w-full h-full ${className}`}>
        <DynamicWatchCanvas
          stoneId={slide.id}
          modelUrl={modelUrl}
          variant={variant}
          interactive={true}
        />
      </div>
    </ThreeErrorBoundary>
  );
}
