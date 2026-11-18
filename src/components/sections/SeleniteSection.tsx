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
  const outerRef = useRef<HTMLDivElement>(null);
  const lightPanelRef = useRef<HTMLElement>(null);
  const imgParallaxRef = useRef<HTMLDivElement>(null);
  const exitWipeRef = useRef<HTMLDivElement>(null);

  const waitlist = useStore((s) => s.waitlist);
  const [added, setAdded] = useState(waitlist.restingPlateInterest === "yes");

  useGSAP(
    () => {
      if (!outerRef.current || !lightPanelRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      // Moonlight-white (#ECEAE6) panel wipes up from bottom on enter
      gsap.fromTo(
        lightPanelRef.current,
        { clipPath: "inset(18% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 1.1,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: outerRef.current,
            start: "top 85%",
            end: "top 25%",
            scrub: 0.7,
          },
        }
      );

      // Slow scroll parallax on selenite-plate.webp
      if (imgParallaxRef.current) {
        gsap.fromTo(
          imgParallaxRef.current,
          { y: -32 },
          {
            y: 32,
            ease: "none",
            scrollTrigger: {
              trigger: lightPanelRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // Blur-to-sharp reveal for right copy column
      const copyEls = lightPanelRef.current.querySelectorAll("[data-sel-reveal]");
      gsap.fromTo(
        copyEls,
        { opacity: 0, y: 28, filter: "blur(14px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          stagger: 0.08,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: {
            trigger: lightPanelRef.current,
            start: "top 65%",
            once: true,
          },
        }
      );

      // Exit dark panel wipes back up into next section
      if (exitWipeRef.current) {
        gsap.fromTo(
          exitWipeRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "bottom center",
            scrollTrigger: {
              trigger: outerRef.current,
              start: "bottom 92%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          }
        );
      }
    },
    { scope: outerRef }
  );

  const handleToggle = () => {
    const next = !added;
    setAdded(next);
    waitlist.setRestingPlateInterest(next ? "yes" : "no");
  };

  return (
    <div ref={outerRef} className="relative w-full bg-[#0A0A0B]">
      <section
        id="selenite"
        ref={lightPanelRef}
        aria-label="Selenite Resting Plate"
        className="relative w-full bg-[#ECEAE6] text-[#0A0A0B] flex flex-col justify-between overflow-hidden"
      >
        {/* Split Layout matching Hero Product View: Left 60% Image | Right 40% Text */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12">
          {/* Left 60% (7 cols on 12-col grid -> ~58.3% / 60% visual) */}
          <div className="md:col-span-7 relative min-h-[420px] md:min-h-[82vh] overflow-hidden border-b md:border-b-0 md:border-r border-[#0A0A0B]/15 bg-[#E4E1DB] flex items-center justify-center">
            <div
              ref={imgParallaxRef}
              className="relative w-full h-[112%] will-change-transform"
            >
              <Image
                src={SITE_CONFIG.images.selenitePlate}
                alt="Citrine watch resting on a rough white selenite slab"
                fill
                quality={90}
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Right 40% Text Column in #0A0A0B */}
          <div className="md:col-span-5 flex flex-col justify-center px-6 py-14 md:px-12 lg:px-16 md:py-20">
            <h2
              data-sel-reveal
              className="font-serif font-medium uppercase text-[#0A0A0B] text-[clamp(36px,3.8vw,58px)] leading-[0.98] tracking-[0.03em]"
            >
              <span className="block">{SITE_CONFIG.seleniteLines.headingLine1}</span>
              <span className="block font-sans font-normal text-[13px] md:text-[14px] tracking-[0.14em] text-[#0A0A0B]/70 mt-3">
                {SITE_CONFIG.seleniteLines.headingLine2}
              </span>
            </h2>

            <div data-sel-reveal className="w-24 h-[1px] bg-[#0A0A0B]/20 my-8" />

            <p
              data-sel-reveal
              className="font-sans text-[16px] md:text-[17px] leading-[1.65] text-[#0A0A0B]/85 max-w-md"
            >
              {SITE_CONFIG.seleniteLines.primaryCopy}
            </p>

            <p
              data-sel-reveal
              className="mt-4 font-sans text-[16px] leading-[1.65] text-[#0A0A0B]/65 max-w-md"
            >
              {SITE_CONFIG.seleniteLines.secondaryCopy}
            </p>

            <div
              data-sel-reveal
              className="mt-10 pt-8 border-t border-[#0A0A0B]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div>
                <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#0A0A0B]/55">
                  OPTIONAL COMPANION
                </span>
                <span className="block font-mono text-[17px] font-medium text-[#0A0A0B] mt-1">
                  {SITE_CONFIG.selenitePlatePrice}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggle}
                className={`h-[46px] px-6 border border-[#0A0A0B] font-sans text-[11px] font-medium uppercase tracking-[0.13em] transition-colors duration-200 inline-flex items-center justify-center gap-2.5 cursor-pointer ${added
                    ? "bg-[#0A0A0B] text-[#F3EFE7]"
                    : "bg-transparent text-[#0A0A0B] hover:bg-[#0A0A0B] hover:text-[#F3EFE7]"
                  }`}
              >
                {added && <Check size={13} strokeWidth={1.75} />}
                <span>
                  {added ? "ADDED TO WAITLIST PREFERENCE" : SITE_CONFIG.seleniteLines.cta}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Exit dark wipe bar rising smoothly into Section 07 */}
        <div
          ref={exitWipeRef}
          aria-hidden="true"
          className="w-full h-12 md:h-20 bg-[#0A0A0B] origin-bottom"
        />
      </section>
    </div>
  );
}
