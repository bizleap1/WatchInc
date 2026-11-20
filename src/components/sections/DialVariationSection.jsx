"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const DIAL_VARIATIONS = [
  {
    id: "overflow",
    name: "Overflow",
    stone: "Citrine Quartz",
    color: "#B58E4A",
    macroSrc: "/images/dial-macro-overflow.webp",
    mineralStructure: "Translucent golden-amber crystalline matrix",
    veining: "Honey tones with natural cloudy inclusions and internal crystal depth",
  },
  {
    id: "cherish",
    name: "Cherish",
    stone: "Rose Quartz",
    color: "#B88B90",
    macroSrc: "/images/dial-macro-cherish.webp",
    mineralStructure: "Soft translucent pale-pink mineral matrix",
    veining: "Subtle milky fractures, silky asterism, and gentle rose striations",
  },
  {
    id: "hush",
    name: "Hush",
    stone: "Natural Amethyst",
    color: "#8C7BA8",
    macroSrc: "/images/dial-macro-hush.webp",
    mineralStructure: "Deep violet to lilac crystalline quartz",
    veining: "Natural chevron banding with translucent smoky inclusions and layered shades",
  },
  {
    id: "ascent",
    name: "Ascent",
    stone: "Tiger's Eye",
    color: "#A3794B",
    macroSrc: "/images/dial-macro-ascent.webp",
    mineralStructure: "Metamorphic fibrous quartz with chatoyant luster",
    veining: "Rich golden-brown bands that shift and catch light under the crystal sapphire",
  },
  {
    id: "wildfire",
    name: "Wildfire",
    stone: "Natural Sunstone",
    color: "#BF7352",
    macroSrc: "/images/dial-macro-wildfire.webp",
    mineralStructure: "Translucent feldspar mineral matrix",
    veining: "Copper hematite platelet inclusions creating brilliant, natural aventurescence",
  },
  {
    id: "cadence",
    name: "Cadence",
    stone: "Royal Sodalite",
    color: "#5F7AA8",
    macroSrc: "/images/dial-macro-cadence.webp",
    mineralStructure: "Tectosilicate royal blue mineral matrix",
    veining: "Deep ultramarine blue marbled with striking white calcite veins",
  },
];

export default function DialVariationSection() {
  const [selectedDial, setSelectedDial] = useState(DIAL_VARIATIONS[0]);
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const revealItems = sectionRef.current.querySelectorAll("[data-dial-reveal]");
      gsap.fromTo(
        revealItems,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.08,
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
      id="dials"
      ref={sectionRef}
      aria-label="Every Dial Is Different"
      className="relative w-full bg-[#F5F2EB] text-[#0A0A0B] py-20 md:py-28 lg:py-36 border-t border-[#0A0A0B]/[0.08]"
    >
      <div className="relative z-10 w-full px-6 md:px-[4vw]">
        {/* Section Header Row */}
        <div
          data-dial-reveal
          className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-12 md:mb-16 border-b border-[#0A0A0B]/[0.12]"
        >
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0B]" />
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#0A0A0B]/65">
              03 &mdash; EVERY DIAL IS DIFFERENT
            </span>
          </div>
          <span className="font-sans text-[11px] font-normal uppercase tracking-[0.14em] text-[#0A0A0B]/55">
            NATURAL CRYSTALLINE VARIATION &middot; INDIVIDUAL NUMBERING
          </span>
        </div>

        {/* Section Title & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-baseline mb-14 md:mb-18">
          <h2
            data-dial-reveal
            className="lg:col-span-7 font-serif font-normal uppercase text-[#0A0A0B] text-[clamp(38px,4.5vw,72px)] leading-[0.94] tracking-[0.02em]"
          >
            Every Dial
            <br />
            Is Different.
          </h2>
          <p
            data-dial-reveal
            className="lg:col-span-5 font-sans text-[16px] md:text-[17px] leading-[1.68] text-[#0A0A0B]/72 max-w-lg lg:justify-self-end"
          >
            Because each dial is cut directly from raw stone, crystalline fractures, mineral veining,
            and translucence are never repeated. Every timepiece is individually numbered, creating a
            singular piece that belongs only to you.
          </p>
        </div>

        {/* Stone Selector Tabs */}
        <div
          data-dial-reveal
          className="flex flex-wrap items-center gap-3 md:gap-4 pb-8 mb-10 border-b border-[#0A0A0B]/[0.08]"
        >
          {DIAL_VARIATIONS.map((item) => {
            const isSelected = selectedDial.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedDial(item)}
                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#0A0A0B] border-[#0A0A0B] text-[#F3EFE7]"
                    : "bg-transparent border-[#0A0A0B]/20 text-[#0A0A0B]/75 hover:border-[#0A0A0B] hover:text-[#0A0A0B]"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-sans text-[11px] md:text-[12px] font-medium uppercase tracking-[0.14em]">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Large Stone-Dial Close-Up Showcase */}
        <div data-dial-reveal className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Large Macro View */}
          <div className="lg:col-span-7 relative aspect-[16/11] md:aspect-[16/10] bg-[#101012] border border-[#0A0A0B]/[0.1] overflow-hidden group">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedDial.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full h-full"
              >
                <Image
                  src={selectedDial.macroSrc}
                  alt={`Macro view of ${selectedDial.stone} dial matrix`}
                  fill
                  quality={92}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </motion.div>
            </AnimatePresence>

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"
            />

            {/* Inset Dial Numbering & Mineral Tag */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#F3EFE7]/90">
              <span className="inline-flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: selectedDial.color }}
                />
                <span>{selectedDial.stone} &middot; 38MM</span>
              </span>
              <span>INDIVIDUALLY NUMBERED</span>
            </div>
          </div>

          {/* Right Column: Mineralogy & Variation Narrative */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-7">
            <div>
              <span className="font-sans text-[10.5px] uppercase tracking-[0.2em] text-[#0A0A0B]/55 block mb-2">
                NATURAL MINERALOGY &amp; STRUCTURE
              </span>
              <h3 className="font-serif font-normal uppercase text-[28px] md:text-[34px] leading-tight text-[#0A0A0B]">
                {selectedDial.stone}
              </h3>
            </div>

            <div className="space-y-5 border-t border-b border-[#0A0A0B]/[0.1] py-6">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0A0A0B]/50 block mb-1">
                  CRYSTAL MATRIX
                </span>
                <p className="font-sans text-[15px] leading-relaxed text-[#0A0A0B]/85">
                  {selectedDial.mineralStructure}
                </p>
              </div>

              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0A0A0B]/50 block mb-1">
                  VEINING SIGNATURE
                </span>
                <p className="font-sans text-[15px] leading-relaxed text-[#0A0A0B]/75">
                  {selectedDial.veining}
                </p>
              </div>

              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0A0A0B]/50 block mb-1">
                  SERIAL NUMBERING
                </span>
                <p className="font-sans text-[15px] leading-relaxed text-[#0A0A0B]/75">
                  Each watch is individually engraved and registered in our studio dispatch ledger with its
                  own sequential dial number.
                </p>
              </div>
            </div>

            <p className="font-serif italic text-[16px] text-[#0A0A0B]/70 leading-relaxed">
              &ldquo;No two dials are ever identical. The stone on your wrist is the only one in the world
              with that precise pattern.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
