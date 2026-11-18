"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { WatchPiece } from "@/data/collection";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  product: WatchPiece;
  initialIndex?: number;
}

export default function ProductLightbox({
  isOpen,
  onClose,
  product,
  initialIndex = 0,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  const galleryItems = [
    { src: product.images.front, label: "Studio Front View", contain: true },
    { src: product.images.moody, label: "Moody Three-Quarter View", contain: true },
    { src: product.images.dialMacro, label: "Natural Stone Dial Macro", contain: false },
  ];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  }, [galleryItems.length]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  }, [galleryItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen) return null;

  const currentItem = galleryItems[currentIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] bg-[#0A0A0B]/98 text-white flex flex-col justify-between p-6 sm:p-10 select-none">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between border-b border-white/[0.12] pb-4 z-20">
          <div className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 inline-block"
              style={{ backgroundColor: product.colors.accent }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">
              {product.name} · {product.stone}
            </span>
            <span className="text-white/25">/</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
              0{currentIndex + 1} / 0{galleryItems.length} · {currentItem.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="w-9 h-9 border border-white/[0.2] hover:border-white flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Toggle Zoom"
              aria-label="Toggle zoom magnification"
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 border border-white/[0.2] hover:border-white flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Close Lightbox (ESC)"
              aria-label="Close lightbox dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Active Viewport */}
        <div className="relative w-full h-[68vh] flex items-center justify-center overflow-hidden my-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: isZoomed ? 1.65 : 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              drag={isZoomed}
              dragConstraints={{ left: -260, right: 260, top: -180, bottom: 180 }}
              className="relative w-full max-w-2xl h-full flex items-center justify-center"
            >
              <Image
                src={currentItem.src}
                alt={currentItem.label}
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className={currentItem.contain ? "object-contain p-4" : "object-cover"}
              />
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/25 hover:border-white hover:bg-white hover:text-[#0A0A0B] text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/25 hover:border-white hover:bg-white hover:text-[#0A0A0B] text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Thumbnails Strip */}
        <div className="w-full flex items-center justify-center gap-3 z-20 pt-4 border-t border-white/[0.12]">
          {galleryItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIsZoomed(false);
                setCurrentIndex(idx);
              }}
              className={`relative w-16 h-16 border overflow-hidden transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "border-white opacity-100"
                  : "border-white/15 opacity-45 hover:opacity-80"
              }`}
              style={idx === currentIndex ? { borderColor: product.colors.accent } : undefined}
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                sizes="64px"
                className={item.contain ? "object-contain p-1 bg-[#111113]" : "object-cover"}
              />
            </button>
          ))}
        </div>
      </div>
    </AnimatePresence>
  );
}
