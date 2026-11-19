"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { X, Check } from "lucide-react";
const WATCH_OPTIONS = [
    { id: "overflow", name: "Overflow", stone: "Citrine", color: "#B58E4A" },
    { id: "cherish", name: "Cherish", stone: "Rose Quartz", color: "#B88B90" },
    { id: "hush", name: "Hush", stone: "Amethyst", color: "#8C7BA8" },
    { id: "ascent", name: "Ascent", stone: "Tiger's Eye", color: "#A3794B" },
    { id: "wildfire", name: "Wildfire", stone: "Sunstone", color: "#BF7352" },
    { id: "cadence", name: "Cadence", stone: "Sodalite", color: "#5F7AA8" },
];
export default function PrelaunchWaitlistModal({ initialStone, }) {
    const isWaitlistOpen = useStore((s) => s.isWaitlistOpen);
    const closeWaitlist = useStore((s) => s.closeWaitlist);
    const waitlistPreselect = useStore((s) => s.waitlistPreselect);
    const { lenis } = useSmoothScroll();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [preferredWatch, setPreferredWatch] = useState("");
    const [restingPlateInterest, setRestingPlateInterest] = useState("yes");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const modalRef = useRef(null);
    // Sync preferred watch from trigger (Discover panel or section CTA)
    useEffect(() => {
        if (isWaitlistOpen) {
            const target = waitlistPreselect || initialStone;
            if (target && WATCH_OPTIONS.some((w) => w.id === target)) {
                setPreferredWatch(target);
            }
        }
    }, [isWaitlistOpen, waitlistPreselect, initialStone]);
    const handleClose = useCallback(() => {
        closeWaitlist();
        setTimeout(() => {
            setIsSuccess(false);
            setErrorMessage(null);
        }, 300);
    }, [closeWaitlist]);
    // Lock body scroll and handle Escape key while modal is open
    useEffect(() => {
        if (!isWaitlistOpen)
            return;
        document.body.style.overflow = "hidden";
        lenis?.stop();
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                handleClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
            lenis?.start();
        };
    }, [isWaitlistOpen, lenis, handleClose]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: trimmedEmail,
                    preferredWatch: preferredWatch || null,
                    stones: preferredWatch && preferredWatch !== "undecided"
                        ? [preferredWatch]
                        : [],
                    restingPlateInterest,
                    consent: true,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 409 || data.duplicate) {
                    setErrorMessage(data.error ||
                        "This email is already on the waitlist. We’ll email you when the collection opens.");
                }
                else {
                    setErrorMessage(data.error || "Unable to join the waitlist. Please try again.");
                }
                return;
            }
            // Compute label for the success screen recap
            let preferredWatchLabel = "Not specified";
            if (preferredWatch === "undecided") {
                preferredWatchLabel = "Not sure yet";
            }
            else if (preferredWatch) {
                const found = WATCH_OPTIONS.find((w) => w.id === preferredWatch);
                if (found)
                    preferredWatchLabel = `${found.name} · ${found.stone}`;
            }
            setSubmittedData({
                preferredWatchLabel,
                restingPlateInterest: restingPlateInterest === "yes"
                    ? "Yes"
                    : restingPlateInterest === "maybe"
                        ? "Maybe"
                        : "No",
            });
            setIsSuccess(true);
        }
        catch {
            setErrorMessage("A network error occurred. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<AnimatePresence>
      {isWaitlistOpen && (<div data-lenis-prevent="true" data-lenis-prevent-wheel="true" data-lenis-prevent-touch="true" className="fixed inset-0 z-[99995] flex items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true" aria-labelledby="waitlist-modal-title">
          {/* Outside Click Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={handleClose} aria-hidden="true" className="fixed inset-0 bg-black/85 backdrop-blur-sm"/>

          {/* Modal Container: Full-screen scrollable on mobile, centred compact modal on desktop */}
          <motion.div ref={modalRef} data-lenis-prevent="true" data-lenis-prevent-wheel="true" data-lenis-prevent-touch="true" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 w-full h-full md:h-auto md:max-h-[88vh] md:max-w-[520px] bg-[#0A0A0B] text-[#F3EFE7] border-0 md:border md:border-[#F3EFE7]/[0.12] overflow-y-auto overscroll-contain modal-scrollbar p-6 pb-12 sm:p-8 md:p-9 shadow-2xl flex flex-col justify-between">
            {/* Close Button */}
            <button type="button" onClick={handleClose} aria-label="Close waitlist dialog" className="absolute top-5 right-5 p-2 text-[#F3EFE7]/60 hover:text-[#F3EFE7] border border-[#F3EFE7]/[0.15] hover:border-[#F3EFE7]/40 transition-colors cursor-pointer">
              <X size={16} strokeWidth={1.5}/>
            </button>

            {!isSuccess ? (<form onSubmit={handleSubmit} className="space-y-6 pt-2">
                {/* Header */}
                <div className="pr-10 space-y-1.5">
                  <h2 id="waitlist-modal-title" className="font-serif font-medium uppercase text-[#F3EFE7] text-[clamp(26px,3vw,32px)] leading-[1.05] tracking-[0.03em]">
                    Join the First Release
                  </h2>
                  <p className="font-sans text-[15px] sm:text-[16px] text-[#F3EFE7]/70 leading-[1.5]">
                    Leave your details for launch updates and availability.
                  </p>
                </div>

                {/* Name & Email */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#F3EFE7]/60">
                      Name
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-[#121214] border border-[#F3EFE7]/[0.14] px-3.5 py-2.5 text-[15px] font-sans text-[#F3EFE7] placeholder-[#F3EFE7]/30 focus:outline-none focus:border-[#F3EFE7]/60 transition-colors"/>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#F3EFE7]/60">
                      Email *
                    </label>
                    <input type="email" required value={email} onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage)
                        setErrorMessage(null);
                }} placeholder="you@domain.com" className="w-full bg-[#121214] border border-[#F3EFE7]/[0.14] px-3.5 py-2.5 text-[15px] font-sans text-[#F3EFE7] placeholder-[#F3EFE7]/30 focus:outline-none focus:border-[#F3EFE7]/60 transition-colors"/>
                  </div>
                </div>

                {/* Preferred Watch (Optional: Six watches + Help me choose) */}
                <div className="space-y-2">
                  <label className="block font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#F3EFE7]/60">
                    Preferred Watch (Optional)
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {WATCH_OPTIONS.map((watch) => {
                    const isSelected = preferredWatch === watch.id;
                    return (<button key={watch.id} type="button" onClick={() => setPreferredWatch(isSelected ? "" : watch.id)} aria-pressed={isSelected} className={`p-2.5 border text-left transition-colors cursor-pointer flex items-center gap-2 ${isSelected
                            ? "bg-[#F3EFE7]/[0.1] border-[#F3EFE7] text-[#F3EFE7]"
                            : "bg-transparent border-[#F3EFE7]/[0.12] hover:border-[#F3EFE7]/35 text-[#F3EFE7]/70"}`}>
                          <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: watch.color }}/>
                          <div className="min-w-0">
                            <span className="block font-sans text-[12px] font-medium uppercase tracking-[0.08em] truncate">
                              {watch.name}
                            </span>
                            <span className="block font-sans text-[10px] text-[#F3EFE7]/50 tracking-[0.06em] truncate">
                              {watch.stone}
                            </span>
                          </div>
                          {isSelected && (<Check size={12} strokeWidth={2} className="ml-auto text-[#F3EFE7] shrink-0"/>)}
                        </button>);
                })}
                  </div>

                  <button type="button" onClick={() => setPreferredWatch(preferredWatch === "undecided" ? "" : "undecided")} aria-pressed={preferredWatch === "undecided"} className={`w-full p-2.5 border text-left transition-colors cursor-pointer flex items-center justify-between ${preferredWatch === "undecided"
                    ? "bg-[#F3EFE7]/[0.1] border-[#F3EFE7] text-[#F3EFE7]"
                    : "bg-transparent border-[#F3EFE7]/[0.12] hover:border-[#F3EFE7]/35 text-[#F3EFE7]/70"}`}>
                    <span className="block font-sans text-[12px] font-medium uppercase tracking-[0.08em]">
                      Not sure yet
                    </span>
                    {preferredWatch === "undecided" && (<Check size={12} strokeWidth={2} className="text-[#F3EFE7] shrink-0"/>)}
                  </button>
                </div>

                {/* Selenite Interest: Yes · Maybe · No */}
                <div className="space-y-2 pt-1 border-t border-[#F3EFE7]/[0.1]">
                  <p className="font-sans text-[14px] text-[#F3EFE7] leading-snug">
                    Would you add an optional selenite resting plate?
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {["yes", "maybe", "no"].map((choice) => {
                    const isSelected = restingPlateInterest === choice;
                    return (<button key={choice} type="button" onClick={() => setRestingPlateInterest(choice)} aria-pressed={isSelected} className={`py-2 px-3 border text-center font-sans text-[12px] uppercase tracking-[0.14em] transition-colors cursor-pointer ${isSelected
                            ? "bg-[#F3EFE7] text-[#0A0A0B] font-medium border-[#F3EFE7]"
                            : "bg-transparent border-[#F3EFE7]/[0.15] text-[#F3EFE7]/70 hover:border-[#F3EFE7]/40 hover:text-[#F3EFE7]"}`}>
                          {choice === "yes"
                            ? "Yes"
                            : choice === "maybe"
                                ? "Maybe"
                                : "No"}
                        </button>);
                })}
                  </div>

                  <p className="font-sans text-[12px] text-[#F3EFE7]/50 leading-relaxed">
                    Traditionally used to cleanse other stones. Price to be announced.
                  </p>
                </div>

                {/* Inline Error Message */}
                {errorMessage && (<div role="alert" className="p-3 border border-red-500/40 bg-red-500/10 text-red-300 text-[13px] font-sans leading-relaxed">
                    {errorMessage}
                  </div>)}

                {/* CTA */}
                <div className="pt-2">
                  <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-[#F3EFE7] text-[#0A0A0B] hover:bg-[#F3EFE7]/90 font-sans text-[12px] font-medium uppercase tracking-[0.14em] transition-colors cursor-pointer disabled:opacity-50">
                    {isSubmitting ? "Joining..." : "Join the Waitlist"}
                  </button>
                </div>
              </form>) : (
            /* Success State: Replaces Form Completely */
            <div className="space-y-6 py-6 my-auto">
                <div className="space-y-2">
                  <h3 className="font-serif font-medium uppercase text-[#F3EFE7] text-[clamp(28px,3.2vw,36px)] leading-[1.05] tracking-[0.03em]">
                    You’re on the list.
                  </h3>
                  <p className="font-sans text-[16px] text-[#F3EFE7]/75 leading-[1.6]">
                    We’ll email you when the collection opens.
                  </p>
                </div>

                {/* Clear summary without any claim of reservation or allocation */}
                <div className="py-4 border-y border-[#F3EFE7]/[0.12] space-y-2.5 font-sans text-[13px] text-[#F3EFE7]/80">
                  {submittedData?.preferredWatchLabel && (<div className="flex justify-between items-center">
                      <span className="text-[#F3EFE7]/50 uppercase tracking-[0.1em] text-[11px]">
                        Preferred Edition
                      </span>
                      <span className="font-medium text-[#F3EFE7]">
                        {submittedData.preferredWatchLabel}
                      </span>
                    </div>)}
                  <div className="flex justify-between items-center">
                    <span className="text-[#F3EFE7]/50 uppercase tracking-[0.1em] text-[11px]">
                      Selenite Resting Plate
                    </span>
                    <span className="font-medium text-[#F3EFE7]">
                      {submittedData?.restingPlateInterest}
                    </span>
                  </div>
                </div>

                <button type="button" onClick={handleClose} className="w-full py-3.5 bg-[#F3EFE7] text-[#0A0A0B] font-sans text-[12px] font-medium uppercase tracking-[0.14em] hover:bg-[#F3EFE7]/90 transition-colors cursor-pointer">
                  Close
                </button>
              </div>)}
          </motion.div>
        </div>)}
    </AnimatePresence>);
}
