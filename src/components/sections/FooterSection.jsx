"use client";
import React, { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SITE_CONFIG } from "@/data/site-config";
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}
const WORDMARK_CHARS = "WATCH INC".split("");
export default function FooterSection() {
    const footerRef = useRef(null);
    const wordmarkRef = useRef(null);
    useGSAP(() => {
        if (!wordmarkRef.current)
            return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const chars = wordmarkRef.current.querySelectorAll("[data-wordmark-char]");
        if (reduced) {
            gsap.set(chars, { yPercent: 0 });
            return;
        }
        gsap.fromTo(chars, { yPercent: 100 }, {
            yPercent: 0,
            duration: 0.9,
            stagger: 0.04,
            ease: "expo.out",
            scrollTrigger: {
                trigger: wordmarkRef.current,
                start: "top 92%",
                once: true,
            },
        });
    }, { scope: footerRef });
    return (<footer id="footer" ref={footerRef} aria-label="Site Footer" className="relative w-full bg-[#0A0A0B] text-[#F3EFE7] border-t border-[#F3EFE7]/[0.12] overflow-hidden">
      <div className="footer-navigation">
        <div className="footer-navigation__intro">
          <p className="footer-navigation__label">WATCH INC</p>
          <p className="footer-navigation__line font-serif">Time, with meaning.</p>
        </div>
        <nav aria-label="Footer navigation" className="footer-navigation__links">
          <Link href="/watches">Watches</Link>
          <Link href="/#ritual">The Ritual</Link>
          <Link href="/#selenite">Selenite</Link>
        </nav>
        <div className="footer-navigation__top"><a href="#" aria-label="Back to the top of the page">Back to top</a></div>
      </div>

      {/* Giant Full-Width Cormorant Wordmark revealed letter by letter */}
      <div ref={wordmarkRef} className="w-full px-4 md:px-[3vw] pt-3 md:pt-4 pb-6 overflow-hidden select-none">
        <div aria-label="WATCH INC" className="font-serif font-medium uppercase text-[#F3EFE7] text-[clamp(44px,11.8vw,200px)] leading-[0.88] tracking-[0.04em] text-center whitespace-nowrap flex justify-center">
          {WORDMARK_CHARS.map((ch, i) => (<span key={i} className="inline-block overflow-hidden">
              <span data-wordmark-char className="inline-block will-change-transform">
                {ch === " " ? "\u00A0" : ch}
              </span>
            </span>))}
        </div>
      </div>

      <style jsx global>{`
        #footer .footer-navigation { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 40px; padding: 32px 4vw 12px; }
        #footer .footer-navigation__label { margin: 0 0 10px; font-size: 10px; letter-spacing: .19em; color: #a39c90; }
        #footer .footer-navigation__line { margin: 0; font-size: 24px; font-weight: 400; color: #d3cbbf; }
        #footer .footer-navigation__links { display: flex; flex-wrap: wrap; gap: 28px; }
        #footer .footer-navigation a { color: #c4bdb1; text-decoration: none; font-size: 11px; letter-spacing: .1em; padding: 10px 0; text-underline-offset: 6px; transition: color .2s ease; }
        #footer .footer-navigation a:hover { color: #f3efe7; text-decoration: underline; text-decoration-thickness: 1px; }
        #footer .footer-navigation a:focus-visible { outline: 1px solid #f3efe7; outline-offset: 5px; }
        #footer .footer-navigation__top { justify-self: end; }
        @media (max-width: 767px) {
          #footer .footer-navigation { grid-template-columns: 1fr auto; padding: 28px 24px 8px; gap: 24px; }
          #footer .footer-navigation__intro { grid-column: 1 / -1; }
          #footer .footer-navigation__links { gap: 20px; }
          #footer .footer-navigation a { font-size: 10px; }
        }
        @media (prefers-reduced-motion: reduce) { #footer .footer-navigation a { transition: none; } }
      `}</style>
      {/* Bottom Disclaimer */}
      <div className="w-full px-6 md:px-[4vw] py-6 border-t border-[#F3EFE7]/[0.12] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="font-sans text-[13px] leading-[1.6] text-[#F3EFE7]/55 max-w-2xl">
          {SITE_CONFIG.disclaimer}
        </p>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#F3EFE7]/45 shrink-0">
          &copy; {new Date().getFullYear()} WATCH INC
        </span>
      </div>
    </footer>);
}
