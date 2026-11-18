"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Check } from "lucide-react";
import { SITE_CONFIG } from "@/data/site-config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const WORDMARK_CHARS = "WATCH INC".split("");

export default function FooterSection() {
  const footerRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useGSAP(
    () => {
      if (!wordmarkRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const chars = wordmarkRef.current.querySelectorAll("[data-wordmark-char]");

      if (reduced) {
        gsap.set(chars, { yPercent: 0 });
        return;
      }

      gsap.fromTo(
        chars,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.04,
          ease: "expo.out",
          scrollTrigger: {
            trigger: wordmarkRef.current,
            start: "top 92%",
            once: true,
          },
        }
      );
    },
    { scope: footerRef }
  );

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) return;
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newsletterEmail.trim(),
          name: "Newsletter Subscriber",
          stones: ["overflow"],
          selenitePlate: "maybe",
        }),
      });
    } catch { }
    setSubscribed(true);
    setNewsletterEmail("");
  };

  return (
    <footer
      id="footer"
      ref={footerRef}
      aria-label="Site Footer"
      className="relative w-full bg-[#0A0A0B] text-[#F3EFE7] border-t border-[#F3EFE7]/[0.12] overflow-hidden"
    >
      {/* 4 Hairline-Separated Columns */}
      <div className="w-full border-b border-white/[0.12] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Column 1: Timepieces */}
        <div className="p-8 md:p-10 border-b sm:border-b-0 sm:border-r border-white/[0.12] space-y-5">
          <h3 className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
            TIMEPIECES
          </h3>
          <ul className="space-y-3">
            {SITE_CONFIG.watches.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/watch/${w.id}`}
                  className="font-sans text-[12px] uppercase tracking-[0.12em] text-white/75 hover:text-white transition-colors inline-flex items-center gap-3"
                >
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: w.panelColor }}
                    className="w-2 h-2 inline-block shrink-0"
                  />
                  <span>
                    {w.name} &middot; {w.stone}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: Explore */}
        <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-white/[0.12] space-y-5">
          <h3 className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
            EXPLORE
          </h3>
          <ul className="space-y-3 font-sans text-[12px] uppercase tracking-[0.12em] text-white/75">
            <li>
              <a href="#selenite" className="hover:text-white transition-colors">
                SELENITE RESTING PLATE
              </a>
            </li>
            <li>
              <a href="#worn" className="hover:text-white transition-colors">
                WORN
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Help */}
        <div className="p-8 md:p-10 border-b sm:border-b-0 sm:border-r border-white/[0.12] space-y-5">
          <h3 className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
            HELP
          </h3>
          <ul className="space-y-3 font-sans text-[12px] uppercase tracking-[0.12em] text-white/75">
            <li>
              <Link href="/admin/waitlist" className="hover:text-white transition-colors">
                REGISTRY ADMIN
              </Link>
            </li>
            <li className="text-white/45">SHIPPING &amp; DISPATCH</li>
            <li className="text-white/45">CARE &amp; TERMS</li>
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div className="p-8 md:p-10 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.13em] text-[#F3EFE7]/50">
              NEWSLETTER
            </h3>
            <p className="font-sans text-[16px] leading-[1.6] text-[#F3EFE7]/65">
              Receive dispatch dates when the numbered allocation opens.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] text-[#F3EFE7]">
              <Check size={14} strokeWidth={1.6} />
              <span>SUBSCRIBED</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex items-end gap-3 pt-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Newsletter email"
                className="flex-1 bg-transparent border-0 border-b border-[#F3EFE7]/25 pb-2.5 text-[16px] text-[#F3EFE7] placeholder:text-[#F3EFE7]/40 focus:outline-none focus:border-[#F3EFE7]"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="w-[36px] h-[36px] rounded-full border border-[#F3EFE7]/40 hover:bg-[#F3EFE7] hover:text-[#0A0A0B] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              >
                <ArrowRight size={14} strokeWidth={1.4} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Giant Full-Width Cormorant Wordmark revealed letter by letter */}
      <div
        ref={wordmarkRef}
        className="w-full px-4 md:px-[3vw] pt-10 md:pt-14 pb-6 overflow-hidden select-none"
      >
        <div
          aria-label="WATCH INC"
          className="font-serif font-medium uppercase text-[#F3EFE7] text-[clamp(44px,11.8vw,200px)] leading-[0.88] tracking-[0.04em] text-center whitespace-nowrap flex justify-center"
        >
          {WORDMARK_CHARS.map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <span data-wordmark-char className="inline-block will-change-transform">
                {ch === " " ? "\u00A0" : ch}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="w-full px-6 md:px-[4vw] py-6 border-t border-[#F3EFE7]/[0.12] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="font-sans text-[13px] leading-[1.6] text-[#F3EFE7]/55 max-w-2xl">
          {SITE_CONFIG.disclaimer}
        </p>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#F3EFE7]/45 shrink-0">
          &copy; WATCH INC &middot; {SITE_CONFIG.editionLabel}
        </span>
      </div>
    </footer>
  );
}
