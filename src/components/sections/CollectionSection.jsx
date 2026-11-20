"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const PRODUCTS = [
  {
    id: "overflow",
    name: "Overflow",
    stone: "Citrine",
    intention: "Worn for abundance.",
    image: "/watches/overflow/diagonal.webp",
  },
  {
    id: "cherish",
    name: "Cherish",
    stone: "Rose Quartz",
    intention: "Worn for the love you give yourself.",
    image: "/watches/cherish/diagonal.webp",
  },
  {
    id: "hush",
    name: "Hush",
    stone: "Amethyst",
    intention: "Worn for a quieter mind.",
    image: "/watches/hush/diagonal.webp",
  },
  {
    id: "ascent",
    name: "Ascent",
    stone: "Tiger’s Eye",
    intention: "Worn for the next step up.",
    image: "/watches/ascent/diagonal.webp",
  },
  {
    id: "wildfire",
    name: "Wildfire",
    stone: "Sunstone",
    intention: "Worn to be seen.",
    image: "/watches/wildfire/diagonal.webp",
  },
  {
    id: "cadence",
    name: "Cadence",
    stone: "Sodalite",
    intention: "Worn for words that land.",
    image: "/watches/cadence/diagonal.webp",
  },
];

export default function CollectionSection() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      // Section heading: fade in with 16px upward movement over 650ms
      const headingEl = sectionRef.current.querySelector("[data-collection-heading]");
      if (headingEl) {
        gsap.fromTo(
          headingEl,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headingEl,
              start: "top 86%",
              once: true,
            },
          }
        );
      }

      // Products: reveal once on entering the viewport, opacity 0→1 and translateY 24px→0 over 700ms, with restrained 80ms stagger
      const productEls = sectionRef.current.querySelectorAll("[data-collection-product]");
      if (productEls.length > 0) {
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
          // On mobile: reveal each item gently as it enters the viewport without stalling behind desktop stagger
          productEls.forEach((el) => {
            gsap.fromTo(
              el,
              { opacity: 0, y: 24 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 92%",
                  once: true,
                },
              }
            );
          });
        } else {
          // Desktop: 3 columns x 2 rows revealed with 80ms stagger
          gsap.fromTo(
            productEls,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sectionRef.current.querySelector("[data-collection-grid]") || sectionRef.current,
                start: "top 80%",
                once: true,
              },
            }
          );
        }
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="collection"
      ref={sectionRef}
      aria-label="The Collection"
      className="relative w-full bg-[#F5F2EB] text-[#1C1B1A] py-20 md:py-28 lg:py-36 overflow-hidden select-none"
    >
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[4vw]">
        {/* Centred Section Heading & Supporting Text */}
        <div
          data-collection-heading
          className="flex flex-col items-center text-center mb-14 sm:mb-16 md:mb-20 lg:mb-24"
        >
          <h2 className="font-serif font-normal text-[#1C1B1A] text-[clamp(32px,4.5vw,62px)] leading-[1.04] tracking-[0.01em]">
            Six stones. A personal intention.
          </h2>
          <p className="font-sans font-medium uppercase text-[#1C1B1A]/60 text-[11px] sm:text-[12px] md:text-[13px] tracking-[0.18em] mt-3 md:mt-4">
            Explore the collection.
          </p>
        </div>

        {/* 3 Columns × 2 Rows on Desktop / 2 Equal Columns on Mobile (1 col below 360px) */}
        <div
          data-collection-grid
          className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 gap-x-3.5 sm:gap-x-5 md:gap-x-8 lg:gap-x-12 gap-y-12 sm:gap-y-14 md:gap-y-18 lg:gap-y-20 items-start"
        >
          {PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={`/watch/${product.id}`}
              data-collection-product
              className="group flex flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1C1B1A] focus-visible:outline-offset-8 no-underline transition-none"
              aria-label={`Discover ${product.name}, ${product.stone} timepiece`}
            >
              {/* Transparent Silver Metal-Bracelet Watch Image */}
              <div className="relative w-full aspect-[1086/1448] flex items-center justify-center overflow-hidden">
                <Image
                  src={product.image}
                  alt={`${product.name} 38mm silver bracelet watch with ${product.stone} dial`}
                  fill
                  quality={92}
                  sizes="(max-width: 360px) 92vw, (max-width: 768px) 46vw, (max-width: 1200px) 30vw, 380px"
                  className="object-contain transition-transform duration-[450ms] ease-out group-hover:scale-[1.035] will-change-transform pointer-events-none select-none"
                />
              </div>

              {/* Below each image: Left-aligned product name, stone, intention, Discover link */}
              <div className="mt-4 sm:mt-5 md:mt-6 flex flex-col items-start text-left">
                {/* Product Name (Cormorant Garamond, 25-28px on mobile, 30-34px on desktop) */}
                <h3 className="font-serif font-normal text-[#1C1B1A] text-[25px] sm:text-[27px] md:text-[30px] lg:text-[33px] leading-[1.08] tracking-[0.015em]">
                  {product.name}
                </h3>

                {/* Stone Name (Jost, 11-12px) */}
                <span className="font-sans font-medium uppercase text-[#1C1B1A]/60 text-[11px] sm:text-[11.5px] md:text-[12px] tracking-[0.16em] mt-1 sm:mt-1.5">
                  {product.stone}
                </span>

                {/* Approved Intention (Jost, 13-14px, comfortable line-height, natural wrap) */}
                <p className="font-sans font-normal text-[#1C1B1A]/80 text-[13px] sm:text-[13.5px] md:text-[14px] leading-[1.55] mt-2 max-w-[280px]">
                  {product.intention}
                </p>

                {/* Discover Link with fixed 1px left-to-right clip-path underline */}
                <div className="mt-2.5 sm:mt-3 min-h-[44px] inline-flex items-center">
                  <span className="discover-underline font-sans font-medium uppercase text-[11px] sm:text-[11.5px] md:text-[12px] tracking-[0.18em] text-[#1C1B1A]">
                    Discover
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
