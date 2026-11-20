"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/data/site-config";
import { useStore } from "@/store/useStore";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function WaitlistSection() {
  const sectionRef = useRef(null);
  const [selectedStone, setSelectedStone] = useState("overflow");
  const openWaitlist = useStore((s) => s.openWaitlist);

  const activeWatch =
    SITE_CONFIG.watches.find((w) => w.id === selectedStone) ?? SITE_CONFIG.watches[0];

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const revealEls = sectionRef.current.querySelectorAll("[data-waitlist-reveal]");
      gsap.fromTo(
        revealEls,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="waitlist"
      ref={sectionRef}
      aria-label="Join the Waitlist"
      className="relative w-full bg-[#0A0A0B] text-[#F3EFE7] border-t border-[#F3EFE7]/[0.1] py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      {/* Subtle stone-tinted ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse 55% 48% at 50% 0%, ${activeWatch.panelColor}15, transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full px-6 md:px-[4vw]">
        {/* Eyebrow Header */}
        <div
          data-waitlist-reveal
          className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-12 border-b border-[#F3EFE7]/[0.1]"
        >
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F3EFE7]" />
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#F3EFE7]/65">
              05 &mdash; JOIN THE WAITLIST
            </span>
          </div>
          <span className="font-sans text-[11px] font-normal uppercase tracking-[0.14em] text-[#F3EFE7]/50">
            PRIVATE RELEASE &middot; INDIVIDUALLY NUMBERED
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
          {/* Left Copy & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <h2
              data-waitlist-reveal
              className="font-serif font-normal uppercase text-[#F3EFE7] text-[clamp(36px,4.4vw,68px)] leading-[0.96] tracking-[0.02em]"
            >
              Join the Waitlist
              <br />
              for First Access.
            </h2>

            <p
              data-waitlist-reveal
              className="font-sans text-[16px] md:text-[17px] leading-[1.68] text-[#F3EFE7]/75 max-w-lg"
            >
              Select your preferred stone edition. Registered members are notified sequentially
              as each numbered 38mm batch completes its energizing ritual and is prepared for dispatch.
            </p>

            <div data-waitlist-reveal className="pt-2 flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => openWaitlist(selectedStone)}
                className="group inline-flex items-center gap-3 px-7 py-4 bg-[#F3EFE7] text-[#0A0A0B] hover:bg-white font-sans text-[12px] font-medium uppercase tracking-[0.16em] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
              >
                <span>Join the Waitlist &middot; {activeWatch.name}</span>
                <ArrowRight
                  size={15}
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-[#F3EFE7]/50">
                38MM SOLID STAINLESS STEEL
              </span>
            </div>
          </div>

          {/* Right Six-Stone Selector Grid */}
          <div data-waitlist-reveal className="lg:col-span-6">
            <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#F3EFE7]/55 mb-4">
              SELECT YOUR EDITION
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 border-t border-l border-[#F3EFE7]/[0.12]">
              {SITE_CONFIG.watches.map((watch) => {
                const isSelected = selectedStone === watch.id;
                return (
                  <button
                    key={watch.id}
                    type="button"
                    onClick={() => setSelectedStone(watch.id)}
                    aria-pressed={isSelected}
                    className={`group relative p-4 sm:p-5 border-r border-b border-[#F3EFE7]/[0.12] text-left transition-colors duration-300 cursor-pointer ${
                      isSelected
                        ? "bg-[#F3EFE7]/[0.08]"
                        : "bg-transparent hover:bg-[#F3EFE7]/[0.03]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: watch.panelColor }}
                      className={`block h-[2px] mb-4 transition-all duration-300 ${
                        isSelected ? "w-full opacity-100" : "w-5 opacity-70 group-hover:w-9"
                      }`}
                    />
                    <span className="block font-serif font-normal uppercase text-[20px] leading-none tracking-[0.03em] text-[#F3EFE7]">
                      {watch.name}
                    </span>
                    <span className="block font-sans text-[11px] uppercase tracking-[0.13em] text-[#F3EFE7]/60 mt-1.5">
                      {watch.stone}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
