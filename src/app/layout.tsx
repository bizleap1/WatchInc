import type { Metadata } from "next";
import {
  Archivo,
  Unbounded,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import GrainOverlay from "@/components/ui/GrainOverlay";

const fontArchivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const fontUnbounded = Unbounded({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-unbounded",
  display: "swap",
});

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={`${fontArchivo.variable} ${fontUnbounded.variable} ${fontInter.variable} ${fontMono.variable} dark`}
    >
      <head />
      <body className={`${fontArchivo.variable} ${fontUnbounded.variable} ${fontInter.variable} ${fontMono.variable} font-sans bg-[#0A0A0B] text-white antialiased selection:bg-[#E3A93A] selection:text-[#0A0A0B] relative min-h-screen`}>
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
