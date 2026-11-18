"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { SITE_CONFIG } from "@/data/site-config";
import { X, Trash2, ArrowRight, Lock } from "lucide-react";

export default function CartDrawer() {
  const isCartOpen = useStore((s) => s.isCartOpen);
  const closeCart = useStore((s) => s.closeCart);
  const cartItems = useStore((s) => s.cartItems);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const toggleCartSelenite = useStore((s) => s.toggleCartSelenite);
  const openWaitlist = useStore((s) => s.openWaitlist);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + item.price + (item.addSelenite ? item.selenitePrice : 0);
  }, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/80 cursor-pointer"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Allocation Cart Drawer"
            className="relative z-10 w-full max-w-md sm:max-w-lg bg-[#0A0A0B] text-white h-full flex flex-col justify-between border-l border-white/[0.12] p-6 sm:p-8 overflow-y-auto"
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-5 border-b border-white/[0.12]">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                YOUR ALLOCATION ({cartItems.length})
              </h2>

              <button
                type="button"
                onClick={closeCart}
                className="w-9 h-9 border border-white/[0.2] flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors cursor-pointer"
                aria-label="Close Allocation Cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 py-6 overflow-y-auto space-y-5">
              {cartItems.length === 0 ? (
                <div className="h-full min-h-[320px] flex flex-col items-start justify-center space-y-6 px-2 my-auto">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                    00 ITEMS · {SITE_CONFIG.editionLabel}
                  </span>

                  <div className="space-y-2">
                    <p className="font-display text-2xl sm:text-3xl text-white uppercase">
                      NO PIECE SELECTED.
                    </p>
                    <p className="font-sans text-[13px] text-white/50 max-w-xs leading-relaxed">
                      Explore the debut six natural stone dial timepieces or join the waitlist for priority serial assignment.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href="/"
                      onClick={closeCart}
                      className="group inline-flex items-center gap-3 text-[10px] font-sans uppercase tracking-[0.16em] text-white"
                    >
                      <span>EXPLORE WATCHES</span>
                      <span className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-[#0A0A0B] transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        closeCart();
                        openWaitlist();
                      }}
                      className="px-4 py-2.5 border border-white/25 hover:border-white text-[10px] font-sans uppercase tracking-[0.16em] text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                      JOIN WAITLIST
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.12] border-y border-white/[0.12]">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-5 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-24 bg-[#111113] border border-white/[0.12] flex-shrink-0 overflow-hidden">
                          <Image
                            src={`/watches/${item.pieceId}/front.png`}
                            alt={`${item.name} ${item.stone}`}
                            fill
                            sizes="80px"
                            className="object-contain p-1.5"
                          />
                        </div>

                        <div className="flex-1 space-y-1 text-left">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-lg text-white uppercase leading-tight">
                              {item.name}
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-white/40 hover:text-white p-1 transition-colors cursor-pointer"
                              title="Remove Allocation"
                              aria-label="Remove Allocation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
                            {item.stone} · DIAL {item.dialNo} · {item.size}
                          </p>

                          <p className="font-sans text-[11px] text-white/45">
                            Strap: {item.strap}
                          </p>

                          <div className="pt-1 font-mono text-sm text-white">
                            {SITE_CONFIG.watchPrice}
                          </div>
                        </div>
                      </div>

                      {item.addSelenite && (
                        <div className="pt-3 border-t border-white/[0.1] flex items-center justify-between text-[11px] font-sans text-white/60">
                          <span>Selenite Resting Plate</span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-white">
                              INCLUDED
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCartSelenite(item.id)}
                              className="text-[10px] uppercase tracking-[0.14em] text-white/45 hover:text-white underline cursor-pointer"
                              aria-label="Remove Selenite resting plate add-on"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="pt-5 border-t border-white/[0.12] space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                    ALLOCATION TOTAL
                  </span>
                  <span className="font-mono text-lg text-white">
                    {subtotal > 0 ? `$${subtotal.toLocaleString()}` : SITE_CONFIG.watchPrice}
                  </span>
                </div>

                <p className="text-[11px] font-sans text-white/45">
                  Energized by {SITE_CONFIG.practitionerName} before dispatch. Numbered sequentially from 0001 — 0300.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    openWaitlist(cartItems[0]?.pieceId);
                  }}
                  className="w-full py-4 px-6 bg-white text-[#0A0A0B] hover:bg-white/90 font-sans text-[10px] tracking-[0.18em] font-medium uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>CONFIRM ALLOCATION REQUEST</span>
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
