"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EntranceLoader from "@/components/entrance/EntranceLoader";
import Navbar from "@/components/layout/Navbar";
import HeroSlider from "@/components/hero/HeroSlider";
import SeleniteSection from "@/components/sections/SeleniteSection";
import WornSection from "@/components/sections/WornSection";
import FooterSection from "@/components/sections/FooterSection";
import { useStore } from "@/store/useStore";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ProductModal = dynamic(() => import("@/components/product/ProductModal"), {
  ssr: false,
});
const PrelaunchWaitlistModal = dynamic(
  () => import("@/components/forms/PrelaunchWaitlistModal"),
  { ssr: false }
);
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), {
  ssr: false,
});

export default function HomePage() {
  const [loaderComplete, setLoaderComplete] = useState(false);
  const inspectedPiece = useStore((s) => s.inspectedPiece);
  const setInspectedPiece = useStore((s) => s.setInspectedPiece);

  const refreshTriggers = useCallback(() => {
    if (typeof window === "undefined") return;
    ScrollTrigger.refresh();
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setLoaderComplete(true);
    if (typeof window !== "undefined") {
      setTimeout(refreshTriggers, 120);
      if (document.fonts) {
        document.fonts.ready.then(refreshTriggers);
      }
    }
  }, [refreshTriggers]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLoad = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("load", handleLoad);

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
    }, 500);

    return () => {
      window.removeEventListener("load", handleLoad);
      window.clearTimeout(timer);
      imgs.forEach((img) => {
        img.removeEventListener("load", onImgSettled);
        img.removeEventListener("error", onImgSettled);
      });
    };
  }, [loaderComplete]);

  return (
    <>
      <EntranceLoader onComplete={handleLoaderComplete} />
      <Navbar />

      <main className="w-full relative overflow-x-clip bg-[#0A0A0B]">
        {/* Approved Hero Slider */}
        <HeroSlider isReady={loaderComplete} />

        {/* Selenite Section */}
        <SeleniteSection />

        {/* Worn Editorial Section */}
        <WornSection />
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
