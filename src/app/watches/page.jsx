"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/layout/Navbar";
import HeroSlider from "@/components/hero/HeroSlider";
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

export default function WatchesPage() {
    const inspectedPiece = useStore((s) => s.inspectedPiece);
    const setInspectedPiece = useStore((s) => s.setInspectedPiece);

    useEffect(() => {
        if (typeof window === "undefined")
            return;
        const refreshTriggers = () => {
            ScrollTrigger.refresh();
        };
        window.addEventListener("load", refreshTriggers);
        if (document.fonts) {
            document.fonts.ready.then(refreshTriggers);
        }
        const timer = window.setTimeout(() => {
            ScrollTrigger.refresh();
        }, 400);
        return () => {
            window.removeEventListener("load", refreshTriggers);
            window.clearTimeout(timer);
        };
    }, []);

    return (
        <>
            <Navbar />

            <main className="w-full relative overflow-x-clip bg-[#0A0A0B]">
                {/* Six-Watch Showcase */}
                <HeroSlider isReady />
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
