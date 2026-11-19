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
    const sectionRef = useRef(null);
    useGSAP(() => {
        if (!sectionRef.current)
            return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced)
            return;
        const frames = sectionRef.current.querySelectorAll("[data-worn-frame]");
        frames.forEach((frame, idx) => {
            const innerImg = frame.querySelector("[data-worn-img]");
            // Clip-path reveal from bottom
            gsap.fromTo(frame, { clipPath: "inset(100% 0 0 0)" }, {
                clipPath: "inset(0% 0 0 0)",
                duration: 1.1,
                delay: idx * 0.1,
                ease: "expo.inOut",
                scrollTrigger: {
                    trigger: frame,
                    start: "top 86%",
                    once: true,
                },
            });
            // Inner image scale 1.2 -> 1 scroll parallax
            if (innerImg) {
                gsap.fromTo(innerImg, { scale: 1.2 }, {
                    scale: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: frame,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                });
            }
        });
        const headerItems = sectionRef.current.querySelectorAll("[data-worn-header]");
        if (headerItems.length > 0) {
            gsap.fromTo(headerItems, { opacity: 0, y: 20 }, {
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
            });
        }
    }, { scope: sectionRef });
    return (<section id="worn" ref={sectionRef} aria-label="Worn Lifestyle Editorial" className="relative w-full bg-[#0A0A0B] text-[#F3EFE7] border-t border-[#F3EFE7]/[0.1] py-20 md:py-28 lg:py-32">
      <div className="relative px-6 md:px-[4vw]">
        {/* Editorial Header Row */}
        <div data-worn-header className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-10 md:mb-14 border-b border-[#F3EFE7]/[0.1]">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#F3EFE7]/60">
            03 &mdash; WORN EDITORIAL
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#F3EFE7]/50">
            38MM &middot; ON THE WRIST
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end mb-10 md:mb-14">
          <h2 data-worn-header className="lg:col-span-7 font-serif font-medium uppercase text-[#F3EFE7] text-[clamp(36px,4.4vw,66px)] leading-[0.98] tracking-[0.03em]">
            Worn for a Reason.
          </h2>
          <p data-worn-header className="lg:col-span-5 font-sans text-[16px] md:text-[17px] leading-[1.62] text-[#F3EFE7]/72 max-w-md lg:justify-self-end">
            Cut to sit quietly under a cuff and catch natural light when the
            wrist moves. Three stones from the six-watch debut.
          </p>
        </div>

        {/* Asymmetric Grid: One tall left, two stacked right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {/* Tall Left: Overflow Citrine */}
          <div data-worn-frame className="md:col-span-7 relative aspect-[3/4] md:aspect-auto md:min-h-[760px] overflow-hidden bg-[#111113] border border-[#F3EFE7]/[0.1]">
            <div data-worn-img className="relative w-full h-full will-change-transform">
              <Image src={SITE_CONFIG.images.wrist.overflow} alt="Overflow Citrine watch worn on the wrist" fill quality={90} sizes="(max-width: 768px) 100vw, 58vw" className="object-cover"/>
            </div>
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0A0A0B]/75 to-transparent pointer-events-none"/>
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.13em] text-[#F3EFE7]/85 bg-[#0A0A0B]/75 backdrop-blur-sm px-3 py-1.5 border border-[#F3EFE7]/[0.12]">
              <span aria-hidden="true" className="w-2 h-2 bg-[#B58E4A]"/>
              <span>01 &middot; OVERFLOW / CITRINE</span>
            </div>
          </div>

          {/* Right Column: Two Stacked Editorial Wrist Frames */}
          <div className="md:col-span-5 flex flex-col gap-4 md:gap-5">
            <div data-worn-frame className="relative flex-1 min-h-[300px] md:min-h-[370px] overflow-hidden bg-[#111113] border border-[#F3EFE7]/[0.1]">
              <div data-worn-img className="relative w-full h-full will-change-transform">
                <Image src={SITE_CONFIG.images.wrist.hush} alt="Hush Amethyst watch worn on the wrist" fill quality={90} sizes="(max-width: 768px) 100vw, 42vw" className="object-cover"/>
              </div>
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0B]/75 to-transparent pointer-events-none"/>
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.13em] text-[#F3EFE7]/85 bg-[#0A0A0B]/75 backdrop-blur-sm px-3 py-1.5 border border-[#F3EFE7]/[0.12]">
                <span aria-hidden="true" className="w-2 h-2 bg-[#8C7BA8]"/>
                <span>03 &middot; HUSH / AMETHYST</span>
              </div>
            </div>

            <div data-worn-frame className="relative flex-1 min-h-[300px] md:min-h-[370px] overflow-hidden bg-[#111113] border border-[#F3EFE7]/[0.1]">
              <div data-worn-img className="relative w-full h-full will-change-transform">
                <Image src={SITE_CONFIG.images.wrist.cadence} alt="Cadence Sodalite watch worn on the wrist" fill quality={90} sizes="(max-width: 768px) 100vw, 42vw" className="object-cover"/>
              </div>
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0B]/75 to-transparent pointer-events-none"/>
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.13em] text-[#F3EFE7]/85 bg-[#0A0A0B]/75 backdrop-blur-sm px-3 py-1.5 border border-[#F3EFE7]/[0.12]">
                <span aria-hidden="true" className="w-2 h-2 bg-[#5F7AA8]"/>
                <span>06 &middot; CADENCE / SODALITE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);
}
