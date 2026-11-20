"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SITE_CONFIG, getPractitionerName } from "@/data/site-config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function RitualSection() {
  const sectionRef = useRef(null);
  const macroParallaxRef = useRef(null);
  const practitioner = getPractitionerName();

  const ritualSteps = [
    {
      index: "01",
      title: "Natural Stone, Singular Cut",
      detail:
        "Every dial is sliced from raw citrine, rose quartz, amethyst, tiger's eye, sunstone, or sodalite. Natural crystalline veining ensures no two dials are identical.",
    },
    {
      index: "02",
      title: "Sequential Numbering",
      detail:
        "Each timepiece receives its sequential dial number, permanently documented on the watch and recorded in the studio dispatch ledger.",
    },
    {
      index: "03",
      title: practitioner ? `The Energizing Ritual · ${practitioner}` : "The Energizing Ritual",
      detail: practitioner
        ? `Before shipping, each numbered timepiece undergoes its energizing ritual by ${practitioner}. The date and individual dial number are inscribed on a blind-embossed cotton card.`
        : "Before shipping, each numbered timepiece undergoes its energizing ritual in the studio. The completion date and individual dial number are inscribed on a blind-embossed cotton card.",
    },
  ];

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const revealEls = sectionRef.current.querySelectorAll("[data-ritual-reveal]");
      gsap.fromTo(
        revealEls,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      );

      if (macroParallaxRef.current) {
        gsap.fromTo(
          macroParallaxRef.current,
          { y: -20 },
          {
            y: 20,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="ritual"
      ref={sectionRef}
      aria-label="The Energizing Ritual"
      className="relative w-full bg-[#0A0A0B] text-[#F3EFE7] border-t border-[#F3EFE7]/[0.1] py-20 md:py-28 lg:py-36 overflow-hidden"
    >
      {/* Subtle architectural top studio light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_65%_50%_at_50%_0%,rgba(243,239,231,0.05),transparent_72%)]"
      />

      <div className="relative z-10 w-full px-6 md:px-[4vw]">
        {/* Section Eyebrow Row */}
        <div
          data-ritual-reveal
          className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-12 md:mb-16 border-b border-[#F3EFE7]/[0.1]"
        >
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F3EFE7]" />
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#F3EFE7]/65">
              02 &mdash; THE ENERGIZING RITUAL
            </span>
          </div>
          <span className="font-sans text-[11px] font-normal uppercase tracking-[0.14em] text-[#F3EFE7]/50">
            BEFORE SHIPPING &middot; DATED RECORD CARD
          </span>
        </div>

        {/* Main 12-Col Architectural Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left 6 Columns: Narrative + 3-Step Process */}
          <div className="lg:col-span-6 flex flex-col">
            <h2
              data-ritual-reveal
              className="font-serif font-normal uppercase text-[#F3EFE7] text-[clamp(36px,4.2vw,66px)] leading-[0.96] tracking-[0.02em]"
            >
              Energized Before
              <br />
              It Ships.
            </h2>

            <p
              data-ritual-reveal
              className="mt-6 font-sans text-[16px] md:text-[17px] leading-[1.68] text-[#F3EFE7]/76 max-w-xl"
            >
              Every Watch Inc timepiece is cleansed and energized in our studio before it is packed for dispatch.
              Each piece is paired with its blind-embossed cotton card documenting the individual dial number,
              the assigned practitioner, and the date of the ritual.
            </p>

            {/* 3-Step Process Ledger */}
            <div className="mt-10 md:mt-12 border-t border-[#F3EFE7]/[0.1] divide-y divide-[#F3EFE7]/[0.1]">
              {ritualSteps.map((step) => (
                <div
                  key={step.index}
                  data-ritual-reveal
                  className="py-6 grid grid-cols-1 sm:grid-cols-[44px_1fr] gap-2 sm:gap-5 items-baseline"
                >
                  <span className="font-mono text-[12px] tracking-[0.14em] text-[#F3EFE7]/45">
                    {step.index}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-[#F3EFE7]">
                      {step.title}
                    </h3>
                    <p className="font-sans text-[15.5px] leading-[1.62] text-[#F3EFE7]/68">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Editorial Footer Line */}
            <p
              data-ritual-reveal
              className="mt-8 pt-6 border-t border-[#F3EFE7]/[0.1] font-serif text-[19px] md:text-[21px] font-normal leading-[1.4] text-[#F3EFE7]/85 tracking-[0.01em]"
            >
              &ldquo;{SITE_CONFIG.ritualFooterLine}&rdquo;
            </p>
          </div>

          {/* Right 6 Columns: Presentation & Dated Linen Ritual Card */}
          <div className="lg:col-span-6 space-y-6">
            {/* Tactile Dated Ritual Card Preview */}
            <div
              data-ritual-reveal
              className="relative bg-[#ECEAE6] text-[#0A0A0B] p-7 md:p-9 flex flex-col justify-between min-h-[260px] border border-[#F3EFE7]/15"
            >
              <div
                aria-hidden="true"
                className="absolute inset-3 border border-[#0A0A0B]/[0.12] pointer-events-none"
              />
              <div className="relative z-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#0A0A0B]/60">
                <span>WATCH INC STUDIO</span>
                <span>RITUAL RECORD</span>
              </div>

              <div className="relative z-10 my-6 space-y-2">
                <p className="font-serif font-normal uppercase text-[26px] md:text-[30px] leading-none tracking-[0.03em] text-[#0A0A0B]">
                  AUTHENTICATION &amp; RITUAL RECORD
                </p>
                <p className="font-sans text-[13px] text-[#0A0A0B]/70 leading-relaxed max-w-md">
                  Signed, dated, and numbered on heavy cotton card stock. Accompanies every timepiece
                  inside its presentation box.
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-[#0A0A0B]/15 space-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0A0A0B]/75">
                <div className="flex justify-between gap-2">
                  <span className="text-[#0A0A0B]/50">SPECIFICATION</span>
                  <span>38MM SOLID STAINLESS STEEL</span>
                </div>
                {practitioner && (
                  <div className="flex justify-between gap-2">
                    <span className="text-[#0A0A0B]/50">PRACTITIONER</span>
                    <span className="truncate">{practitioner}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span className="text-[#0A0A0B]/50">STATUS</span>
                  <span>ENERGIZED &amp; DATED PRIOR TO DISPATCH</span>
                </div>
              </div>
            </div>

            {/* Presentation Box Visual */}
            <div
              data-ritual-reveal
              className="relative min-h-[260px] md:min-h-[300px] bg-[#101012] border border-[#F3EFE7]/[0.1] overflow-hidden flex flex-col justify-end"
            >
              <div ref={macroParallaxRef} className="relative w-full h-[116%] -top-[8%] will-change-transform">
                <Image
                  src={SITE_CONFIG.images.presentationBox}
                  alt="Matte presentation box with timepiece, cotton ritual card, and selenite plate"
                  fill
                  quality={90}
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/90 via-[#0A0A0B]/25 to-transparent pointer-events-none"
              />
              <div className="relative z-10 p-6 space-y-1">
                <span className="block font-sans text-[10px] uppercase tracking-[0.16em] text-[#F3EFE7]/60">
                  DISPATCH PACKAGING
                </span>
                <p className="font-sans text-[14.5px] text-[#F3EFE7]/90 leading-snug">
                  Numbered timepiece, blind-embossed cotton ritual card, and optional resting plate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
