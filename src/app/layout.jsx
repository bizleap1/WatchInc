import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import GrainOverlay from "@/components/ui/GrainOverlay";

export const metadata = {
  metadataBase: new URL("https://brand-timepieces.example"),
  title: "Watch Inc — Numbered Natural Stone Dial Timepieces",
  description: "Six stones. Six intentions. Six limited editions cut from raw natural crystalline matrix. Numbered, limited haute horlogerie.",
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
export default function RootLayout({ children, }) {
  return (<html lang="en" className="dark">
    <head>
      {/* First hero scene: needed the moment the page paints (shown behind the intro) */}
      <link rel="preload" as="image" href="/images/hero/scenes/overflow.webp" fetchPriority="high" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Jost:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
    </head>
    <body className="font-sans bg-[#0A0A0B] text-[#F3EFE7] antialiased selection:bg-[#F3EFE7] selection:text-[#0A0A0B] relative min-h-screen">
      {/* 1. Subtle Animated Film-Grain Overlay across whole experience */}
      <GrainOverlay />

      {/* 2. Smooth Scroll Provider (Lenis + GSAP ScrollTrigger ticker sync) */}
      <SmoothScrollProvider>
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </SmoothScrollProvider>
    </body>
  </html>);
}