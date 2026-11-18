"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { X, Volume2, VolumeX, Play, Pause } from "lucide-react";
import WatchArtwork from "./WatchArtwork";
import type { HeroSlide } from "./heroSlides";

gsap.registerPlugin(useGSAP);

interface FilmOverlayProps {
  slide: HeroSlide;
  isOpen: boolean;
  origin: { x: number; y: number };
  onClose: () => void;
}

const SIMULATED_DURATION = 16;

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}

export default function FilmOverlay({
  slide,
  isOpen,
  origin,
  onClose,
}: FilmOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const timeDisplayRef = useRef<HTMLSpanElement>(null);

  const [isRendered, setIsRendered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [availableFilms, setAvailableFilms] = useState<string[]>([]);

  const isClosingRef = useRef(false);
  const simElapsedRef = useRef(0);
  const isPausedRef = useRef(false);

  const hasVideoFile = availableFilms.includes(slide.id);

  // Check available local film files once (zero 404 errors)
  useEffect(() => {
    let active = true;
    fetch("/api/films/status")
      .then((res) => (res.ok ? res.json() : { available: [] }))
      .then((data) => {
        if (active && Array.isArray(data.available)) {
          setAvailableFilms(data.available);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      isClosingRef.current = false;
      simElapsedRef.current = 0;
      isPausedRef.current = false;
      setIsPaused(false);
      setIsLoading(true);
      setIsRendered(true);
    }
  }, [isOpen]);

  const { contextSafe } = useGSAP(
    () => {
      if (!isRendered || !overlayRef.current) return;

      const el = overlayRef.current;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      el.style.willChange = "clip-path, opacity";

      if (prefersReduced) {
        gsap.fromTo(
          el,
          { opacity: 0, clipPath: "none" },
          {
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
            onComplete: () => {
              el.style.willChange = "auto";
            },
          }
        );
      } else {
        gsap.fromTo(
          el,
          {
            clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
            opacity: 1,
          },
          {
            clipPath: `circle(150% at ${origin.x}px ${origin.y}px)`,
            duration: 0.8,
            ease: "expo.inOut",
            onComplete: () => {
              el.style.willChange = "auto";
            },
          }
        );
      }
    },
    { dependencies: [isRendered, origin.x, origin.y] }
  );

  // Simulate spinner briefly for placeholder film reel, or wait for video onCanPlay
  useEffect(() => {
    if (!isRendered || hasVideoFile) return;

    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out" }
        );
      }
    }, 550);

    return () => clearTimeout(loadTimer);
  }, [isRendered, hasVideoFile, slide.id]);

  // Smooth progress ticker via GSAP ticker (zero React state updates per frame)
  useEffect(() => {
    if (!isRendered || isLoading) return;

    let lastTimestamp = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (hasVideoFile && videoRef.current) {
        const vid = videoRef.current;
        const dur = vid.duration || SIMULATED_DURATION;
        const cur = vid.currentTime || 0;
        const pct = Math.min(100, (cur / dur) * 100);
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${pct / 100})`;
        }
        if (timeDisplayRef.current) {
          timeDisplayRef.current.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
        }
      } else {
        if (!isPausedRef.current) {
          simElapsedRef.current = (simElapsedRef.current + dt) % SIMULATED_DURATION;
        }
        const pct = simElapsedRef.current / SIMULATED_DURATION;
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${pct})`;
        }
        if (timeDisplayRef.current) {
          timeDisplayRef.current.textContent = `${formatTime(
            simElapsedRef.current
          )} / ${formatTime(SIMULATED_DURATION)}`;
        }
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [isRendered, isLoading, hasVideoFile]);

  const handleClose = contextSafe(() => {
    if (isClosingRef.current || !overlayRef.current) return;
    isClosingRef.current = true;

    const el = overlayRef.current;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (videoRef.current) {
      videoRef.current.pause();
    }

    el.style.willChange = "clip-path, opacity";

    if (prefersReduced) {
      gsap.to(el, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          el.style.willChange = "auto";
          setIsRendered(false);
          onClose();
        },
      });
    } else {
      gsap.to(el, {
        clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
        duration: 0.72,
        ease: "expo.inOut",
        onComplete: () => {
          el.style.willChange = "auto";
          setIsRendered(false);
          onClose();
        },
      });
    }
  });

  // Escape key closes overlay
  useEffect(() => {
    if (!isRendered) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isRendered, handleClose]);

  const togglePlayPause = () => {
    const next = !isPaused;
    isPausedRef.current = next;
    setIsPaused(next);
    if (videoRef.current) {
      if (next) videoRef.current.pause();
      else videoRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (videoRef.current) {
      videoRef.current.muted = next;
    }
  };

  if (!isRendered) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${slide.titleLine1} film player`}
      className="fixed inset-0 z-50 bg-[#0F3350] text-white font-hero-inter flex flex-col justify-between overflow-hidden"
    >
      {/* Top Bar with Title & Close (✕) */}
      <div className="relative z-20 flex items-center justify-between px-6 md:px-[4vw] pt-6">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slide.panelColor }} />
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/75">
            {slide.titleLine1} &middot; {slide.stoneLabel} FILM
          </span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close film overlay"
          data-cursor="LINK"
          className="w-10 h-10 rounded-full border border-white/25 hover:bg-white hover:text-[#0F3350] transition-colors flex items-center justify-center cursor-pointer"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Center Stage: Thin 24px 1px Spinner while loading, then Video / Reel */}
      <div className="relative flex-1 flex items-center justify-center px-6">
        {isLoading && (
          <div
            aria-label="Loading film"
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="w-[24px] h-[24px] rounded-full border border-white/25 border-t-white animate-spin" />
          </div>
        )}

        <div
          ref={contentRef}
          className={`relative w-full max-w-5xl aspect-video rounded-sm overflow-hidden flex items-center justify-center transition-opacity duration-500 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        >
          {hasVideoFile ? (
            <video
              ref={videoRef}
              src={slide.filmSrc}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onCanPlay={() => setIsLoading(false)}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Editorial Film Reel Placeholder until /public/films/[id].mp4 is provided */
            <div className="relative w-full h-full bg-[#092135] border border-white/10 flex flex-col md:flex-row items-center justify-center gap-8 px-8 py-10 overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 35% 50%, ${slide.panelColor}, transparent 68%)`,
                }}
              />

              <div className="relative w-[200px] h-[260px] md:w-[280px] md:h-[360px] shrink-0">
                <WatchArtwork slide={slide} variant="front" />
              </div>

              <div className="relative z-10 max-w-md text-center md:text-left">
                <span className="text-[11px] font-sans font-medium tabular-nums uppercase tracking-[0.14em] text-[#F3EFE7]/60 block mb-3">
                  ATELIER FILM REEL &middot; {slide.sampleDialNo}
                </span>
                <h3 className="font-serif font-medium uppercase text-[#F3EFE7] text-[clamp(32px,3.2vw,48px)] leading-[0.98] tracking-[0.04em] mb-2">
                  {slide.titleLine1}
                </h3>
                <p className="font-sans font-normal text-[13px] uppercase tracking-[0.13em] text-[#F3EFE7]/80 mb-4">
                  {slide.titleLine2}
                </p>
                <p className="font-sans text-[16px] leading-[1.6] text-[#F3EFE7]/75 mb-5">
                  {slide.bodyCopy}
                </p>
                <span className="inline-block text-[11px] font-sans font-medium tabular-nums uppercase tracking-[0.12em] text-[#F3EFE7]/50 border border-[#F3EFE7]/15 px-3 py-1.5">
                  FILM SOURCE: /public/films/{slide.id}.mp4
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls: Thin Progress Bar, Time in 10px Mono, Play/Pause & Mute Toggle */}
      <div className="relative z-20 px-6 md:px-[4vw] pb-7 pt-4">
        {/* Progress Track */}
        <div className="w-full h-[1px] bg-white/20 mb-4 overflow-hidden">
          <div
            ref={progressBarRef}
            className="w-full h-full bg-white origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPaused ? "Play film" : "Pause film"}
              data-cursor="LINK"
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              {isPaused ? <Play size={14} strokeWidth={1.5} /> : <Pause size={14} strokeWidth={1.5} />}
            </button>
            <span
              ref={timeDisplayRef}
              className="font-mono text-[10px] tracking-[0.12em] text-white/80"
            >
              0:00 / 0:16
            </span>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute film" : "Mute film"}
            data-cursor="LINK"
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX size={15} strokeWidth={1.4} /> : <Volume2 size={15} strokeWidth={1.4} />}
            <span className="hidden sm:inline">{isMuted ? "MUTED" : "SOUND"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
