"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, StoneId } from "@/data/collection";
import { SITE_CONFIG, getEnergizedClause } from "@/data/site-config";
import { useStore } from "@/store/useStore";
import { X, Check, ArrowRight } from "lucide-react";

interface PrelaunchWaitlistModalProps {
  initialStone?: StoneId | null;
}

export default function PrelaunchWaitlistModal({
  initialStone,
}: PrelaunchWaitlistModalProps) {
  const isWaitlistOpen = useStore((s) => s.isWaitlistOpen);
  const closeWaitlist = useStore((s) => s.closeWaitlist);
  const waitlistPreselect = useStore((s) => s.waitlistPreselect);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedStones, setSelectedStones] = useState<string[]>([]);
  const [restingPlateInterest, setRestingPlateInterest] = useState<
    "yes" | "no" | "maybe"
  >("yes");
  const [consent, setConsent] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedRecord, setConfirmedRecord] = useState<{
    id: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    const target = waitlistPreselect || initialStone;
    if (target) {
      setSelectedStones((prev) =>
        prev.includes(target) ? prev : [...prev, target]
      );
    }
  }, [waitlistPreselect, initialStone, isWaitlistOpen]);

  useEffect(() => {
    if (!isWaitlistOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWaitlist();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWaitlistOpen, closeWaitlist]);

  const toggleStone = (id: string) => {
    setSelectedStones((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const activeAccent =
    collection.find((c) => c.id === selectedStones[0])?.colors.accent ||
    "#E3A93A";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (selectedStones.length === 0) {
      setErrorMessage("Please select at least one stone edition.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          stones: selectedStones,
          preferredWatch: selectedStones[0],
          restingPlateInterest,
          consent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Unable to register on the waitlist. Please try again."
        );
      }

      setIsSuccess(true);
      setConfirmedRecord({
        id: data.id || "REC-" + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "A network error occurred. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeWaitlist();
    setTimeout(() => {
      setIsSuccess(false);
      setErrorMessage(null);
    }, 350);
  };

  return (
    <AnimatePresence>
      {isWaitlistOpen && (
        <div
          className="fixed inset-0 z-[99995] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Join the Waitlist"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#0A0A0B] border border-white/[0.12] my-8 text-white z-10 max-h-[92vh] overflow-y-auto"
          >
            {/* Flat stone accent top stripe */}
            <div
              className="h-[3px] w-full transition-colors duration-300"
              style={{ backgroundColor: activeAccent }}
            />

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close waitlist dialog"
              className="absolute top-5 right-5 w-9 h-9 border border-white/[0.2] hover:border-white text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 sm:p-10">
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* Header */}
                  <div className="space-y-3 pr-10">
                    <span className="font-mono text-[11px] tracking-[0.13em] text-[#F3EFE7]/58 uppercase block">
                      {SITE_CONFIG.editionLabel} · DIAL NO. 0001 — 0300
                    </span>
                    <h2 className="font-serif font-medium text-[clamp(30px,3.2vw,42px)] leading-[1.0] tracking-[0.03em] text-[#F3EFE7] uppercase">
                      JOIN THE WAITLIST
                    </h2>
                    <p className="font-sans text-[16px] text-[#F3EFE7]/70 leading-[1.6]">
                      Each dial is cut from natural stone, numbered sequentially, and {getEnergizedClause()}.
                    </p>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#F3EFE7]/62">
                        YOUR NAME
                      </label>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent border-b border-[#F3EFE7]/[0.2] py-2.5 text-[16px] text-[#F3EFE7] placeholder-[#F3EFE7]/35 focus:outline-none focus:border-[#F3EFE7] transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#F3EFE7]/62">
                        EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-[#F3EFE7]/[0.2] py-2.5 text-[16px] text-[#F3EFE7] placeholder-[#F3EFE7]/35 focus:outline-none focus:border-[#F3EFE7] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Stone Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#F3EFE7]/62">
                        SELECT STONE EDITION *
                      </label>
                      <span className="font-mono text-[11px] text-[#F3EFE7]/45">
                        {selectedStones.length} / 6 SELECTED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {collection.map((item) => {
                        const isSelected = selectedStones.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleStone(item.id)}
                            className={`flex items-center gap-2.5 p-3 border text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#F3EFE7]/[0.08] border-[#F3EFE7] text-[#F3EFE7]"
                                : "bg-transparent border-[#F3EFE7]/[0.12] hover:border-[#F3EFE7]/35 text-[#F3EFE7]/70"
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ backgroundColor: item.colors.accent }}
                            />
                            <div className="min-w-0">
                              <span className="block font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#F3EFE7] truncate">
                                {item.name}
                              </span>
                              <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-[#F3EFE7]/50 truncate">
                                {item.stone}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 ml-auto text-[#F3EFE7] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selenite Resting Plate */}
                  <div className="p-4 border border-[#F3EFE7]/[0.12] space-y-3">
                    <div>
                      <p className="font-sans text-[16px] text-[#F3EFE7]">
                        Add a selenite resting plate?
                      </p>
                      <p className="font-mono text-[11px] text-[#F3EFE7]/52 tracking-[0.11em] uppercase mt-1">
                        RAW WHITE SELENITE SLAB · {SITE_CONFIG.selenitePlatePrice}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                      {(["yes", "no", "maybe"] as const).map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setRestingPlateInterest(choice)}
                          className={`py-2.5 px-3 border text-center uppercase tracking-[0.13em] transition-colors cursor-pointer ${
                            restingPlateInterest === choice
                              ? "bg-[#F3EFE7] text-[#0A0A0B] font-medium border-[#F3EFE7]"
                              : "bg-transparent border-[#F3EFE7]/[0.15] text-[#F3EFE7]/65 hover:border-[#F3EFE7]/40"
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Consent */}
                  <label className="flex items-start gap-3 cursor-pointer text-[14px] text-[#F3EFE7]/60 select-none leading-[1.5]">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 accent-[#F3EFE7] cursor-pointer"
                    />
                    <span>
                      Receive private release notification when dials from this edition are ready.
                    </span>
                  </label>

                  {errorMessage && (
                    <div className="p-3 border border-red-500/40 bg-red-500/10 text-red-300 text-sm font-sans">
                      {errorMessage}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-[#F3EFE7]/[0.12] flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-3 border border-[#F3EFE7]/[0.15] text-[12px] font-sans font-medium uppercase tracking-[0.13em] text-[#F3EFE7]/65 hover:text-[#F3EFE7] hover:border-[#F3EFE7]/40 transition-colors cursor-pointer"
                    >
                      CANCEL
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group inline-flex items-center gap-3 font-sans text-[12px] font-medium uppercase tracking-[0.13em] text-[#F3EFE7] disabled:opacity-50 cursor-pointer"
                    >
                      <span>{isSubmitting ? "RECORDING..." : "SUBMIT REQUEST"}</span>
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[#0A0A0B] transition-transform group-hover:translate-x-0.5"
                        style={{ backgroundColor: activeAccent }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="border border-[#F3EFE7]/[0.15] p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between border-b border-[#F3EFE7]/[0.12] pb-4 font-mono text-[11px] uppercase tracking-[0.13em] text-[#F3EFE7]/60">
                      <span>{SITE_CONFIG.brandName} · WAITLIST RECORD</span>
                      <span>{confirmedRecord?.id}</span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif font-medium text-3xl text-[#F3EFE7] uppercase tracking-[0.03em]">
                        YOU ARE ON THE LIST.
                      </h3>
                      <p className="font-sans text-[16px] text-[#F3EFE7]/65">
                        Dial number pending release assignment.
                      </p>
                    </div>

                    <div className="py-4 border-y border-[#F3EFE7]/[0.12] space-y-2 font-mono text-[12px] text-[#F3EFE7]/78">
                      <div className="flex justify-between">
                        <span className="text-[#F3EFE7]/45">EDITION:</span>
                        <span>
                          {selectedStones.map((s) => s.toUpperCase()).join(" · ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#F3EFE7]/45">SELENITE PLATE:</span>
                        <span className="uppercase">{restingPlateInterest}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#F3EFE7]/45">RECORD DATE:</span>
                        <span>{confirmedRecord?.date}</span>
                      </div>
                    </div>

                    <p className="font-sans text-[14px] text-[#F3EFE7]/55 leading-relaxed">
                      {SITE_CONFIG.disclaimer}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-3.5 bg-[#F3EFE7] text-[#0A0A0B] font-sans text-[12px] font-medium uppercase tracking-[0.14em] hover:bg-[#F3EFE7]/90 transition-colors cursor-pointer"
                  >
                    RETURN TO SITE
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
