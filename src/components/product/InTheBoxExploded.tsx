"use client";

import React from "react";
import Image from "next/image";
import { WatchPiece } from "@/data/collection";
import { SITE_CONFIG, getPractitionerName } from "@/data/site-config";

interface InTheBoxProps {
  product: WatchPiece;
  hasSelenite?: boolean;
}

export default function InTheBoxExploded({
  product,
  hasSelenite = true,
}: InTheBoxProps) {
  const items = [
    {
      index: "01",
      title: `THE ${product.name.toUpperCase()} TIMEPIECE`,
      detail: `40MM brushed stainless steel case with a natural ${product.stone.toLowerCase()} dial, numbered ${SITE_CONFIG.sampleDialNo}.`,
    },
    {
      index: "02",
      title: "THE RITUAL CARD",
      detail: getPractitionerName()
        ? `Blind-embossed cotton card bearing the dial number, ${getPractitionerName()}, and the ritual date.`
        : "Blind-embossed cotton card bearing the dial number and dated ritual record.",
    },
    {
      index: "03",
      title: hasSelenite ? "SELENITE RESTING PLATE (INCLUDED)" : "OPTIONAL SELENITE PLATE",
      detail: "Raw white satin-spar slab cut for the overnight resting ritual.",
    },
    {
      index: "04",
      title: "MATTE PRESENTATION BOX",
      detail: "Archival black presentation enclosure with tailored watch cushion and care cloth.",
    },
  ];

  return (
    <section
      aria-label="In The Box Presentation"
      className="relative w-full py-20 px-6 sm:px-[4vw] bg-[#0A0A0B] text-white border-t border-white/[0.12]"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex items-center gap-6">
          <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-white/60 shrink-0">
            IN THE BOX
          </span>
          <div className="h-[1px] flex-1 bg-white/[0.12]" />
          <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-white/60 shrink-0">
            {SITE_CONFIG.brandName}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 relative aspect-[16/10] bg-[#0F0F11] border border-white/[0.12] overflow-hidden">
            <Image
              src={SITE_CONFIG.images.presentationBox}
              alt="Presentation box containing watch, ritual card, and selenite plate"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-5 divide-y divide-white/[0.12] border-y border-white/[0.12]">
            {items.map((item) => (
              <div key={item.index} className="py-5 space-y-1.5">
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-[10px] tracking-[0.16em]"
                    style={{ color: product.colors.accent }}
                  >
                    {item.index}
                  </span>
                  <h3 className="font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-[#F3EFE7]">
                    {item.title}
                  </h3>
                </div>
                <p className="font-sans text-[16px] text-[#F3EFE7]/65 leading-[1.6] pl-7">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
