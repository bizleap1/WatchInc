"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { collection, WatchPiece } from "@/data/collection";
import { SITE_CONFIG, getPractitionerName, getEnergizedClause } from "@/data/site-config";
import { useStore } from "@/store/useStore";
import ProductLightbox from "@/components/product/ProductLightbox";
import InTheBoxExploded from "@/components/product/InTheBoxExploded";
import CartDrawer from "@/components/cart/CartDrawer";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/sections/FooterSection";
import PrelaunchWaitlistModal from "@/components/forms/PrelaunchWaitlistModal";
import { ChevronDown, Check, ArrowRight, Maximize2 } from "lucide-react";

interface WatchDetailClientProps {
  product: WatchPiece;
}

export default function WatchDetailClient({ product }: WatchDetailClientProps) {
  const setActiveWorld = useStore((s) => s.setActiveWorld);
  const addToCart = useStore((s) => s.addToCart);
  const openCart = useStore((s) => s.openCart);
  const openWaitlist = useStore((s) => s.openWaitlist);
  const isPrelaunch = process.env.NEXT_PUBLIC_PRELAUNCH === "true";

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedStrap, setSelectedStrap] = useState("Black Leather");
  const [addSelenite, setAddSelenite] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");

  const otherPieces = collection.filter((item) => item.id !== product.id);

  useEffect(() => {
    setActiveWorld(product.id);
  }, [product.id, setActiveWorld]);

  const galleryViews = [
    {
      src: product.images.front,
      label: "Studio Front View",
      contain: true,
    },
    {
      src: product.images.moody,
      label: "Three-Quarter Moody",
      contain: true,
    },
    {
      src: product.images.dialMacro,
      label: "Natural Stone Macro",
      contain: false,
    },
  ];

  const handleAddToCart = () => {
    addToCart({
      pieceId: product.id,
      name: product.name,
      stone: product.stone,
      price: 0,
      size: "40MM",
      strap: selectedStrap,
      addSelenite,
      selenitePrice: 0,
      dialNo: SITE_CONFIG.sampleDialNo,
    });
    openCart();
  };

  return (
    <>
      <Navbar />

      <main className="w-full min-h-screen bg-[#0A0A0B] text-[#F3EFE7] pt-28 pb-16">
        {/* Top Breadcrumb */}
        <div className="px-6 sm:px-[4vw] mb-10">
          <div className="max-w-7xl mx-auto flex items-center gap-3 font-sans text-[10px] uppercase tracking-[0.14em] text-white/50">
            <Link href="/" className="hover:text-white transition-colors">
              WATCHES
            </Link>
            <span>/</span>
            <span style={{ color: product.colors.accent }}>{product.name}</span>
            <span>/</span>
            <span>{product.stone}</span>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="px-6 sm:px-[4vw]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div
                className="relative w-full aspect-square bg-[#0F0F11] border border-white/[0.12] overflow-hidden group cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
              >
                {/* Flat Stone Colour Strip on Right Edge */}
                <div
                  className="absolute top-0 right-0 bottom-0 w-3 z-10"
                  style={{ backgroundColor: product.colors.accent }}
                />

                <Image
                  src={galleryViews[activeGalleryIndex].src}
                  alt={`${product.name} ${product.stone} — ${galleryViews[activeGalleryIndex].label}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className={
                    galleryViews[activeGalleryIndex].contain
                      ? "object-contain p-8 transition-transform duration-700 group-hover:scale-[1.03]"
                      : "object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  }
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="absolute bottom-5 right-7 z-20 flex items-center gap-2 px-3.5 py-2 bg-[#0A0A0B]/90 border border-white/[0.2] font-mono text-[10px] uppercase tracking-[0.14em] text-white hover:border-white transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>EXPAND</span>
                </button>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-3 gap-3">
                {galleryViews.map((view, idx) => (
                  <button
                    key={view.label}
                    type="button"
                    onClick={() => setActiveGalleryIndex(idx)}
                    className={`flex items-center gap-3 p-3 border text-left transition-colors cursor-pointer ${activeGalleryIndex === idx
                        ? "border-white bg-white/[0.04]"
                        : "border-white/[0.12] hover:border-white/30"
                      }`}
                    style={
                      activeGalleryIndex === idx
                        ? { borderColor: product.colors.accent }
                        : undefined
                    }
                  >
                    <div className="relative w-12 h-12 bg-[#111113] border border-white/[0.1] shrink-0 overflow-hidden">
                      <Image
                        src={view.src}
                        alt={view.label}
                        fill
                        sizes="48px"
                        className={view.contain ? "object-contain p-1" : "object-cover"}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-mono text-[10px] text-white/45">
                        0{idx + 1}
                      </span>
                      <span className="block font-sans text-[11px] text-white/85 truncate">
                        {view.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Sticky Dossier */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-7">
              <div className="space-y-3 border-b border-white/[0.12] pb-6">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 inline-block"
                    style={{ backgroundColor: product.colors.accent }}
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.13em] text-[#F3EFE7]/65">
                    {product.stone.toUpperCase()} DIAL · 40MM
                  </span>
                </div>

                <h1 className="font-serif font-medium uppercase text-[clamp(42px,4.5vw,64px)] text-[#F3EFE7] tracking-[0.04em] leading-[0.98]">
                  {product.name}
                </h1>

                <p className="font-sans text-[16px] md:text-[17px] text-[#F3EFE7]/82 leading-[1.6]">
                  {product.intention}
                </p>

                <div className="pt-2 flex items-baseline gap-4">
                  <span className="font-mono text-xl text-[#F3EFE7]">
                    {SITE_CONFIG.watchPrice}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#F3EFE7]/50">
                    {SITE_CONFIG.editionLabel}
                  </span>
                </div>
              </div>

              {/* Numbering Note */}
              <div className="p-4 border border-[#F3EFE7]/[0.12] space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.13em]">
                  <span className="text-[#F3EFE7]/55">DIAL NUMBERING</span>
                  <span style={{ color: product.colors.accent }}>
                    0001 — 0300
                  </span>
                </div>
                <p className="font-sans text-[15px] text-[#F3EFE7]/65 leading-[1.6]">
                  Each natural {product.stone.toLowerCase()} dial is individually cut, numbered, and {getEnergizedClause()}.
                </p>
              </div>

              {/* Strap Selector */}
              <div className="space-y-2.5">
                <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#F3EFE7]/55">
                  STRAP
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {["Black Leather", "Brushed Steel"].map((strap) => {
                    const isSelected = selectedStrap === strap;
                    return (
                      <button
                        key={strap}
                        type="button"
                        onClick={() => setSelectedStrap(strap)}
                        className={`py-3 px-4 border font-mono text-[11px] uppercase tracking-[0.12em] transition-colors cursor-pointer ${isSelected
                            ? "bg-[#F3EFE7] text-[#0A0A0B] border-[#F3EFE7] font-medium"
                            : "border-[#F3EFE7]/[0.15] text-[#F3EFE7]/70 hover:border-[#F3EFE7]/40"
                          }`}
                      >
                        {strap}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selenite Add-on */}
              <button
                type="button"
                onClick={() => setAddSelenite(!addSelenite)}
                className={`w-full p-4 border text-left transition-colors cursor-pointer flex items-center justify-between gap-4 ${addSelenite
                    ? "border-white bg-white/[0.06]"
                    : "border-white/[0.12] hover:border-white/30"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 border flex items-center justify-center shrink-0 ${addSelenite
                        ? "bg-white border-white text-[#0A0A0B]"
                        : "border-white/30"
                      }`}
                  >
                    {addSelenite && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </span>
                  <div>
                    <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-white">
                      ADD SELENITE RESTING PLATE
                    </span>
                    <span className="block font-sans text-[12px] text-white/45">
                      Raw white selenite slab for overnight resting.
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-white/55 shrink-0">
                  {SITE_CONFIG.selenitePlatePrice}
                </span>
              </button>

              {/* Primary CTA */}
              <div className="space-y-3 pt-1">
                {isPrelaunch ? (
                  <button
                    type="button"
                    onClick={() => openWaitlist(product.id)}
                    className="w-full py-4 px-6 text-[#0A0A0B] font-sans text-[12px] font-medium uppercase tracking-[0.14em] flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: product.colors.accent }}
                  >
                    <span>JOIN WAITLIST · {product.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-4 px-6 text-[#0A0A0B] font-sans text-[12px] font-medium uppercase tracking-[0.14em] flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: product.colors.accent }}
                  >
                    <span>RESERVE ALLOCATION · {product.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <p className="font-sans text-[13px] text-[#F3EFE7]/55 leading-relaxed">
                  {SITE_CONFIG.disclaimer}
                </p>
              </div>

              {/* Accordions */}
              <div className="border-t border-white/[0.12] divide-y divide-white/[0.12]">
                {[
                  {
                    id: "details",
                    title: "STONE & DIAL",
                    content: `${product.mineralDetails.veiningDescription}. Cut as a natural ${product.mineralDetails.mineralogy} slab inside a 40mm brushed stainless steel case with domed sapphire crystal.`,
                  },
                  {
                    id: "ritual",
                    title: "THE RITUAL",
                    content: getPractitionerName()
                      ? `Before dispatch, each watch is energized by ${getPractitionerName()} and accompanied by a numbered cotton card bearing the dial number and ritual date.`
                      : "Before dispatch, each watch is energized as a ritual and accompanied by a numbered cotton card bearing the dial number and ritual date.",
                  },
                  {
                    id: "box",
                    title: "IN THE BOX",
                    content:
                      "Matte black presentation box, numbered timepiece, blind-embossed ritual card, and optional selenite resting plate.",
                  },
                ].map((item) => {
                  const isOpen = openAccordion === item.id;
                  return (
                    <div key={item.id} className="py-4">
                      <button
                        type="button"
                        onClick={() => setOpenAccordion(isOpen ? null : item.id)}
                        className="w-full flex items-center justify-between text-left font-sans text-[10px] uppercase tracking-[0.16em] text-white cursor-pointer"
                      >
                        <span>{item.title}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-white/50 transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : ""
                            }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            className="overflow-hidden"
                          >
                            <p className="font-sans text-[16px] text-[#F3EFE7]/68 leading-[1.6] pt-3">
                              {item.content}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* In The Box Section */}
        <div className="mt-20">
          <InTheBoxExploded product={product} hasSelenite={addSelenite} />
        </div>

        {/* Technical Specifications */}
        <section className="px-6 sm:px-[4vw] py-20 border-t border-white/[0.12]">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex items-center gap-6">
              <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-white/60 shrink-0">
                SPECIFICATIONS
              </span>
              <div className="h-[1px] flex-1 bg-white/[0.12]" />
              <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-white/60 shrink-0">
                40MM CASE
              </span>
            </div>

            <div className="divide-y divide-[#F3EFE7]/[0.12] border-y border-[#F3EFE7]/[0.12] font-sans text-[15px]">
              {[
                ["CASE", "40mm Brushed 316L Stainless Steel · Thin Polished Bevel"],
                ["CRYSTAL", "Domed Sapphire Crystal with Anti-Reflective Coating"],
                ["DIAL", `Natural ${product.mineralDetails.mineralogy} Slab · Applied Steel Baton Indices`],
                ["HANDS", "Slim Polished Steel Baton Hour, Minute, and Seconds"],
                ["STRAP", "Black Textured Leather with Fine Tonal Stitching"],
                ["EDITION", `${SITE_CONFIG.editionLabel} · Dial No. 0001 — 0300`],
                ["RITUAL RECORD", getPractitionerName() ? `Signed by ${getPractitionerName()} · Numbered Cotton Card` : "Accompanying Numbered & Dated Cotton Card"],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.13em] text-[#F3EFE7]/50">
                    {label}
                  </span>
                  <span className="text-[#F3EFE7]/88 sm:text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Other Five */}
        <section className="px-6 sm:px-[4vw] py-20 border-t border-white/[0.12]">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <h2 className="font-serif font-medium text-3xl sm:text-5xl text-[#F3EFE7] uppercase tracking-[0.04em]">
                THE OTHER FIVE
              </h2>
              <Link
                href="/"
                className="font-sans text-[10px] uppercase tracking-[0.16em] text-white/60 hover:text-white transition-colors"
              >
                RETURN TO SLIDER &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-l border-white/[0.12]">
              {otherPieces.map((other) => (
                <Link
                  key={other.id}
                  href={`/watch/${other.id}`}
                  className="group p-5 border-r border-b border-white/[0.12] hover:bg-white/[0.03] transition-colors flex flex-col justify-between space-y-5"
                >
                  <div className="relative w-full aspect-square bg-[#0F0F11] overflow-hidden">
                    <Image
                      src={other.images.dialMacro}
                      alt={`${other.name} ${other.stone}`}
                      fill
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-1">
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.16em] block"
                      style={{ color: other.colors.accent }}
                    >
                      {other.stone}
                    </span>
                    <h3 className="font-serif font-medium text-2xl text-[#F3EFE7] uppercase tracking-[0.04em]">
                      {other.name}
                    </h3>
                    <p className="font-sans text-[11px] text-white/50 line-clamp-1">
                      {other.intention}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <ProductLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        product={product}
        initialIndex={activeGalleryIndex}
      />

      <PrelaunchWaitlistModal initialStone={product.id} />
      <CartDrawer />
      <FooterSection />
    </>
  );
}
