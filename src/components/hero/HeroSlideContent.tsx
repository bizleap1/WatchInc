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
    <div className="relative w-full h-full font-sans text-[#F3EFE7] pointer-events-none">
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
          className={`absolute left-[-2vw] top-1/2 -translate-y-1/2 h-[88%] w-[44vw] max-w-[680px] cursor-pointer z-10 ${interactive ? "pointer-events-auto" : "pointer-events-none"
            }`}
        >
          <WatchArtwork slide={slide} variant="moody" priority={priority} />
        </div>

        {/* Info Column — bounded inside 44vw..78vw so titles & dial names stay cleanly clear of the right panel & watch preview */}
        <div className="absolute left-[44vw] top-1/2 -translate-y-1/2 w-[34vw] max-w-[430px] pr-4 z-20 flex flex-col items-start">
          {/* Primary Watch Name (Cormorant Garamond 500) + Noticeably Smaller Dial Name & Compact 40MM Label (Jost) */}
          <div className="w-full select-none pointer-events-none">
            <h1 className="font-serif font-medium uppercase text-[#F3EFE7] text-[clamp(42px,4.2vw,70px)] leading-[0.98] tracking-[0.04em] break-normal">
              <span data-hero-title-line className="block">
                {slide.titleLine1}
              </span>
            </h1>
            <div
              data-hero-title-line
              className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5"
            >
              <span className="font-sans font-normal text-[clamp(14px,1.05vw,16px)] leading-[1.35] uppercase tracking-[0.13em] text-[#F3EFE7]/85">
                {slide.titleLine2}
              </span>
              <span
                aria-hidden="true"
                className="text-[#F3EFE7]/30 text-[12px]"
              >
                &middot;
              </span>
              <span className="font-sans font-medium tabular-nums text-[12px] leading-none uppercase tracking-[0.11em] text-[#F3EFE7]/65">
                {slide.size}
              </span>
            </div>
          </div>

          {/* 1px hairline */}
          <div
            data-hero-info-item
            className="w-[72%] h-[1px] bg-[#F3EFE7]/[0.12] my-[22px]"
          />

          {/* Film Row: 46px circle play button + two-line label */}
          <div
            data-hero-info-item
            className={`flex items-center gap-4 group/film cursor-pointer ${interactive ? "pointer-events-auto" : "pointer-events-none"
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
              size={46}
              ariaLabel={`Watch the film for ${slide.titleLine1}`}
              onClick={handlePlayClick}
            >
              <Play size={13} strokeWidth={1.5} className="translate-x-[1px] fill-current" />
            </CircleActionButton>

            <div className="flex flex-col">
              <span className="font-sans font-normal text-[16px] text-[#F3EFE7]/92 tracking-[0.01em] leading-snug">
                {slide.filmHeadline}
              </span>
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#F3EFE7]/55 mt-0.5">
                WATCH THE FILM
              </span>
            </div>
          </div>

          {/* 1px hairline */}
          <div
            data-hero-info-item
            className="w-[72%] h-[1px] bg-[#F3EFE7]/[0.12] my-[22px]"
          />

          {/* Edition & Numbering (Jost 500) */}
          <div
            data-hero-info-item
            className="font-sans text-[11px] font-medium tabular-nums uppercase tracking-[0.14em] text-[#F3EFE7]/60 mb-3"
          >
            {slide.dialRangeLabel}
          </div>

          {/* Readable Body Copy (16-17px desktop, Jost) */}
          <p
            data-hero-info-item
            className="font-sans font-normal text-[16px] lg:text-[17px] leading-[1.6] text-[#F3EFE7]/78 max-w-[420px] mb-7"
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
            className={`flex items-center gap-4 group/discover cursor-pointer ${interactive ? "pointer-events-auto" : "pointer-events-none"
              }`}
          >
            <span className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-[#F3EFE7] group-hover/discover:text-[#F3EFE7]/75 transition-colors">
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

      {/* MOBILE LAYOUT (< 768px): Watch -> Name/Dial -> Short Ritual Line -> Discover (no squeezed bottom strip) */}
      <div className="md:hidden relative w-full h-full flex flex-col justify-between px-6 pt-3 pb-7 pointer-events-none">
        {/* 1. Watch */}
        <div
          data-hero-watch
          onClick={onOpenProduct}
          className={`relative w-full h-[46%] flex items-center justify-center cursor-pointer ${interactive ? "pointer-events-auto" : "pointer-events-none"
            }`}
        >
          <WatchArtwork slide={slide} variant="moody" priority={priority} className="max-w-[270px]" />
        </div>

        {/* 2. Name / Dial -> 3. Short Ritual Line -> 4. Discover */}
        <div className={`flex flex-col items-start z-20 w-full ${interactive ? "pointer-events-auto" : "pointer-events-none"}`}>
          <h1 className="font-serif font-medium uppercase text-[#F3EFE7] text-[clamp(34px,9vw,46px)] leading-[1.0] tracking-[0.04em] break-normal">
            <span data-hero-title-line className="block">
              {slide.titleLine1}
            </span>
          </h1>
          <div
            data-hero-title-line
            className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 w-full"
          >
            <span className="font-sans font-normal text-[13px] leading-[1.3] uppercase tracking-[0.12em] text-[#F3EFE7]/85">
              {slide.titleLine2}
            </span>
            <span aria-hidden="true" className="text-[#F3EFE7]/30 text-[11px]">
              &middot;
            </span>
            <span className="font-sans font-medium tabular-nums text-[11px] leading-none uppercase tracking-[0.1em] text-[#F3EFE7]/65">
              {slide.size}
            </span>
          </div>

          <div data-hero-info-item className="w-full h-[1px] bg-[#F3EFE7]/[0.12] my-3" />

          <p
            data-hero-info-item
            className="font-sans font-normal text-[16px] leading-[1.5] text-[#F3EFE7]/78 line-clamp-2 mb-4"
          >
            {slide.bodyCopy}
          </p>

          <div
            data-hero-info-item
            className="w-full flex items-center justify-between gap-3"
          >
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
              <span className="font-sans text-[12px] font-medium uppercase tracking-[0.13em] text-[#F3EFE7]">
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
              className="flex items-center gap-2 text-left cursor-pointer"
            >
              <CircleActionButton
                size={34}
                ariaLabel={`Watch the film for ${slide.titleLine1} (mobile)`}
                onClick={handlePlayClick}
              >
                <Play size={11} strokeWidth={1.5} className="translate-x-[1px] fill-current" />
              </CircleActionButton>
              <span className="font-sans font-medium text-[11px] uppercase tracking-[0.12em] text-[#F3EFE7]/75">
                FILM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
