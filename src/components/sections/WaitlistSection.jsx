"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useStore } from "@/store/useStore";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function WaitlistSection() {
  const sectionRef = useRef(null);
  const openWaitlist = useStore((state) => state.openWaitlist);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(sectionRef.current.querySelectorAll("[data-waitlist-reveal]"),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true } }
    );
  }, { scope: sectionRef });

  return (
    <section id="waitlist" ref={sectionRef} aria-labelledby="waitlist-heading" className="waitlist-editorial">
      <div className="waitlist-editorial__content">
        <p data-waitlist-reveal className="waitlist-editorial__label">THE NEXT CHAPTER</p>
        <div data-waitlist-reveal className="waitlist-editorial__story">
          <h2 id="waitlist-heading" className="font-serif">Something personal.<br /><em>Worth waiting for.</em></h2>
          <div className="waitlist-editorial__stones" aria-label="Six natural stones: Citrine, Rose quartz, Amethyst, Tiger’s eye, Sunstone and Sodalite">
            {["overflow", "cherish", "hush", "ascent", "wildfire", "cadence"].map((stone) => (
              <span key={stone} className="waitlist-editorial__swatch"><Image src={`/images/dial-macro-${stone}.webp`} alt="" fill sizes="48px" /></span>
            ))}
          </div>
        </div>
        <div data-waitlist-reveal className="waitlist-editorial__action">
          <p className="waitlist-editorial__description">Be part of the Watch Inc launch.</p>
          <button type="button" onClick={() => openWaitlist()} className="waitlist-editorial__button">Join the Waitlist</button>
        </div>
      </div>
      <style jsx>{`
        .waitlist-editorial { background: #f3ece1; color: #38332d; border-top: 1px solid #ded3c3; padding: 76px max(24px, 5vw) 82px; scroll-margin-top: 80px; }
        .waitlist-editorial__content { max-width: 1440px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr; column-gap: 72px; align-items: end; }
        .waitlist-editorial__label { grid-column: 1 / -1; font-size: 10px; letter-spacing: .2em; color: #746a5d; margin: 0 0 26px; }
        h2 { font-size: clamp(42px, 4vw, 64px); font-weight: 400; letter-spacing: -.025em; line-height: 1.1; margin: 0; }
        h2 em { font-weight: 400; color: #88755d; }
        .waitlist-editorial__stones { display: flex; gap: 9px; margin-top: 28px; }
        .waitlist-editorial__swatch { position: relative; display: block; width: 46px; height: 32px; overflow: hidden; border-radius: 2px; }
        .waitlist-editorial__swatch :global(img) { object-fit: cover; }
        .waitlist-editorial__action { justify-self: end; width: 100%; max-width: 320px; padding-bottom: 4px; }
        .waitlist-editorial__description { font-size: 14px; line-height: 1.7; color: #665e54; margin: 0 0 24px; }
        .waitlist-editorial__button { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 52px; padding: 14px 20px; border: 1px solid #38332d; background: #38332d; color: #f3ece1; font-family: inherit; font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: .15em; cursor: pointer; transition: background-color .25s ease, color .25s ease; }
        .waitlist-editorial__button:focus-visible { outline: 2px solid #746a5d; outline-offset: 5px; }
        @media (hover: hover) { .waitlist-editorial__button:hover { color: #38332d; background: transparent; } }
        @media (max-width: 767px) {
          .waitlist-editorial { padding: 52px 24px 56px; scroll-margin-top: 64px; }
          .waitlist-editorial__content { grid-template-columns: 1fr; gap: 0; }
          .waitlist-editorial__label { font-size: 9px; margin-bottom: 24px; }
          h2 { font-size: clamp(38px, 9vw, 52px); }
          .waitlist-editorial__action { justify-self: stretch; max-width: none; margin-top: 32px; padding: 0; }
          .waitlist-editorial__description { font-size: 13px; margin-bottom: 18px; }
        }
        @media (prefers-reduced-motion: reduce) { .waitlist-editorial__button { transition: none; } }
      `}</style>
    </section>
  );
}
