"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { WatchPiece } from "@/data/collection";
import { SITE_CONFIG, getEnergizedClause } from "@/data/site-config";
import { useStore } from "@/store/useStore";
import { ArrowRight, X } from "lucide-react";

interface ProductModalProps {
  product: WatchPiece | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
}: ProductModalProps) {
  const [activeView, setActiveView] = useState<"watch" | "macro">("watch");
  const openWaitlist = useStore((s) => s.openWaitlist);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!product) return null;

  const handleAction = () => {
    onClose();
    openWaitlist(product.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99990] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} details dialog`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl bg-[#0A0A0B] border border-white/[0.12] text-white overflow-hidden"
          >
            {/* Flat stone accent top bar */}
            <div className="h-[3px] w-full" style={{ backgroundColor: product.colors.accent }} />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute top-4 right-4 z-20 w-9 h-9 border border-white/[0.2] bg-[#0A0A0B] text-white/75 hover:text-white hover:border-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Visual Stage */}
              <div className="relative w-full aspect-[4/3] bg-[#0F0F11] border border-white/[0.12] overflow-hidden">
                <Image
                  src={activeView === "watch" ? product.images.front : product.images.dialMacro}
                  alt={`${product.name} ${product.stone}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 560px"
                  className={activeView === "watch" ? "object-contain p-4" : "object-cover"}
                />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 inline-block"
                    style={{ backgroundColor: product.colors.accent }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/80 bg-[#0A0A0B]/90 px-2 py-1 border border-white/[0.12]">
                    {product.stone}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 flex border border-white/[0.18] bg-[#0A0A0B]">
                  <button
                    type="button"
                    onClick={() => setActiveView("watch")}
                    className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                      activeView === "watch"
                        ? "bg-white text-[#0A0A0B]"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    WATCH
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("macro")}
                    className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                      activeView === "macro"
                        ? "bg-white text-[#0A0A0B]"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    MACRO
                  </button>
                </div>
              </div>

              {/* Copy */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif font-medium text-3xl sm:text-4xl text-[#F3EFE7] uppercase tracking-[0.03em]">
                    {product.name}
                  </h2>
                  <span className="font-mono text-sm text-[#F3EFE7]/65">
                    {SITE_CONFIG.watchPrice}
                  </span>
                </div>

                <p className="font-sans text-[16px] text-[#F3EFE7]/88">
                  {product.intention}
                </p>

                <p className="font-sans text-[16px] text-[#F3EFE7]/62 leading-[1.6]">
                  Cut from natural {product.stone.toLowerCase()}, numbered sequentially, and {getEnergizedClause()}.
                </p>

                <div className="pt-2 font-mono text-[11px] uppercase tracking-[0.13em] text-[#F3EFE7]/50">
                  DIAL NO. 0001 — 0300 · {SITE_CONFIG.editionLabel}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#F3EFE7]/[0.12] flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleAction}
                  className="px-6 py-3.5 text-[#0A0A0B] font-sans text-[12px] tracking-[0.13em] font-medium uppercase cursor-pointer transition-opacity hover:opacity-90"
                  style={{ backgroundColor: product.colors.accent }}
                >
                  JOIN WAITLIST · {product.stone.toUpperCase()}
                </button>

                <Link
                  href={`/watch/${product.id}`}
                  onClick={onClose}
                  className="group inline-flex items-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.13em] text-[#F3EFE7]/85 hover:text-[#F3EFE7]"
                >
                  <span>DISCOVER {product.name}</span>
                  <span className="w-9 h-9 rounded-full border border-[#F3EFE7]/30 flex items-center justify-center group-hover:bg-[#F3EFE7] group-hover:text-[#0A0A0B] transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
