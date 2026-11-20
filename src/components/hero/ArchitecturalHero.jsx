"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { getPieceById } from "@/data/collection";

const HERO_WATCHES = [
  {
    id: "overflow",
    name: "OVERFLOW",
    stone: "CITRINE",
    tagline: "Worn for abundance.",
    frontSrc: "/watches/overflow/front.webp",
    accentColor: "#B58E4A",
  },
  {
    id: "cherish",
    name: "CHERISH",
    stone: "ROSE QUARTZ",
    tagline: "Worn for the love you give yourself.",
    frontSrc: "/watches/cherish/front.webp",
    accentColor: "#B88B90",
  },
  {
    id: "hush",
    name: "HUSH",
    stone: "AMETHYST",
    tagline: "Worn for a quieter mind.",
    frontSrc: "/watches/hush/front.webp",
    accentColor: "#8C7BA8",
  },
  {
    id: "ascent",
    name: "ASCENT",
    stone: "TIGER'S EYE",
    tagline: "Worn for the next step up.",
    frontSrc: "/watches/ascent/front.webp",
    accentColor: "#A3794B",
  },
  {
    id: "wildfire",
    name: "WILDFIRE",
    stone: "SUNSTONE",
    tagline: "Worn to be seen.",
    frontSrc: "/watches/wildfire/front.webp",
    accentColor: "#BF7352",
  },
  {
    id: "cadence",
    name: "CADENCE",
    stone: "SODALITE",
    tagline: "Worn for words that land.",
    frontSrc: "/watches/cadence/front.webp",
    accentColor: "#5F7AA8",
  },
];

export default function ArchitecturalHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const prefersReduced = useReducedMotion();
  const setInspectedPiece = useStore((s) => s.setInspectedPiece);

  const heroRef = useRef(null);
  const touchStartRef = useRef(null);

  const currentWatch = HERO_WATCHES[currentIndex];

  // Subtle Mouse Parallax (only on desktop when reduced motion is not preferred)
  useEffect(() => {
    if (prefersReduced) return;
    const handleMouseMove = (e) => {
      if (window.innerWidth < 768) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReduced]);

  const goToSlide = useCallback((index, dir) => {
    const total = HERO_WATCHES.length;
    const nextIndex = ((index % total) + total) % total;
    setDirection(dir);
    setCurrentIndex(nextIndex);
  }, []);

  const handleNext = useCallback(() => {
    goToSlide(currentIndex + 1, 1);
  }, [currentIndex, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide(currentIndex - 1, -1);
  }, [currentIndex, goToSlide]);

  const handleDiscover = () => {
    const piece = getPieceById(currentWatch.id);
    if (piece) {
      setInspectedPiece(piece);
    }
  };

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (window.scrollY > window.innerHeight * 0.5) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Touch Swipe on mobile
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current;
    touchStartRef.current = null;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
  };

  return (
    <section
      ref={heroRef}
      aria-label="Watch Inc Architectural Hero Showcase"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[100svh] min-h-[560px] overflow-hidden select-none bg-[#0A0A0B]"
    >
      {/* 1. CINEMATIC LIMESTONE ARCHITECTURAL BACKGROUND */}
      <motion.div
        aria-hidden="true"
        animate={
          prefersReduced
            ? {}
            : {
                x: mousePos.x * -7,
                y: mousePos.y * -4,
              }
        }
        transition={{ type: "spring", stiffness: 75, damping: 25, mass: 0.8 }}
        className="absolute inset-[-2%] w-[104%] h-[104%] pointer-events-none"
      >
        <Image
          src="/images/hero/architectural-pavilion.webp"
          alt="Golden limestone architectural pavilion"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-[50%_42%] md:object-[50%_36%] pointer-events-none"
        />

        {/* Ambient top vignette for navbar legibility & bottom vignette for control contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/35 pointer-events-none" />
      </motion.div>

      {/* 2. FOREGROUND CONTENT COMPOSITION */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between pt-[74px] md:pt-[90px] pb-6 md:pb-8 px-4 pointer-events-none">
        {/* TOP: WATCH TITLE & TAGLINE (Cormorant Garamond) */}
        <div className="flex flex-col items-center text-center mt-1 md:mt-3 z-20 pointer-events-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`text-${currentWatch.id}`}
              initial={{ opacity: 0, y: direction * 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction * -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <h1 className="font-serif font-normal uppercase text-[#F3EFE7] text-[clamp(42px,6.8vw,88px)] leading-[0.92] tracking-[0.06em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)]">
                {currentWatch.name}
              </h1>
              <p className="font-serif italic font-normal text-[#F3EFE7]/92 text-[clamp(15px,1.65vw,24px)] tracking-[0.02em] mt-1.5 md:mt-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                {currentWatch.tagline}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CENTER: WATCH DISPLAY ON PEDESTAL */}
        <div className="relative w-full flex-1 flex items-center justify-center -mt-2 md:-mt-4">
          <motion.div
            animate={
              prefersReduced
                ? {}
                : {
                    x: mousePos.x * 10,
                    y: mousePos.y * 7,
                  }
            }
            transition={{ type: "spring", stiffness: 85, damping: 22, mass: 0.7 }}
            className="relative flex items-center justify-center pointer-events-auto cursor-pointer"
            onClick={handleDiscover}
            role="button"
            tabIndex={0}
            aria-label={`Inspect ${currentWatch.name}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDiscover();
              }
            }}
          >
            {/* Ground Contact Shadow on top of stone pedestal */}
            <div
              aria-hidden="true"
              className="absolute -bottom-1 md:bottom-0 left-1/2 -translate-x-1/2 w-[65%] max-w-[210px] h-[14px] md:h-[18px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65)_0%,rgba(0,0,0,0.22)_50%,transparent_75%)] rounded-[100%] blur-[3.5px] pointer-events-none"
            />

            {/* Watch Face / Front View Cutout */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`watch-${currentWatch.id}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-[42vh] md:h-[48vh] lg:h-[50vh] max-h-[480px] min-h-[280px] aspect-[1024/1536]"
              >
                <Image
                  src={currentWatch.frontSrc}
                  alt={`${currentWatch.name} Watch`}
                  fill
                  priority
                  quality={92}
                  sizes="(max-width: 768px) 70vw, (max-width: 1200px) 45vw, 380px"
                  className="object-contain pointer-events-none select-none drop-shadow-[0_16px_32px_rgba(0,0,0,0.36)]"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* BOTTOM: DISCOVER CTA & PREV / NEXT CONTROLS (Jost font) */}
        <div className="flex items-center justify-center gap-5 md:gap-7 z-20 pointer-events-auto pb-1 md:pb-2">
          {/* Previous Watch Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous watch"
            className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/35 hover:border-white text-white/85 hover:text-white flex items-center justify-center transition-all duration-200 hover:bg-white/10 active:scale-95 cursor-pointer backdrop-blur-[2px]"
          >
            <ChevronLeft size={16} strokeWidth={1.3} />
          </button>

          {/* Discover CTA */}
          <button
            type="button"
            onClick={handleDiscover}
            className="group flex items-center gap-2 font-sans text-[11px] md:text-[12.5px] font-medium uppercase tracking-[0.22em] text-[#F3EFE7] hover:text-white transition-colors duration-200 cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
          >
            <span>DISCOVER {currentWatch.name}</span>
          </button>

          {/* Next Watch Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next watch"
            className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/35 hover:border-white text-white/85 hover:text-white flex items-center justify-center transition-all duration-200 hover:bg-white/10 active:scale-95 cursor-pointer backdrop-blur-[2px]"
          >
            <ChevronRight size={16} strokeWidth={1.3} />
          </button>
        </div>
      </div>
    </section>
  );
}
