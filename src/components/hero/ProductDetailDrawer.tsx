"use client";

import React, { useState } from "react";
import {
  Heart,
  Share2,
  SlidersHorizontal,
  FileText,
  Sparkles,
  Shield,
  Package,
  Check,
  ChevronDown,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import type { HeroSlide } from "./heroSlides";

interface ProductDetailDrawerProps {
  slide: HeroSlide;
  drawerRef: React.RefObject<HTMLDivElement>;
  isOpen: boolean;
}

export default function ProductDetailDrawer({
  slide,
  drawerRef,
  isOpen,
}: ProductDetailDrawerProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const openWaitlist = useStore((s) => s.openWaitlist);

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/watch/${slide.id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const detailItems = [
    {
      id: "technical",
      label: "Technical details",
      icon: SlidersHorizontal,
      body: `${slide.detailSpecs.caseSize}. ${slide.detailSpecs.dialMaterial}. ${slide.detailSpecs.numbering}.`,
    },
    {
      id: "ritual",
      label: "The ritual record",
      icon: FileText,
      body: `Energized by {PRACTITIONER_NAME} on {DATE}. Accompanying linen card records the ritual performed before dispatch. We sell the ritual that was performed; nothing more is promised.`,
    },
    {
      id: "selenite",
      label: "Selenite resting plate",
      icon: Sparkles,
      body: "Selenite is traditionally used to cleanse other stones. Optional resting plate available to add when your allocation opens.",
    },
    {
      id: "care",
      label: "Care & warranty",
      icon: Shield,
      body: "Keep away from sharp impact and harsh chemicals. Care & warranty terms will be shared with confirmed allocation holders.",
    },
    {
      id: "shipping",
      label: "Shipping",
      icon: Package,
      body: "Each numbered timepiece ships directly after its recorded ritual is completed.",
    },
  ];

  return (
    <aside
      ref={drawerRef}
      aria-label={`${slide.titleLine1} product details`}
      aria-hidden={!isOpen}
      className={`fixed md:absolute z-30 bg-white text-[#111111] font-hero-inter overflow-y-auto overscroll-contain
        bottom-0 left-0 right-0 h-[54%] md:top-0 md:bottom-0 md:left-auto md:right-0 md:h-full md:w-[35vw]
        translate-y-full md:translate-y-0 md:translate-x-full shadow-2xl ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
    >
      <div className="h-full flex flex-col justify-between px-6 py-7 md:px-9 lg:px-11 md:py-10">
        <div>
          {/* Title + 40MM */}
          <div data-detail-stagger className="mb-2">
            <h2 className="font-hero-expanded text-[#111111] text-[26px] md:text-[32px] leading-[0.94]">
              {slide.titleLine1}
              <br />
              {slide.titleLine2}
            </h2>
            <p className="font-hero-expanded text-[#111111] text-[15px] md:text-[18px] mt-1.5">
              {slide.size}
            </p>
          </div>

          {/* DIAL NO. 0147 · CITRINE */}
          <p
            data-detail-stagger
            className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#888888] mb-6"
          >
            DIAL NO. {slide.sampleDialNo} &middot; {slide.stoneLabel}
          </p>

          {/* Two half-width outline buttons: Add to wishlist | Share */}
          <div data-detail-stagger className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => setWishlisted((v) => !v)}
              data-cursor="LINK"
              className={`h-[40px] border text-[11px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                wishlisted
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#111111]/20 text-[#111111] hover:border-[#111111]"
              }`}
            >
              <Heart
                size={13}
                strokeWidth={1.5}
                className={wishlisted ? "fill-white" : ""}
              />
              <span>{wishlisted ? "Saved" : "Add to wishlist"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              data-cursor="LINK"
              className="h-[40px] border border-[#111111]/20 hover:border-[#111111] text-[#111111] text-[11px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} strokeWidth={1.5} /> : <Share2 size={13} strokeWidth={1.5} />}
              <span>{copied ? "Link copied" : "Share"}</span>
            </button>
          </div>

          {/* JOIN THE WAITLIST + Price on right */}
          <div
            data-detail-stagger
            className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-black/10"
          >
            <button
              type="button"
              onClick={() => openWaitlist(slide.id)}
              data-cursor="LINK"
              className="flex-1 h-[44px] border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors duration-200 text-[10px] font-medium uppercase tracking-[0.14em] cursor-pointer"
            >
              JOIN THE WAITLIST
            </button>

            <div className="text-right shrink-0">
              <div className="text-[16px] font-semibold text-[#111111] leading-tight">
                ₹ &mdash;
              </div>
              <div className="text-[10px] text-[#888888] leading-tight mt-0.5">
                incl. taxes
              </div>
            </div>
          </div>

          {/* Icon list (12px, 16px row gap) */}
          <ul data-detail-stagger className="flex flex-col gap-[16px]">
            {detailItems.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedRow === item.id;
              return (
                <li key={item.id} className="border-b border-black/[0.06] pb-3 last:border-b-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                    data-cursor="LINK"
                    className="w-full flex items-center justify-between text-left group cursor-pointer"
                  >
                    <span className="flex items-center gap-3 text-[12px] font-medium text-[#111111] group-hover:opacity-70 transition-opacity">
                      <Icon size={15} strokeWidth={1.35} className="text-[#111111]/75 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    <ChevronDown
                      size={13}
                      strokeWidth={1.4}
                      className={`text-[#888888] transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <p className="mt-2.5 pl-[27px] font-serif text-[15px] leading-[1.55] text-[#444444]">
                      {item.body}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Subtle copy-compliant footer line */}
        <p
          data-detail-stagger
          className="mt-6 pt-4 border-t border-black/10 font-serif italic text-[14px] leading-relaxed text-[#555555]"
        >
          {slide.bodyCopy}
        </p>
      </div>
    </aside>
  );
}
