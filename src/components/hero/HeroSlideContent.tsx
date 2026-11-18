"use client";

import React from "react";
import { Play, ArrowRight } from "lucide-react";
import WatchArtwork from "./WatchArtwork";
import CircleActionButton from "./CircleActionButton";
import type { HeroSlide } from "./heroSlides";

interface HeroSlideContentProps {
  slide: HeroSlide;
  priority?: boolean;
  onOpenProduct: () => void;
  onOpenFilm: (origin: { x: number; y: number }) => void;
  interactive?: boolean;
}

export default function HeroSlideContent({
  slide,
  priority = false,
  onOpenProduct,
  onOpenFilm,
  interactive = true,
}: HeroSlideContentProps) {
  const handlePlayClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onOpenFilm({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  return (
    <div className="relative w-full h-full font-hero-inter pointer-events-none">
      {/* DESKTOP LAYOUT (>= 768px) */}
      <div className="hidden md:block relative w-full h-full pointer-events-none">
        {/* Moody Angled Watch — left: -2vw, vertically centred, height 88%, completely stationary */}
        <div
          data-hero-watch
          onClick={onOpenProduct}
          role="button"
          tabIndex={interactive ? 0 : -1}
          aria-label={`Inspect ${slide.titleLine1} ${slide.titleLine2}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenProduct();
            }
          }}
          className={`absolute left-[-2vw] top-1/2 -translate-y-1/2 h-[88%] w-[45vw] max-w-[700px] cursor-pointer z-10 ${
            interactive ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <WatchArtwork slide={slide} variant="moody" priority={priority} />
        </div>

        {/* Info Column — left: 46vw, top: 18%, max-width: 30vw (title intentionally overlaps panel edge) */}
        <div className="absolute left-[46vw] top-[18%] w-[30vw] z-20 flex flex-col items-start">
          {/* Title block (overflows cleanly toward & across the right colour panel edge) */}
          <div className="w-max overflow-visible select-none pointer-events-none">
            <h1 className="font-hero-expanded text-white text-[clamp(40px,4.6vw,88px)]">
              <span data-hero-title-line className="block whitespace-nowrap">
                {slide.titleLine1}
              </span>
              <span
                data-hero-title-line
                className={`block whitespace-nowrap ${
                  slide.titleLine2.length > 13 ? "text-[0.82em]" : ""
                }`}
              >
                {slide.titleLine2}
              </span>
            </h1>
            <p
              data-hero-title-line
              className="font-hero-expanded text-white text-[clamp(16px,1.5vw,28px)] mt-2.5"
            >
              {slide.size}
            </p>
          </div>

          {/* 1px hairline, width 70%, margin 24px 0 */}
          <div
            data-hero-info-item
            className="w-[70%] h-[1px] bg-white/[0.12] my-[24px]"
          />

          {/* Film Row: 48px circle play button + two-line label */}
          <div
            data-hero-info-item
            className={`flex items-center gap-4 group/film cursor-pointer ${
              interactive ? "pointer-events-auto" : "pointer-events-none"
            }`}
            onClick={handlePlayClick}
            role="button"
            tabIndex={interactive ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                onOpenFilm({ x: rect.left + 24, y: rect.top + 24 });
              }
            }}
            data-cursor="LINK"
          >
            <CircleActionButton
              size={48}
              ariaLabel={`Watch the film for ${slide.titleLine1}`}
              onClick={handlePlayClick}
            >
              <Play size={14} strokeWidth={1.5} className="translate-x-[1px] fill-current" />
            </CircleActionButton>

            <div className="flex flex-col">
              <span className="font-serif italic text-[19px] font-normal text-white/95 tracking-[0.015em] leading-snug">
                {slide.filmHeadline}
              </span>
              <span className="font-sans text-[9.5px] font-medium uppercase tracking-[0.22em] text-white/45 mt-0.5">
                WATCH THE FILM
              </span>
            </div>
          </div>

          {/* 1px hairline */}
          <div
            data-hero-info-item
            className="w-[70%] h-[1px] bg-white/[0.12] my-[24px]"
          />

          {/* Edition label */}
          <div
            data-hero-info-item
            className="font-sans text-[9.5px] font-medium uppercase tracking-[0.22em] text-white/45 mb-3"
          >
            {slide.dialRangeLabel}
          </div>

          {/* Editorial serif body copy */}
          <p
            data-hero-info-item
            className="font-serif font-light text-[17.5px] leading-[1.6] tracking-[0.015em] text-white/75 max-w-[390px] mb-7"
          >
            {slide.bodyCopy}
          </p>

          {/* Discover link row */}
          <div
            data-hero-info-item
            onClick={onOpenProduct}
            role="button"
            tabIndex={interactive ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenProduct();
              }
            }}
            className={`flex items-center gap-4 group/discover cursor-pointer ${
              interactive ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-white group-hover/discover:text-white/75 transition-colors">
              {slide.discoverLabel}
            </span>
            <CircleActionButton
              size={36}
              ariaLabel={slide.discoverLabel}
              onClick={(e) => {
                e.stopPropagation();
                onOpenProduct();
              }}
            >
              <ArrowRight size={14} strokeWidth={1.4} />
            </CircleActionButton>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT (< 768px): Watch on top (55% height), info below, panel is bottom strip (12vh) */}
      <div className="md:hidden relative w-full h-full flex flex-col px-6 pt-3 pb-[14vh] pointer-events-none">
        {/* Top Watch */}
        <div
          data-hero-watch
          onClick={onOpenProduct}
          className={`relative w-full h-[52%] flex items-center justify-center cursor-pointer ${
            interactive ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <WatchArtwork slide={slide} variant="moody" priority={priority} className="max-w-[280px]" />
        </div>

        {/* Bottom Info */}
        <div className={`flex flex-col items-start mt-1 z-20 ${interactive ? "pointer-events-auto" : "pointer-events-none"}`}>
          <h1 className="font-hero-expanded text-white text-[clamp(30px,8.5vw,44px)]">
            <span data-hero-title-line className="block">
              {slide.titleLine1}
            </span>
            <span data-hero-title-line className="block">
              {slide.titleLine2}
            </span>
          </h1>
          <div className="flex items-center justify-between w-full mt-1.5">
            <span
              data-hero-title-line
              className="font-hero-expanded text-white text-[16px]"
            >
              {slide.size}
            </span>
            <span
              data-hero-info-item
              className="text-[9px] uppercase tracking-[0.14em] text-white/50"
            >
              {slide.dialRangeLabel}
            </span>
          </div>

          <div data-hero-info-item className="w-full h-[1px] bg-white/[0.12] my-3" />

          <p
            data-hero-info-item
            className="font-serif text-[15px] leading-[1.45] text-white/70 line-clamp-2 mb-3.5"
          >
            {slide.bodyCopy}
          </p>

          <div
            data-hero-info-item
            className="w-full flex items-center justify-between gap-3"
          >
            <div
              onClick={handlePlayClick}
              role="button"
              tabIndex={interactive ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const rect = e.currentTarget.getBoundingClientRect();
                  onOpenFilm({ x: rect.left + 18, y: rect.top + 18 });
                }
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer"
            >
              <CircleActionButton
                size={36}
                ariaLabel={`Watch the film for ${slide.titleLine1} (mobile)`}
                onClick={handlePlayClick}
              >
                <Play size={11} strokeWidth={1.5} className="translate-x-[1px] fill-current" />
              </CircleActionButton>
              <span className="text-[9px] uppercase tracking-[0.14em] text-white/70">
                WATCH FILM
              </span>
            </div>

            <div
              onClick={onOpenProduct}
              role="button"
              tabIndex={interactive ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenProduct();
                }
              }}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-white">
                {slide.discoverLabel}
              </span>
              <CircleActionButton
                size={34}
                ariaLabel={`${slide.discoverLabel} (mobile)`}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProduct();
                }}
              >
                <ArrowRight size={13} strokeWidth={1.4} />
              </CircleActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
