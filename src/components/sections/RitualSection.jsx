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
            detail: "Every dial is sliced from raw citrine, rose quartz, amethyst, tiger's eye, sunstone, or sodalite. Natural veining ensures no two watches are alike.",
        },
        {
            index: "02",
            title: "Sequential Numbering",
            detail: "Each stone is limited to 300 timepieces, individually numbered from 0001 to 0300 before entering the ritual.",
        },
        {
            index: "03",
            title: practitioner ? `Energized by ${practitioner}` : "The Ritual & Dated Record",
            detail: practitioner
                ? `Prior to dispatch, each numbered watch is energized by ${practitioner} and logged onto its blind-embossed cotton card with the date of the ritual.`
                : "Prior to dispatch, each numbered watch undergoes its energizing ritual and is logged onto a blind-embossed cotton card bearing its dial number and date.",
        },
    ];
    useGSAP(() => {
        if (!sectionRef.current)
            return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced)
            return;
        const revealEls = sectionRef.current.querySelectorAll("[data-ritual-reveal]");
        gsap.fromTo(revealEls, { opacity: 0, y: 22 }, {
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
        });
        if (macroParallaxRef.current) {
            gsap.fromTo(macroParallaxRef.current, { y: -22 }, {
                y: 22,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });
        }
    }, { scope: sectionRef });
    return (<section id="ritual" ref={sectionRef} aria-label="The Ritual" className="relative w-full bg-[#0A0A0B] text-[#F3EFE7] border-t border-[#F3EFE7]/[0.1] py-20 md:py-28 lg:py-36 overflow-hidden">
      {/* Subtle architectural top studio light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_65%_50%_at_50%_0%,rgba(243,239,231,0.045),transparent_72%)]"/>

      <div className="relative z-10 w-full px-6 md:px-[4vw]">
        {/* Section Eyebrow Row */}
        <div data-ritual-reveal className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-12 md:mb-16 border-b border-[#F3EFE7]/[0.1]">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#F3EFE7]/60">
            01 &mdash; THE RITUAL
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#F3EFE7]/50">
            {SITE_CONFIG.editionLabel} &middot; DIAL NO. 0001 &mdash; 0300
          </span>
        </div>

        {/* Main 12-Col Architectural Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left 6 Columns: Narrative + 3-Step Process */}
          <div className="lg:col-span-6 flex flex-col">
            <h2 data-ritual-reveal className="font-serif font-medium uppercase text-[#F3EFE7] text-[clamp(36px,4vw,62px)] leading-[0.98] tracking-[0.03em]">
              Energized Before
              <br />
              It Ships.
            </h2>

            <p data-ritual-reveal className="mt-6 font-sans text-[16px] md:text-[17px] leading-[1.68] text-[#F3EFE7]/76 max-w-xl">
              Every Watch Inc timepiece begins as a raw mineral slab and leaves
              the studio only after its recorded ritual is complete. No mystery,
              no overstatement &mdash; only a numbered watch and its dated card.
            </p>

            {/* 3-Step Process Ledger */}
            <div className="mt-10 md:mt-12 border-t border-[#F3EFE7]/[0.1] divide-y divide-[#F3EFE7]/[0.1]">
              {ritualSteps.map((step) => (<div key={step.index} data-ritual-reveal className="py-6 grid grid-cols-1 sm:grid-cols-[44px_1fr] gap-2 sm:gap-5 items-baseline">
                  <span className="font-mono text-[12px] tracking-[0.14em] text-[#F3EFE7]/45">
                    {step.index}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="font-sans text-[13px] font-medium uppercase tracking-[0.13em] text-[#F3EFE7]">
                      {step.title}
                    </h3>
                    <p className="font-sans text-[16px] leading-[1.6] text-[#F3EFE7]/66">
                      {step.detail}
                    </p>
                  </div>
                </div>))}
            </div>

            {/* Honest Editorial Closing Line */}
            <p data-ritual-reveal className="mt-8 pt-6 border-t border-[#F3EFE7]/[0.1] font-serif text-[20px] md:text-[22px] font-normal leading-[1.4] text-[#F3EFE7]/85 tracking-[0.01em]">
              &ldquo;{SITE_CONFIG.ritualFooterLine}&rdquo;
            </p>
          </div>

          {/* Right 6 Columns: Numbered Stone Macro + Dated Linen Ritual Card */}
          <div className="lg:col-span-6 space-y-6">
            {/* Dial Macro Study */}
            <div data-ritual-reveal className="relative w-full aspect-[16/11] bg-[#101012] border border-[#F3EFE7]/[0.1] overflow-hidden">
              <div ref={macroParallaxRef} className="relative w-full h-[116%] -top-[8%] will-change-transform">
                <Image src="/images/dial-macro-overflow.webp" alt="Macro view of natural citrine stone dial and applied steel baton indices" fill quality={90} sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover"/>
              </div>
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/75 via-transparent to-[#0A0A0B]/20 pointer-events-none"/>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 font-mono text-[10.5px] uppercase tracking-[0.13em] text-[#F3EFE7]/80">
                <span>NATURAL MINERAL SLAB &middot; 38MM</span>
                <span>NO. 0147 / 0300</span>
              </div>
            </div>

            {/* Tactile Dated Ritual Card + Practitioner Record */}
            <div data-ritual-reveal className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch">
              {/* Blind-Embossed Cotton Card Preview */}
              <div className="sm:col-span-6 relative bg-[#ECEAE6] text-[#0A0A0B] p-6 sm:p-7 flex flex-col justify-between min-h-[230px] border border-[#F3EFE7]/15">
                <div aria-hidden="true" className="absolute inset-3 border border-[#0A0A0B]/[0.14] pointer-events-none"/>
                <div className="relative z-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-[#0A0A0B]/55">
                  <span>WATCH INC</span>
                  <span>RECORD CARD</span>
                </div>

                <div className="relative z-10 my-5 space-y-1.5">
                  <p className="font-serif font-medium uppercase text-[24px] leading-none tracking-[0.04em] text-[#0A0A0B]">
                    RITUAL RECORD
                  </p>
                  <p className="font-sans text-[12px] text-[#0A0A0B]/65 leading-relaxed">
                    Accompanies every numbered watch inside its matte
                    presentation box.
                  </p>
                </div>

                <div className="relative z-10 pt-3 border-t border-[#0A0A0B]/15 space-y-1 font-mono text-[10px] uppercase tracking-[0.13em] text-[#0A0A0B]/70">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#0A0A0B]/45">DIAL NO.</span>
                    <span>0147 / 0300</span>
                  </div>
                  {practitioner && (<div className="flex justify-between gap-2">
                      <span className="text-[#0A0A0B]/45">PRACTITIONER</span>
                      <span className="truncate">{practitioner}</span>
                    </div>)}
                  <div className="flex justify-between gap-2">
                    <span className="text-[#0A0A0B]/45">RECORDED</span>
                    <span>SIGNED &amp; DATED</span>
                  </div>
                </div>
              </div>

              {/* Presentation Box Study */}
              <div className="sm:col-span-6 relative min-h-[230px] bg-[#101012] border border-[#F3EFE7]/[0.1] overflow-hidden flex flex-col justify-end">
                <Image src={SITE_CONFIG.images.presentationBox} alt="Matte black presentation box with timepiece, cotton ritual card, and selenite slab" fill quality={90} sizes="(max-width: 640px) 100vw, 24vw" className="object-cover"/>
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/85 via-[#0A0A0B]/20 to-transparent pointer-events-none"/>
                <div className="relative z-10 p-5 space-y-1">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#F3EFE7]/60">
                    IN THE BOX
                  </span>
                  <p className="font-sans text-[14px] text-[#F3EFE7]/88 leading-snug">
                    Numbered timepiece, blind-embossed card, and optional
                    selenite slab.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);
}
