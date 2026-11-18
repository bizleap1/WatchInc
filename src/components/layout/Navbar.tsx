"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { useStore } from "@/store/useStore";
import { ShoppingBag, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { id: "selenite", label: "SELENITE", href: "#selenite" },
  { id: "worn", label: "WORN", href: "#worn" },
];

export default function Navbar() {
  const [activeLink, setActiveLink] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollTo } = useSmoothScroll();
  const cartItems = useStore((s) => s.cartItems);
  const allocations = useStore((s) => s.allocations);
  const openCart = useStore((s) => s.openCart);
  const openWaitlist = useStore((s) => s.openWaitlist);

  const bagCount = cartItems.length || allocations.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLinkClick = (link: (typeof NAV_LINKS)[number]) => {
    setActiveLink(link.id);
    setMobileMenuOpen(false);
    scrollTo(link.href);
  };

  return (
    <>
      <header
        aria-label="Primary Navigation"
        className="fixed top-0 left-0 right-0 z-[40] h-[72px] bg-[#0A0A0B]/90 backdrop-blur-md border-b border-white/[0.08] font-sans"
      >
        {/* Subtle top hairline sheen */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none"
        />

        <div className="w-full h-full px-6 md:px-[4vw] flex items-center justify-between">
          {/* Left: Architectural Sans Wordmark */}
          <Link
            href="/"
            className="group flex items-center gap-3 text-white hover:opacity-85 transition-opacity duration-300"
          >
            <span className="font-sans font-medium text-[15px] tracking-[0.3em] uppercase leading-none">
              WATCH INC
            </span>
          </Link>

          {/* Centre: Architectural Luxury Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-9 lg:gap-12"
            aria-label="Main sections"
          >
            {NAV_LINKS.map((link) => {
              const isActive = activeLink === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleLinkClick(link)}
                  className={`group relative py-1 text-[10.5px] font-normal uppercase tracking-[0.2em] transition-colors duration-300 cursor-pointer ${
                    isActive ? "text-white" : "text-white/50 hover:text-white/95"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 -bottom-[5px] h-[1px] bg-white transition-transform duration-300 origin-center ${
                      isActive
                        ? "scale-x-100 opacity-95"
                        : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-40"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right: Refined Luxury Actions (Waitlist CTA + Minimal Bag) */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => openWaitlist()}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-white/[0.18] hover:border-white hover:bg-white hover:text-[#0A0A0B] text-white/90 text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer"
            >
              RESERVE
            </button>

            <button
              type="button"
              onClick={openCart}
              aria-label="Open bag"
              className="relative flex items-center gap-2 text-white/75 hover:text-white transition-colors duration-300 cursor-pointer p-1"
            >
              <ShoppingBag size={16} strokeWidth={1.3} />
              {bagCount > 0 && (
                <span className="font-mono text-[10px] text-white/80">
                  {bagCount}
                </span>
              )}
              <span
                aria-hidden="true"
                className={`absolute top-0.5 right-0 w-[4px] h-[4px] rounded-full ${
                  bagCount > 0 ? "bg-[#E3A93A]" : "bg-white/60"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="md:hidden text-white/80 hover:text-white transition-colors cursor-pointer p-1"
            >
              {mobileMenuOpen ? (
                <X size={18} strokeWidth={1.3} />
              ) : (
                <Menu size={18} strokeWidth={1.3} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-[39] bg-[#0A0A0B]/98 backdrop-blur-md md:hidden flex flex-col justify-center px-8 gap-7 font-sans">
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link)}
                className={`text-left text-[12px] uppercase tracking-[0.24em] py-2.5 border-b border-white/[0.08] ${
                  isActive ? "text-white font-medium" : "text-white/55"
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openWaitlist();
            }}
            className="mt-4 w-full py-3.5 border border-white/25 text-white text-[11px] uppercase tracking-[0.22em]"
          >
            RESERVE ALLOCATION
          </button>
        </div>
      )}
    </>
  );
}
