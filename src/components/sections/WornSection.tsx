"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SITE_CONFIG } from "@/data/site-config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function WornSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const frames = sectionRef.current.querySelectorAll("[data-worn-frame]");
      frames.forEach((frame, idx) => {
        const innerImg = frame.querySelector("[data-worn-img]");

        // Clip-path reveal from bottom
        gsap.fromTo(
          frame,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.1,
            delay: idx * 0.1,
            ease: "expo.inOut",
            scrollTrigger: {
              trigger: frame,
              start: "top 86%",
              once: true,
            },
          }
        );

        // Inner image scale 1.2 -> 1 scroll parallax
        if (innerImg) {
          gsap.fromTo(
            innerImg,
            { scale: 1.2 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      });

      const caption = sectionRef.current.querySelector("[data-worn-caption]");
      if (caption) {
        gsap.fromTo(
          caption,
          { opacity: 0, y: 30, filter: "blur(16px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "expo.out",
            scrollTrigger: {
              trigger: caption,
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="worn"
      ref={sectionRef}
      aria-label="Worn Lifestyle Editorial"
      className="relative w-full bg-[#0A0A0B] text-white border-t border-white/[0.12] pt-16 md:pt-24 pb-24 md:pb-32"
    >
      <div className="relative px-6 md:px-[4vw]">
        {/* Asymmetric Grid: One tall left, two stacked right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {/* Tall Left: Overflow Citrine */}
          <div
            data-worn-frame
            className="md:col-span-7 relative aspect-[3/4] md:aspect-auto md:min-h-[780px] overflow-hidden bg-[#111113] border border-white/[0.12]"
          >
            <div data-worn-img className="relative w-full h-full will-change-transform">
              <Image
                src={SITE_CONFIG.images.wrist.overflow}
                alt="Overflow Citrine watch worn on the wrist"
                fill
                quality={90}
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 bg-[#0A0A0B]/75 px-3 py-1.5 border border-white/[0.12]">
              01 &middot; OVERFLOW / CITRINE
            </div>
          </div>

          {/* Right Column: Two Stacked Editorial Wrist Frames */}
          <div className="md:col-span-5 flex flex-col gap-4 md:gap-5">
            <div
              data-worn-frame
              className="relative flex-1 min-h-[300px] md:min-h-[380px] overflow-hidden bg-[#111113] border border-white/[0.12]"
            >
              <div data-worn-img className="relative w-full h-full will-change-transform">
                <Image
                  src={SITE_CONFIG.images.wrist.hush}
                  alt="Hush Amethyst watch worn on the wrist"
                  fill
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 bg-[#0A0A0B]/75 px-3 py-1.5 border border-white/[0.12]">
                03 &middot; HUSH / AMETHYST
              </div>
            </div>

            <div
              data-worn-frame
              className="relative flex-1 min-h-[300px] md:min-h-[380px] overflow-hidden bg-[#111113] border border-white/[0.12]"
            >
              <div data-worn-img className="relative w-full h-full will-change-transform">
                <Image
                  src={SITE_CONFIG.images.wrist.cadence}
                  alt="Cadence Sodalite watch worn on the wrist"
                  fill
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 bg-[#0A0A0B]/75 px-3 py-1.5 border border-white/[0.12]">
                06 &middot; CADENCE / SODALITE
              </div>
            </div>
          </div>
        </div>

        {/* Big Archivo Expanded Caption Overlaid Across the Grid Edge */}
        <div
          data-worn-caption
          className="relative md:absolute md:left-[4vw] md:bottom-10 z-20 mt-8 md:mt-0 pointer-events-none select-none"
        >
          <h2 className="font-hero-expanded text-white text-[clamp(36px,5.8vw,96px)] leading-[0.9] drop-shadow-[0_12px_36px_rgba(0,0,0,0.85)]">
            WORN FOR
            <br />
            A REASON.
          </h2>
        </div>
      </div>
    </section>
  );
}
