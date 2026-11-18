"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

interface EntranceLoaderProps {
  onComplete: () => void;
}

export default function EntranceLoader({ onComplete }: EntranceLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const { lenis } = useSmoothScroll();

  useEffect(() => {
    // 1. Session check: only on client inside useEffect
    try {
      const hasSeen = sessionStorage.getItem("watchinc_entrance_seen");
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (hasSeen || prefersReducedMotion) {
        setIsMounted(false);
        onComplete();
        return;
      }
    } catch {
      // In case sessionStorage is restricted in sandbox/iframe
    }

    // 2. Lock scroll while loading
    if (lenis) {
      lenis.stop();
    }
    document.body.style.overflow = "hidden";

    let isCompleted = false;

    const finishLoader = () => {
      if (isCompleted) return;
      isCompleted = true;

      try {
        sessionStorage.setItem("watchinc_entrance_seen", "true");
      } catch {}

      // Unlock body scroll and restart Lenis
      document.body.style.overflow = "";
      if (lenis) {
        lenis.start();
      }

      setIsUnlocked(true);

      // Final unmount transition
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.05,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            setIsMounted(false);
            onComplete();
          },
        });
      } else {
        setIsMounted(false);
        onComplete();
      }
    };

    // 3. Hard failsafe: if still mounted after 4 seconds, force finish
    const failsafeTimeout = setTimeout(() => {
      finishLoader();
    }, 4000);

    // 4. GSAP Timeline driving the 000 -> 100 counter and ticks
    const counterObj = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        finishLoader();
      },
    });
    timelineRef.current = tl;

    tl.to(counterObj, {
      val: 100,
      duration: 1.5,
      ease: "power1.inOut",
      onUpdate: () => {
        setProgress(Math.floor(counterObj.val));
      },
    });

    // At 100, the dial unlocks: ticks scatter outward and dial scales up
    tl.call(() => {
      setIsUnlocked(true);
    });

    // 0.5s pause to experience the scatter and unlock transition
    tl.to({}, { duration: 0.5 });

    return () => {
      clearTimeout(failsafeTimeout);
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      document.body.style.overflow = "";
      if (lenis) {
        lenis.start();
      }
    };
  }, [onComplete, lenis]);

  const handleSkip = () => {
    try {
      sessionStorage.setItem("watchinc_entrance_seen", "true");
    } catch {}

    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    document.body.style.overflow = "";
    if (lenis) {
      lenis.start();
    }
    setIsMounted(false);
    onComplete();
  };

  // Complete unmount: returns null so ZERO fixed overlays remain in DOM
  if (!isMounted) return null;

  const totalTicks = 60;
  const activeTicksCount = Math.floor((progress / 100) * totalTicks);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100000] bg-[#0B0B0C] text-[#EDE8DF] flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Subtle Ambient Background Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(243,239,231,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-8 right-8 z-20 font-mono text-[11px] tracking-[0.2em] text-[#F3EFE7]/60 hover:text-[#F3EFE7] transition-colors py-2 px-4 uppercase cursor-pointer"
        aria-label="Skip introductory calibration"
      >
        SKIP &rarr;
      </button>

      {/* Central Watch Dial Entrance SVG */}
      <div className="relative flex items-center justify-center">
        <svg
          ref={dialRef}
          viewBox="0 0 400 400"
          className="w-72 h-72 sm:w-80 sm:h-80 transition-transform duration-500"
          style={{
            transform: isUnlocked ? "scale(1.3)" : "scale(1)",
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Case Ring */}
          <circle
            cx="200"
            cy="200"
            r="184"
            fill="none"
            stroke="rgba(237, 232, 223, 0.12)"
            strokeWidth="1.5"
          />

          {/* 60 Minute Track Ticks: Drawn sequentially, scatter outward on 100% */}
          <g>
            {Array.from({ length: totalTicks }).map((_, i) => {
              const angle = i * 6;
              const rad = (angle - 90) * (Math.PI / 180);
              const isMajor = i % 5 === 0;
              const isActive = i <= activeTicksCount;

              const r1 = isMajor ? 148 : 158;
              const r2 = 172;

              const x1 = Math.round((200 + r1 * Math.cos(rad)) * 100) / 100;
              const y1 = Math.round((200 + r1 * Math.sin(rad)) * 100) / 100;
              const x2 = Math.round((200 + r2 * Math.cos(rad)) * 100) / 100;
              const y2 = Math.round((200 + r2 * Math.sin(rad)) * 100) / 100;

              const scatterDistance = isUnlocked ? 60 + (i % 3) * 20 : 0;
              const scatterX = Math.round(scatterDistance * Math.cos(rad) * 100) / 100;
              const scatterY = Math.round(scatterDistance * Math.sin(rad) * 100) / 100;

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    isActive
                      ? isMajor
                        ? "#F3EFE7"
                        : "rgba(243, 239, 231, 0.72)"
                      : "rgba(243, 239, 231, 0.1)"
                  }
                  strokeWidth={isMajor ? 2.5 : 1}
                  strokeLinecap="round"
                  style={{
                    transform: `translate(${scatterX}px, ${scatterY}px)`,
                    opacity: isUnlocked ? 0 : isActive ? 1 : 0.2,
                    transition: isUnlocked
                      ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out"
                      : "stroke 0.12s ease",
                  }}
                />
              );
            })}
          </g>

          {/* Central Inner Bezel Ring */}
          <circle
            cx="200"
            cy="200"
            r="132"
            fill="#121214"
            stroke="rgba(237, 232, 223, 0.1)"
            strokeWidth="1"
          />
        </svg>

        {/* Central Animated Percentage Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-3xl sm:text-4xl font-medium tracking-[0.16em] text-[#F3EFE7]">
            {String(progress).padStart(3, "0")}
          </span>
          <span className="font-mono text-[9px] tracking-[0.24em] text-[#F3EFE7]/55 mt-1 uppercase">
            Watch Inc &bull; CALIBRATING
          </span>
        </div>
      </div>

      {/* Bottom Inscription */}
      <div className="absolute bottom-10 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[#EDE8DF]/40">
        HAUTE HORLOGERIE &bull; NUMBERED NATURAL SPECIMENS
      </div>
    </div>
  );
}
