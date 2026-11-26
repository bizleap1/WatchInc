"use client";
import React, { useState } from "react";
import { Heart, Share2, SlidersHorizontal, FileText, Sparkles, Shield, Package, Check, ChevronDown, } from "lucide-react";
import { useStore } from "@/store/useStore";
import { getPractitionerName } from "@/data/site-config";
export default function ProductDetailDrawer({ slide, drawerRef, isOpen, }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const openWaitlist = useStore((s) => s.openWaitlist);
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/watches?open=${slide.id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
    catch {
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
      body: getPractitionerName()
        ? `Energized as a ritual by ${getPractitionerName()} before dispatch. Accompanying linen card records the ritual performed. We sell the ritual that was performed; nothing more is promised.`
        : "Energized as a ritual before dispatch. Accompanying linen card records the ritual performed. We sell the ritual that was performed; nothing more is promised.",
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
  return (<aside ref={drawerRef} aria-label={`${slide.titleLine1} product details`} aria-hidden={!isOpen} className={`absolute z-30 bg-white text-[#111111] font-hero-inter overflow-y-auto overscroll-contain
        bottom-0 left-0 right-0 h-[54%] md:top-0 md:bottom-0 md:left-auto md:right-0 md:h-full md:w-[35vw]
        translate-y-full md:translate-y-0 md:translate-x-full shadow-2xl ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
    <div className="h-full flex flex-col justify-between px-6 py-7 md:px-9 lg:px-11 md:py-10">
      <div>
        {/* Title (Cormorant Garamond 500) + Dial & Compact 38MM (Jost) */}
        <div data-detail-stagger className="mb-2">
          <h2 className="font-serif font-medium uppercase text-[#111111] text-[clamp(32px,2.8vw,42px)] leading-[0.98] tracking-[0.04em]">
            {slide.titleLine1}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-sans font-normal text-[13px] uppercase tracking-[0.13em] text-[#444444]">
              {slide.titleLine2}
            </span>
            <span aria-hidden="true" className="text-[#999999] text-[11px]">&middot;</span>
            <span className="font-sans font-medium tabular-nums text-[12px] uppercase tracking-[0.11em] text-[#666666]">
              {slide.size}
            </span>
          </div>
        </div>

        {/* DIAL NO. 0147 · CITRINE */}
        <p data-detail-stagger className="font-sans text-[11px] font-medium tabular-nums uppercase tracking-[0.13em] text-[#777777] mb-6">
          DIAL NO. {slide.sampleDialNo} &middot; {slide.stoneLabel}
        </p>

        {/* Two half-width outline buttons: Add to wishlist | Share */}
        <div data-detail-stagger className="grid grid-cols-2 gap-3 mb-5">
          <button type="button" onClick={() => setWishlisted((v) => !v)} data-cursor="LINK" className={`h-[42px] border text-[13px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${wishlisted
            ? "border-[#111111] bg-[#111111] text-white"
            : "border-[#111111]/20 text-[#111111] hover:border-[#111111]"}`}>
            <Heart size={13} strokeWidth={1.5} className={wishlisted ? "fill-white" : ""} />
            <span>{wishlisted ? "Saved" : "Add to wishlist"}</span>
          </button>

          <button type="button" onClick={handleShare} data-cursor="LINK" className="h-[42px] border border-[#111111]/20 hover:border-[#111111] text-[#111111] text-[13px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer">
            {copied ? <Check size={13} strokeWidth={1.5} /> : <Share2 size={13} strokeWidth={1.5} />}
            <span>{copied ? "Link copied" : "Share"}</span>
          </button>
        </div>

        {/* JOIN THE WAITLIST CTA */}
        <div data-detail-stagger className="pb-6 mb-6 border-b border-black/10">
          <button type="button" onClick={() => openWaitlist(slide.id)} data-cursor="LINK" className="w-full h-[44px] border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors duration-200 text-[12px] font-medium uppercase tracking-[0.13em] cursor-pointer">
            JOIN THE WAITLIST
          </button>
        </div>

        {/* Icon list */}
        <ul data-detail-stagger className="flex flex-col gap-[16px]">
          {detailItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedRow === item.id;
            return (<li key={item.id} className="border-b border-black/[0.06] pb-3 last:border-b-0 last:pb-0">
              <button type="button" onClick={() => setExpandedRow(isExpanded ? null : item.id)} data-cursor="LINK" className="w-full flex items-center justify-between text-left group cursor-pointer">
                <span className="flex items-center gap-3 font-sans text-[14px] font-medium text-[#111111] group-hover:opacity-70 transition-opacity">
                  <Icon size={15} strokeWidth={1.35} className="text-[#111111]/75 shrink-0" />
                  <span>{item.label}</span>
                </span>
                <ChevronDown size={13} strokeWidth={1.4} className={`text-[#888888] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
              </button>
              {isExpanded && (<p className="mt-2.5 pl-[27px] font-sans text-[16px] leading-[1.6] text-[#444444]">
                {item.body}
              </p>)}
            </li>);
          })}
        </ul>
      </div>

      {/* Subtle copy-compliant footer line */}
      <p data-detail-stagger className="mt-6 pt-4 border-t border-black/10 font-sans text-[15px] leading-[1.6] text-[#555555]">
        {slide.bodyCopy}
      </p>
    </div>
  </aside>);
}