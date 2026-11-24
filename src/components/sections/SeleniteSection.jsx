"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function SeleniteSection() {
  const sectionRef = useRef(null);
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(sectionRef.current.querySelectorAll("[data-reveal]"), {
      opacity: 0, y: 16, duration: 0.8, stagger: 0.1, ease: "power2.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
    });
  }, { scope: sectionRef });

  return (
    <section id="selenite" ref={sectionRef} aria-labelledby="selenite-heading" className="selenite-editorial">
      <div className="selenite-editorial__visual">
        <Image src="/images/selenite-wildfire-editorial.webp" alt="Wildfire's orange sunstone dial and silver metal bracelet resting on a white selenite plate" fill sizes="100vw" quality={90} className="selenite-editorial__image" />
      </div>
      <div className="selenite-editorial__copy">
        <p data-reveal className="selenite-editorial__label">THE SELENITE RITUAL</p>
        <h2 data-reveal id="selenite-heading" className="font-serif">A place to<br />pause.</h2>
        <p data-reveal className="selenite-editorial__description">A quiet ritual between wears.</p>
      </div>
      <p data-reveal className="selenite-editorial__note">Selenite resting plate · Optional at checkout</p>
      <style jsx>{`
        .selenite-editorial { position: relative; width: 100%; height: max(540px, calc(100svh - 80px)); color: #38332d; background: #f0e5d5; overflow: hidden; isolation: isolate; scroll-margin-top: 80px; }
        .selenite-editorial__visual { position: absolute; inset: 0; z-index: -1; }
        .selenite-editorial__visual :global(.selenite-editorial__image) { object-fit: cover; object-position: center; }
        .selenite-editorial__copy { position: absolute; top: 24%; left: 5%; width: 30%; }
        .selenite-editorial__label { font-size: 12px; font-weight: 400; color: #746a5d; letter-spacing: .2em; margin: 0 0 32px; }
        h2 { font-size: clamp(52px, 5vw, 72px); font-weight: 400; line-height: 1.02; letter-spacing: -.035em; margin: 0; }
        .selenite-editorial__description { font-size: clamp(16px, 1.25vw, 18px); font-weight: 400; color: #665e54; line-height: 1.7; margin: 22px 0 0; }
        .selenite-editorial__note { position: absolute; left: 5%; bottom: 6%; max-width: 30%; margin: 0; font-size: 12px; font-weight: 400; color: #746a5d; line-height: 1.6; }
        @media (max-width: 767px) {
          .selenite-editorial { height: auto; display: flex; flex-direction: column; scroll-margin-top: 64px; }
          .selenite-editorial__visual { position: relative; inset: auto; z-index: 0; width: 100%; aspect-ratio: 1; }
          .selenite-editorial__visual :global(.selenite-editorial__image) { object-position: right center; }
          .selenite-editorial__copy { position: relative; top: auto; left: auto; width: auto; padding: 32px 24px 0; }
          .selenite-editorial__label { font-size: 10px; margin-bottom: 18px; }
          h2 { font-size: clamp(38px, 10vw, 48px); }
          .selenite-editorial__description { font-size: 14px; margin-top: 18px; }
          .selenite-editorial__note { position: relative; left: auto; bottom: auto; max-width: none; padding: 26px 24px 36px; font-size: 11px; }
        }
      `}</style>
    </section>
  );
}
