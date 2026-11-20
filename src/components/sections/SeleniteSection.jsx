"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import { SITE_CONFIG } from "@/data/site-config";
import { useStore } from "@/store/useStore";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function SeleniteSection() {
  const outerRef = useRef(null);
  const imgParallaxRef = useRef(null);
  const waitlist = useStore((s) => s.waitlist);
  const [added, setAdded] = useState(waitlist.restingPlateInterest === "yes");

  useGSAP(
    () => {
      if (!outerRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      // Subtle slow scroll parallax on selenite-plate.webp
      if (imgParallaxRef.current) {
        gsap.fromTo(
          imgParallaxRef.current,
          { y: -24 },
          {
            y: 24,
            ease: "none",
            scrollTrigger: {
              trigger: outerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // Smooth restrained reveal for text content
      const copyEls = outerRef.current.querySelectorAll("[data-sel-reveal]");
      gsap.fromTo(
        copyEls,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: outerRef.current,
            start: "top 72%",
            once: true,
          },
        }
      );
    },
    { scope: outerRef }
  );

  const handleToggle = () => {
    const next = !added;
    setAdded(next);
    waitlist.setRestingPlateInterest(next ? "yes" : "no");
  };

  return (
    <section
      id="selenite"
      ref={outerRef}
      aria-label="The Selenite Ritual"
      className="relative w-full bg-[#ECEAE6] text-[#0A0A0B] overflow-hidden border-t border-[#0A0A0B]/[0.08]"
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-12">
        {/* Left 60%: Large Editorial Image */}
        <div className="md:col-span-7 relative min-h-[420px] md:min-h-[80vh] overflow-hidden border-b md:border-b-0 md:border-r border-[#0A0A0B]/[0.1] bg-[#E4E1DB] flex items-center justify-center">
          <div ref={imgParallaxRef} className="relative w-full h-[112%] will-change-transform">
            <Image
              src={SITE_CONFIG.images.selenitePlate}
              alt="Watch resting on a raw white selenite slab"
              fill
              quality={90}
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Right 40%: Text & Option Selection */}
        <div className="md:col-span-5 flex flex-col justify-center px-6 py-14 md:px-12 lg:px-16 md:py-20">
          <span
            data-sel-reveal
            className="block font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#0A0A0B]/55 mb-4"
          >
            04 &mdash; THE SELENITE RITUAL
          </span>

          <h2
            data-sel-reveal
            className="font-serif font-normal uppercase text-[#0A0A0B] text-[clamp(34px,3.8vw,58px)] leading-[0.96] tracking-[0.02em]"
          >
            The Resting Plate.
          </h2>

          <span
            data-sel-reveal
            className="block font-sans font-normal text-[12.5px] uppercase tracking-[0.16em] text-[#0A0A0B]/60 mt-2"
          >
            RAW WHITE SATIN-SPAR SLAB &middot; OPTIONAL ADD-ON
          </span>

          <div data-sel-reveal className="w-16 h-[1px] bg-[#0A0A0B]/20 my-7" />

          <p
            data-sel-reveal
            className="font-sans text-[16px] md:text-[17px] leading-[1.65] text-[#0A0A0B]/80 max-w-md"
          >
            In mineral tradition, raw selenite is regarded as a gentle resting surface for stones and crystals.
            Sourced and cut to cradle your 38mm timepiece when you take it off at night.
          </p>

          <p
            data-sel-reveal
            className="mt-4 font-sans text-[15px] leading-[1.65] text-[#0A0A0B]/65 max-w-md"
          >
            Offered as an optional add-on with your watch allocation. No supernatural or promised effects &mdash;
            simply an authentic, tactile ritual for your timepiece.
          </p>

          <div
            data-sel-reveal
            className="mt-9 pt-7 border-t border-[#0A0A0B]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          >
            <div>
              <span className="block font-sans text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#0A0A0B]/55">
                OPTIONAL SLAB
              </span>
              <span className="block font-sans text-[13.5px] text-[#0A0A0B]/75 mt-0.5">
                Available with your watch allocation
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggle}
              className={`h-[44px] px-6 border border-[#0A0A0B] font-sans text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 inline-flex items-center justify-center gap-2.5 cursor-pointer shrink-0 ${
                added
                  ? "bg-[#0A0A0B] text-[#F3EFE7]"
                  : "bg-transparent text-[#0A0A0B] hover:bg-[#0A0A0B] hover:text-[#F3EFE7]"
              }`}
            >
              {added && <Check size={13} strokeWidth={1.8} />}
              <span>{added ? "ADDED TO WAITLIST PREFERENCE" : "SELECT AS ADD-ON"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
