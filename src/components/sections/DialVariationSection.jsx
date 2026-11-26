"use client";

import { useState } from "react";
import Image from "next/image";

const STONES = [
  { id: "cadence", stone: "Sodalite", detail: "Deep blue crossed by white veins, a map no other dial shares." },
  { id: "overflow", stone: "Citrine", detail: "Citrine the colour of late sun, cut from real stone, so no two dials glow the same." },
  { id: "cherish", stone: "Rose quartz", detail: "Soft, milky rose quartz with clouds that no one can copy." },
  { id: "hush", stone: "Amethyst", detail: "Violet that pools and fades across the dial in a pattern only your watch has." },
  { id: "ascent", stone: "Tiger’s eye", detail: "Banded gold and brown that shifts with every turn of your wrist, and is different on every piece." },
  { id: "wildfire", stone: "Sunstone", detail: "Flecks of sunstone catch the light and throw it back orange, and they fell in different places on every dial." },
];

export default function DialVariationSection() {
  const [selected, setSelectedState] = useState("cadence");
  const [previous, setPrevious] = useState(null);
  const setSelected = (id) => {
    if (id === selected) return;
    setPrevious(selected);
    setSelectedState(id);
  };
  const active = STONES.find((stone) => stone.id === selected);

  return (
    <section aria-labelledby="dial-variation-heading" className="dial-variation bg-[#F3ECE1] text-[#28251f]">
      <div className="dial-variation__header w-full mx-auto px-6 md:px-[4vw] text-center">
        <p className="text-[10px] tracking-[0.19em] uppercase text-[#746a5d] mb-3">Formed by nature</p>
        <h2 id="dial-variation-heading" className="font-serif font-normal text-[clamp(32px,4.2vw,62px)] leading-[1.08]">Every dial is different.</h2>
        <p className="mt-3 mx-auto max-w-[1100px] text-[13px] md:text-[15px] leading-[1.6] text-[#6b6154]">Natural stone gives each watch its own pattern. Each dial carries an individual number.</p>
      </div>

      <div className="dial-variation__panel relative w-full overflow-hidden bg-[#242329]" role="img" aria-label={`Natural ${active.stone} texture close-up`}>
        {/* Only the selected stone (and the one fading out) is rendered. Keeping all six full-width
            stone close-ups in the page made Chrome flash them over the hero intro on page load. */}
        {STONES.filter((stone) => stone.id === selected || stone.id === previous).map((stone) => (
          <Image key={stone.id} src={`/images/dial-macro-${stone.id}.webp`} alt="" fill sizes="100vw" loading="lazy" aria-hidden="true" className={`object-cover transition-opacity duration-700 motion-reduce:transition-none ${selected === stone.id ? "opacity-100" : "opacity-0"}`} />
        ))}
      </div>

      <div className="dial-variation__footer w-full mx-auto px-6 md:px-[4vw]">
        <div role="group" aria-label="Choose a stone texture" className="flex md:justify-between gap-6 md:gap-5 overflow-x-auto py-3 md:py-4 border-b border-[#cfc4b5]">
          {STONES.map((stone) => (
            <button key={stone.id} type="button" aria-pressed={selected === stone.id} onClick={() => setSelected(stone.id)} className={`shrink-0 min-h-[44px] font-serif text-[18px] md:text-[23px] border-b transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#746a5d] ${selected === stone.id ? "border-[#28251f] text-[#28251f]" : "border-transparent text-[#756b5d] hover:text-[#28251f]"}`}>
              {stone.stone}
            </button>
          ))}
        </div>
        <div className="dial-variation__detail pt-4" aria-live="polite" aria-atomic="true">
          <p className="font-serif text-[18px] md:text-[23px] leading-[1.45] max-w-[850px]">{active.detail}</p>
        </div>
      </div>
      <style jsx>{`
        .dial-variation {
          scroll-margin-top: 64px;
          padding-bottom: 24px;
        }
        .dial-variation__header { padding-top: 16px; padding-bottom: 20px; }
        .dial-variation__panel { height: clamp(200px, 42vw, 360px); }
        .dial-variation__detail { min-height: 94px; }
        @media (min-width: 768px) and (min-height: 600px) {
          .dial-variation {
            height: calc(100svh - 80px);
            display: flex;
            flex-direction: column;
            padding-bottom: 0;
            scroll-margin-top: 80px;
          }
          .dial-variation__header {
            flex: 0 0 auto;
            padding-top: clamp(12px, 1.8svh, 22px);
            padding-bottom: clamp(12px, 1.8svh, 22px);
          }
          .dial-variation__panel { flex: 1 1 0; min-height: 0; height: auto; }
          .dial-variation__footer { flex: 0 0 auto; }
          .dial-variation__detail { height: 100px; min-height: 0; padding-bottom: 18px; }
        }
        @media (min-width: 768px) and (max-height: 599px) {
          .dial-variation { scroll-margin-top: 80px; }
        }
      `}</style>
    </section>
  );
}