"use client";
import React from "react";

/**
 * Subtle film grain over the whole site.
 * No mix-blend-mode here on purpose: a fixed, full-screen blend layer makes Chrome read back
 * everything underneath it on the GPU, and on some machines it painted the wrong textures
 * (stone dial close-ups) behind the hero intro. Plain low opacity looks almost the same.
 */
export default function GrainOverlay() {
    return (<div aria-hidden="true" className="fixed inset-0 w-screen h-screen pointer-events-none z-[9990] opacity-[0.035] select-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "160px 160px",
    }} />);
}