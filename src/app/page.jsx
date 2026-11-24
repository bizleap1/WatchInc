"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/layout/Navbar";
import ArchitecturalHero from "@/components/hero/ArchitecturalHero";
import PickStoneSection from "@/components/sections/PickStoneSection";
import RitualSection from "@/components/sections/RitualSection";
import DialVariationSection from "@/components/sections/DialVariationSection";
import SeleniteSection from "@/components/sections/SeleniteSection";
import WaitlistSection from "@/components/sections/WaitlistSection";
import FooterSection from "@/components/sections/FooterSection";
import { useStore } from "@/store/useStore";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ProductModal = dynamic(() => import("@/components/product/ProductModal"), {
  ssr: false,
});
const PrelaunchWaitlistModal = dynamic(() => import("@/components/forms/PrelaunchWaitlistModal"), {
  ssr: false,
});
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), {
  ssr: false,
});

export default function HomePage() {
  const inspectedPiece = useStore((s) => s.inspectedPiece);
  const setInspectedPiece = useStore((s) => s.setInspectedPiece);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const refreshTriggers = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", refreshTriggers);
    if (document.fonts) {
      document.fonts.ready.then(refreshTriggers);
    }
    const imgs = Array.from(document.querySelectorAll("img"));
    let pending = 0;
    const onImgSettled = () => {
      pending -= 1;
      if (pending <= 0) {
        ScrollTrigger.refresh();
      }
    };
    imgs.forEach((img) => {
      if (!img.complete) {
        pending += 1;
        img.addEventListener("load", onImgSettled, { once: true });
        img.addEventListener("error", onImgSettled, { once: true });
      }
    });
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);
    return () => {
      window.removeEventListener("load", refreshTriggers);
      window.clearTimeout(timer);
      imgs.forEach((img) => {
        img.removeEventListener("load", onImgSettled);
        img.removeEventListener("error", onImgSettled);
      });
    };
  }, []);

  return (
    <>
      <Navbar />

      <main className="w-full relative overflow-x-clip bg-[#0A0A0B]">
        {/* Full-Viewport Cinematic Architectural Hero (Unchanged) */}
        <ArchitecturalHero />

        {/* 1. Pick your stone (lecrec-style stone picker) */}
        <PickStoneSection />

        {/* 2. The Energizing Ritual (Contrasting Dark) */}
        <RitualSection />

        {/* 3. Every Dial Is Different (Warm Ivory / Light) */}
        <DialVariationSection />

        {/* 4. The Selenite Ritual (Warm Ivory / Light) */}
        <SeleniteSection />

        {/* 5. Join the Waitlist (Dark transition) */}
        <WaitlistSection />
      </main>

      {/* Footer */}
      <FooterSection />

      {/* Interactive Overlays */}
      <ProductModal
        product={inspectedPiece}
        isOpen={Boolean(inspectedPiece)}
        onClose={() => setInspectedPiece(null)}
      />
      <PrelaunchWaitlistModal />
      <CartDrawer />
    </>
  );
}