import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import GrainOverlay from "@/components/ui/GrainOverlay";

const fontCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
  display: "swap",
});

const fontJost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brand-timepieces.example"),
  title: "Watch Inc — Numbered Natural Stone Dial Timepieces",
  description:
    "Six stones. Six intentions. Six limited editions cut from raw natural crystalline matrix. Numbered, limited haute horlogerie.",
  keywords: [
    "natural stone watch",
    "citrine watch",
    "rose quartz timepiece",
    "amethyst watch",
    "tigers eye watch",
    "sunstone watch",
    "sodalite watch",
    "limited edition horlogerie",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontCormorant.variable} ${fontJost.variable} dark`}
    >
      <head />
      <body className={`${fontCormorant.variable} ${fontJost.variable} font-sans bg-[#0A0A0B] text-[#F3EFE7] antialiased selection:bg-[#F3EFE7] selection:text-[#0A0A0B] relative min-h-screen`}>
        {/* 1. Subtle Animated Film-Grain Overlay across whole experience */}
        <GrainOverlay />

        {/* 2. Smooth Scroll Provider (Lenis + GSAP ScrollTrigger ticker sync) */}
        <SmoothScrollProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
