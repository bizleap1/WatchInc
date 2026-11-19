"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, Maximize2, ZoomIn, ZoomOut, RotateCw, Play, } from "lucide-react";
import { useStore } from "@/store/useStore";
import { HERO_SLIDES } from "./heroSlides";
import HeroSlideContent from "./HeroSlideContent";
import WatchArtwork from "./WatchArtwork";
import CircleActionButton from "./CircleActionButton";
import ProductDetailDrawer from "./ProductDetailDrawer";
import FilmOverlay from "./FilmOverlay";
if (typeof window !== "undefined") {
    gsap.registerPlugin(Flip, useGSAP);
}
const AUTO_SLIDE_INTERVAL_MS = 1500;
export default function HeroSlider({ isReady = true }) {
    // Ping-pong dual slots for both main slide & right front watch (zero DOM swap -> zero flicker!)
    const [slotSlides, setSlotSlides] = useState([0, 1]);
    const [activeSlot, setActiveSlot] = useState(0);
    const [isProductOpen, setIsProductOpen] = useState(false);
    const [isProductLayerActive, setIsProductLayerActive] = useState(false);
    const [filmState, setFilmState] = useState({ open: false, origin: { x: 0, y: 0 } });
    const isCartOpen = useStore((s) => s.isCartOpen);
    const isWaitlistOpen = useStore((s) => s.isWaitlistOpen);
    const inspectedPiece = useStore((s) => s.inspectedPiece);
    const hasOverlayOpen = isCartOpen || isWaitlistOpen || Boolean(inspectedPiece);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isExpandedView, setIsExpandedView] = useState(false);
    // Refs for animation targets & zero-re-render tracking
    const rootRef = useRef(null);
    const stageRef = useRef(null);
    const slot0Ref = useRef(null);
    const slot1Ref = useRef(null);
    const panelRef = useRef(null);
    const panelChevronRef = useRef(null);
    const frontBox0Ref = useRef(null);
    const frontInner0Ref = useRef(null);
    const frontBox1Ref = useRef(null);
    const frontInner1Ref = useRef(null);
    const curtainRef = useRef(null);
    const detailDrawerRef = useRef(null);
    const detailControlsRef = useRef(null);
    const activeSlotRef = useRef(0);
    const activeIndexRef = useRef(0);
    const isAnimatingRef = useRef(false);
    const isProductOpenRef = useRef(false);
    const isFilmOpenRef = useRef(false);
    const hasOverlayOpenRef = useRef(false);
    const isInViewRef = useRef(true);
    const isHoveredRef = useRef(false);
    const isFocusedRef = useRef(false);
    const slideTimelineRef = useRef(null);
    const pendingTransitionRef = useRef(null);
    const touchStartRef = useRef(null);
    const wheelLockRef = useRef(0);
    const rotationRef = useRef(0);
    const autoTimerRef = useRef(null);
    const activeIndex = slotSlides[activeSlot];
    const currentSlide = HERO_SLIDES[activeIndex];
    const nextPreloadSlide = HERO_SLIDES[(activeIndex + 1) % HERO_SLIDES.length];
    const prevPreloadSlide = HERO_SLIDES[(activeIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length];
    const isMobileViewport = () => typeof window !== "undefined" && window.innerWidth < 768;
    const prefersReducedMotion = () => typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const getSlotEl = (slot) => slot === 0 ? slot0Ref.current : slot1Ref.current;
    const getFrontBox = (slot) => slot === 0 ? frontBox0Ref.current : frontBox1Ref.current;
    const getFrontInner = (slot) => slot === 0 ? frontInner0Ref.current : frontInner1Ref.current;
    const { contextSafe } = useGSAP({ scope: rootRef });
    // Track film and overlay states in refs for zero-stale autoplay checks
    useEffect(() => {
        isFilmOpenRef.current = filmState.open;
    }, [filmState.open]);
    useEffect(() => {
        hasOverlayOpenRef.current = hasOverlayOpen;
    }, [hasOverlayOpen]);
    // =========================================================================
    // 1. INITIAL LOAD TIMELINE (~0.85s, Strict-Mode safe, restrained motion)
    // =========================================================================
    useGSAP(() => {
        if (!isReady)
            return;
        const activeEl = getSlotEl(activeSlotRef.current);
        if (!activeEl)
            return;
        const watchEl = activeEl.querySelectorAll("[data-hero-watch]");
        const titleLines = activeEl.querySelectorAll("[data-hero-title-line]");
        const infoItems = activeEl.querySelectorAll("[data-hero-info-item]");
        const panelEl = panelRef.current;
        const frontBoxEl = getFrontBox(activeSlotRef.current);
        const mobile = isMobileViewport();
        if (prefersReducedMotion()) {
            gsap.fromTo([activeEl, panelEl, frontBoxEl], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
            return;
        }
        const tl = gsap.timeline({
            onStart: () => {
                watchEl.forEach((el) => (el.style.willChange = "transform, opacity"));
                if (panelEl)
                    panelEl.style.willChange = "width, height";
                if (frontBoxEl)
                    frontBoxEl.style.willChange = "transform, opacity";
            },
            onComplete: () => {
                watchEl.forEach((el) => (el.style.willChange = "auto"));
                if (panelEl)
                    panelEl.style.willChange = "auto";
                if (frontBoxEl)
                    frontBoxEl.style.willChange = "auto";
            },
        });
        // Watch: restrained fade + subtle horizontal glide (no heavy blur)
        tl.fromTo(watchEl, { opacity: 0, scale: 1.02, x: mobile ? 0 : -20 }, {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: mobile ? 0.55 : 0.8,
            ease: "power3.out",
        }, 0);
        // Title lines: crisp y + opacity rise
        tl.fromTo(titleLines, { opacity: 0, y: 16 }, {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.45 : 0.65,
            stagger: 0.06,
            ease: "power3.out",
        }, 0.06);
        // Rest of info column
        tl.fromTo(infoItems, { opacity: 0, y: 10 }, {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.4 : 0.6,
            stagger: 0.04,
            ease: "power2.out",
        }, 0.18);
        // Right panel grows in smoothly (desktop only; mobile keeps full canvas without squeezed strip)
        if (panelEl && !mobile) {
            tl.fromTo(panelEl, { width: 0 }, { width: "14vw", duration: 0.95, ease: "expo.inOut" }, 0.15);
        }
        if (frontBoxEl && !mobile) {
            tl.fromTo(frontBoxEl, { x: 48, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: "expo.out" }, 0.35);
        }
    }, { dependencies: [isReady], scope: rootRef });
    // =========================================================================
    // 2. SLOW, ZERO-JITTER CURTAIN SLIDE TRANSITION (~1.85s, ping-pong slots)
    // =========================================================================
    const runSlideTransition = contextSafe((nextIndex, targetSlot, direction) => {
        const fromSlot = activeSlotRef.current;
        const oldEl = getSlotEl(fromSlot);
        const newEl = getSlotEl(targetSlot);
        const curtainEl = curtainRef.current;
        const panelEl = panelRef.current;
        const frontBoxEl = getFrontBox(fromSlot);
        const incomingFrontEl = getFrontBox(targetSlot);
        const stageEl = stageRef.current;
        if (!oldEl ||
            !newEl ||
            !curtainEl ||
            !panelEl ||
            !frontBoxEl ||
            !incomingFrontEl ||
            !stageEl) {
            activeSlotRef.current = targetSlot;
            activeIndexRef.current = nextIndex;
            setActiveSlot(targetSlot);
            isAnimatingRef.current = false;
            return;
        }
        if (slideTimelineRef.current) {
            slideTimelineRef.current.kill();
            slideTimelineRef.current = null;
        }
        const oldSlide = HERO_SLIDES[activeIndexRef.current];
        const nextSlide = HERO_SLIDES[nextIndex];
        const mobile = isMobileViewport();
        const oldWatchEls = oldEl.querySelectorAll("[data-hero-watch]");
        const oldTextEls = oldEl.querySelectorAll("[data-hero-title-line], [data-hero-info-item]");
        const newWatchEls = newEl.querySelectorAll("[data-hero-watch]");
        const newTitleLines = newEl.querySelectorAll("[data-hero-title-line]");
        const newInfoItems = newEl.querySelectorAll("[data-hero-info-item]");
        const finalizeTransition = () => {
            gsap.set([
                newEl,
                ...Array.from(newWatchEls),
                ...Array.from(newTitleLines),
                ...Array.from(newInfoItems),
            ], {
                clearProps: "transform,filter,clipPath,willChange",
                opacity: 1,
            });
            gsap.set(newEl, { zIndex: 16, visibility: "visible", opacity: 1 });
            gsap.set(oldEl, {
                visibility: "hidden",
                zIndex: 12,
                opacity: 1,
                clearProps: "transform,clipPath,willChange",
            });
            gsap.set([...Array.from(oldWatchEls), ...Array.from(oldTextEls)], {
                clearProps: "transform,filter,opacity,willChange",
            });
            gsap.set(incomingFrontEl, {
                visibility: "visible",
                zIndex: 15,
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                willChange: "auto",
            });
            gsap.set(frontBoxEl, {
                visibility: "hidden",
                zIndex: 13,
                opacity: 0,
                x: 0,
                y: 0,
                scale: 1,
                willChange: "auto",
            });
            gsap.set(curtainEl, {
                display: "none",
                clearProps: "transform,width,height,opacity,willChange",
            });
            gsap.set(panelEl, {
                backgroundColor: nextSlide.panelColor,
                willChange: "auto",
                ...(mobile ? { height: 0 } : { width: "14vw" }),
            });
            activeSlotRef.current = targetSlot;
            activeIndexRef.current = nextIndex;
            setActiveSlot(targetSlot);
            isAnimatingRef.current = false;
            slideTimelineRef.current = null;
        };
        // Reduced motion fallback: calm crossfade, zero curtain
        if (prefersReducedMotion()) {
            gsap.set(oldEl, { zIndex: 15, visibility: "visible", opacity: 1 });
            gsap.set(newEl, {
                zIndex: 16,
                visibility: "visible",
                opacity: 0,
                clipPath: "none",
            });
            gsap.set(incomingFrontEl, {
                visibility: "visible",
                opacity: 0,
                x: 0,
                y: 0,
                zIndex: 15,
            });
            const tl = gsap.timeline({
                onComplete: finalizeTransition,
                onInterrupt: () => {
                    isAnimatingRef.current = false;
                },
            });
            slideTimelineRef.current = tl;
            tl.to([oldEl, frontBoxEl], { opacity: 0, duration: 0.4, ease: "power2.out" }, 0);
            tl.to(panelEl, { backgroundColor: nextSlide.panelColor, duration: 0.4 }, 0);
            tl.to([newEl, incomingFrontEl], { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.08);
            return;
        }
        // Mobile: simpler, lighter directional crossfade (desktop retains full 1.55s coloured strip transition)
        if (mobile) {
            gsap.set(oldEl, { zIndex: 15, visibility: "visible", opacity: 1, x: 0 });
            gsap.set(newEl, {
                zIndex: 16,
                visibility: "visible",
                opacity: 0,
                x: direction * 20,
                clipPath: "none",
            });
            gsap.set(panelEl, { height: 0, backgroundColor: nextSlide.panelColor });
            oldEl.style.willChange = "transform, opacity";
            newEl.style.willChange = "transform, opacity";
            const tl = gsap.timeline({
                onComplete: finalizeTransition,
                onInterrupt: () => {
                    isAnimatingRef.current = false;
                },
            });
            slideTimelineRef.current = tl;
            tl.to(oldEl, { opacity: 0, x: direction * -16, duration: 0.24, ease: "power2.inOut" }, 0);
            tl.to(newEl, { opacity: 1, x: 0, duration: 0.38, ease: "power3.out" }, 0.1);
            return;
        }
        const stageRect = stageEl.getBoundingClientRect();
        // Layer ordering: old stays on top (16) while masked away; new sits cleanly behind (15)
        gsap.set(oldEl, { zIndex: 16, visibility: "visible", opacity: 1 });
        gsap.set(newEl, {
            zIndex: 15,
            visibility: "visible",
            opacity: 1,
            clipPath: mobile
                ? direction === 1
                    ? "inset(100% 0 0 0)"
                    : "inset(0 0 100% 0)"
                : direction === 1
                    ? "inset(0 0 0 100%)"
                    : "inset(0 100% 0 0)",
        });
        gsap.set(newWatchEls, { filter: "blur(10px)", opacity: 0.72, scale: 1.03 });
        gsap.set(newTitleLines, { opacity: 0, y: 20 });
        gsap.set(newInfoItems, { opacity: 0, y: 10 });
        gsap.set(incomingFrontEl, {
            visibility: "visible",
            zIndex: 15,
            opacity: 0,
            x: mobile ? 0 : 56,
            y: mobile ? 36 : 0,
        });
        oldEl.style.willChange = "clip-path";
        newEl.style.willChange = "clip-path";
        curtainEl.style.willChange = "transform, width, height";
        panelEl.style.willChange = "width, height";
        frontBoxEl.style.willChange = "transform, opacity";
        incomingFrontEl.style.willChange = "transform, opacity";
        // Prepare curtain with outgoing slide's stone colour
        gsap.set(curtainEl, {
            display: "block",
            backgroundColor: oldSlide.panelColor,
            opacity: 1,
        });
        const sweepDuration = 1.55;
        const proxy = { p: 0 };
        const tl = gsap.timeline({
            onComplete: finalizeTransition,
            onInterrupt: () => {
                isAnimatingRef.current = false;
            },
        });
        slideTimelineRef.current = tl;
        // Gently retract old front watch as curtain launches
        tl.to(frontBoxEl, { opacity: 0, x: mobile ? 0 : -20, duration: 0.3, ease: "power2.in" }, 0);
        if (mobile) {
            const startY = direction === 1
                ? stageRect.height - stageRect.height * 0.12
                : -stageRect.height * 0.12;
            const endY = direction === 1 ? -stageRect.height * 0.22 : stageRect.height;
            gsap.set(curtainEl, {
                left: 0,
                right: 0,
                top: 0,
                bottom: "auto",
                width: "100%",
                height: "12vh",
                x: 0,
                y: startY,
            });
            gsap.set(panelEl, { height: 0, backgroundColor: nextSlide.panelColor });
            tl.to(curtainEl, { y: endY, duration: sweepDuration, ease: "power3.inOut" }, 0);
            tl.to(curtainEl, { height: "18vh", duration: sweepDuration * 0.5, ease: "power2.out" }, 0);
            tl.to(curtainEl, { height: "8vh", duration: sweepDuration * 0.5, ease: "power2.in" }, sweepDuration * 0.5);
            tl.to(proxy, {
                p: 100,
                duration: sweepDuration,
                ease: "power3.inOut",
                onUpdate: () => {
                    const pct = proxy.p;
                    if (direction === 1) {
                        oldEl.style.clipPath = `inset(0 0 ${pct}% 0)`;
                        newEl.style.clipPath = `inset(${100 - pct}% 0 0 0)`;
                    }
                    else {
                        oldEl.style.clipPath = `inset(${pct}% 0 0 0)`;
                        newEl.style.clipPath = `inset(0 0 ${100 - pct}% 0)`;
                    }
                },
            }, 0);
        }
        else {
            const stageW = stageRect.width;
            if (direction === 1) {
                gsap.set(curtainEl, {
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: "auto",
                    height: "100%",
                    width: "14vw",
                    x: 0,
                    y: 0,
                });
            }
            else {
                gsap.set(curtainEl, {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: "auto",
                    height: "100%",
                    width: "14vw",
                    x: -stageW * 0.14,
                    y: 0,
                });
            }
            gsap.set(panelEl, { width: 0, backgroundColor: nextSlide.panelColor });
            // Slow, languid curtain sweep across full stage (restored earlier duration & travel)
            tl.to(curtainEl, {
                x: direction === 1 ? -stageW * 1.05 : stageW * 1.05,
                duration: sweepDuration,
                ease: "power3.inOut",
            }, 0);
            // Widen smoothly mid-way 14vw -> 22vw -> 14vw
            tl.to(curtainEl, { width: "22vw", duration: sweepDuration * 0.5, ease: "power2.out" }, 0);
            tl.to(curtainEl, { width: "14vw", duration: sweepDuration * 0.5, ease: "power2.in" }, sweepDuration * 0.5);
            // Mask old slide out & reveal new slide in lockstep
            tl.to(proxy, {
                p: 100,
                duration: sweepDuration,
                ease: "power3.inOut",
                onUpdate: () => {
                    const pct = proxy.p;
                    if (direction === 1) {
                        oldEl.style.clipPath = `inset(0 ${pct}% 0 0)`;
                        newEl.style.clipPath = `inset(0 0 0 ${100 - pct}%)`;
                    }
                    else {
                        oldEl.style.clipPath = `inset(0 0 0 ${pct}%)`;
                        newEl.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
                    }
                },
            }, 0);
            // New slide's panel grows in gracefully from right edge (0 -> 14vw)
            tl.to(panelEl, { width: "14vw", duration: 0.72, ease: "power3.out" }, 1.18);
            if (incomingFrontEl) {
                tl.to(incomingFrontEl, { x: 0, opacity: 1, duration: 0.75, ease: "power3.out" }, 1.24);
            }
        }
        // Watch sharpens smoothly as curtain passes (~65% of sweep)
        tl.to(newWatchEls, {
            filter: "blur(0px)",
            opacity: 1,
            scale: 1,
            duration: 0.85,
            ease: "power3.out",
        }, 1.0);
        // Titles rise smoothly
        tl.to(newTitleLines, {
            opacity: 1,
            y: 0,
            duration: 0.78,
            stagger: 0.06,
            ease: "power3.out",
        }, 0.96);
        tl.to(newInfoItems, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.04,
            ease: "power2.out",
        }, 1.08);
    });
    // Run transition right after React updates the dormant slot with nextIndex
    useEffect(() => {
        if (pendingTransitionRef.current) {
            const { nextIndex, targetSlot, direction } = pendingTransitionRef.current;
            pendingTransitionRef.current = null;
            const raf = requestAnimationFrame(() => {
                runSlideTransition(nextIndex, targetSlot, direction);
            });
            return () => cancelAnimationFrame(raf);
        }
    }, [slotSlides, runSlideTransition]);
    const navigateSlide = useCallback((targetIndex, explicitDir) => {
        if (isAnimatingRef.current ||
            isProductOpenRef.current ||
            isFilmOpenRef.current) {
            return;
        }
        const total = HERO_SLIDES.length;
        const normalized = ((targetIndex % total) + total) % total;
        if (normalized === activeIndexRef.current)
            return;
        const dir = explicitDir ??
            (normalized > activeIndexRef.current ||
                (activeIndexRef.current === total - 1 && normalized === 0)
                ? 1
                : -1);
        const targetSlot = activeSlotRef.current === 0 ? 1 : 0;
        isAnimatingRef.current = true;
        pendingTransitionRef.current = { nextIndex: normalized, targetSlot, direction: dir };
        setSlotSlides((prev) => targetSlot === 0 ? [normalized, prev[1]] : [prev[0], normalized]);
    }, []);
    const goNext = useCallback(() => {
        navigateSlide(activeIndexRef.current + 1, 1);
    }, [navigateSlide]);
    const goPrev = useCallback(() => {
        navigateSlide(activeIndexRef.current - 1, -1);
    }, [navigateSlide]);
    const clearAutoTimer = useCallback(() => {
        if (autoTimerRef.current) {
            clearTimeout(autoTimerRef.current);
            autoTimerRef.current = null;
        }
    }, []);
    // 1.5-second settled autoplay timer; pauses on hover, focus, overlays, off-screen, hidden tab, or reduced motion
    const scheduleAutoSlide = useCallback(() => {
        clearAutoTimer();
        if (!isReady ||
            isProductOpen ||
            filmState.open ||
            hasOverlayOpen ||
            prefersReducedMotion() ||
            isHoveredRef.current ||
            isFocusedRef.current ||
            !isInViewRef.current ||
            (typeof document !== "undefined" && document.hidden)) {
            return;
        }
        autoTimerRef.current = setTimeout(() => {
            if (!isAnimatingRef.current &&
                !isProductOpenRef.current &&
                !isFilmOpenRef.current &&
                !hasOverlayOpenRef.current &&
                !isHoveredRef.current &&
                !isFocusedRef.current &&
                isInViewRef.current &&
                !document.hidden) {
                goNext();
            }
        }, AUTO_SLIDE_INTERVAL_MS);
    }, [clearAutoTimer, isReady, isProductOpen, filmState.open, hasOverlayOpen, goNext]);
    // Schedule/cancel timer whenever settled slide or pause states change
    useEffect(() => {
        scheduleAutoSlide();
        return clearAutoTimer;
    }, [scheduleAutoSlide, clearAutoTimer, activeSlot]);
    // Pause auto-slide when hero scrolls off-screen; reschedule cleanly when visible again
    useEffect(() => {
        const el = rootRef.current;
        if (!el || typeof IntersectionObserver === "undefined")
            return;
        const observer = new IntersectionObserver((entries) => {
            const visible = entries[0]?.isIntersecting ?? true;
            isInViewRef.current = visible;
            if (visible) {
                scheduleAutoSlide();
            }
            else {
                clearAutoTimer();
            }
        }, { threshold: 0.35 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [scheduleAutoSlide, clearAutoTimer]);
    // Pause auto-slide when browser tab is hidden; reschedule when tab returns
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) {
                clearAutoTimer();
            }
            else {
                scheduleAutoSlide();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [scheduleAutoSlide, clearAutoTimer]);
    // Clean up any active slide timeline on unmount
    useEffect(() => {
        return () => {
            if (slideTimelineRef.current) {
                slideTimelineRef.current.kill();
                slideTimelineRef.current = null;
            }
        };
    }, []);
    const handleManualNext = useCallback(() => {
        clearAutoTimer();
        goNext();
    }, [clearAutoTimer, goNext]);
    const handleManualPrev = useCallback(() => {
        clearAutoTimer();
        goPrev();
    }, [clearAutoTimer, goPrev]);
    // =========================================================================
    // 3. BUTTER-SMOOTH, NON-STRETCHY OPEN / CLOSE PRODUCT (~1.15s, GSAP Flip)
    // =========================================================================
    const animateProductState = contextSafe((open, pushHistory = true) => {
        if (isAnimatingRef.current)
            return;
        if (open === isProductOpenRef.current)
            return;
        const activeEl = getSlotEl(activeSlotRef.current);
        const panelEl = panelRef.current;
        const frontBoxEl = getFrontBox(activeSlotRef.current);
        const frontInnerEl = getFrontInner(activeSlotRef.current);
        const drawerEl = detailDrawerRef.current;
        const detailCtrlEl = detailControlsRef.current;
        const chevronEl = panelChevronRef.current;
        if (!activeEl || !panelEl || !frontBoxEl || !drawerEl)
            return;
        isAnimatingRef.current = true;
        isProductOpenRef.current = open;
        setIsProductOpen(open);
        if (open) {
            setIsProductLayerActive(true);
        }
        // Reset zoom/expand/rotation cleanly when closing
        if (!open) {
            setIsZoomed(false);
            setIsExpandedView(false);
            rotationRef.current = 0;
            if (frontInnerEl) {
                gsap.to(frontInnerEl, {
                    scale: 1,
                    rotation: 0,
                    duration: 0.45,
                    ease: "power3.out",
                });
            }
        }
        // Shallow URL sync via history.pushState
        if (pushHistory && typeof window !== "undefined") {
            const slide = HERO_SLIDES[activeIndexRef.current];
            if (open) {
                window.history.pushState({ heroProductOpen: true, watchId: slide.id }, "", `/watch/${slide.id}`);
            }
            else if (window.location.pathname.startsWith("/watch/")) {
                window.history.pushState({ heroProductOpen: false }, "", "/watches");
            }
        }
        const mobile = isMobileViewport();
        const reduced = prefersReducedMotion();
        const duration = reduced ? 0.35 : 1.15;
        const ease = reduced ? "power2.out" : "power4.inOut";
        // Kill any in-flight hover tweens cleanly before Flip measurement
        gsap.killTweensOf([panelEl, frontBoxEl]);
        // Capture exact bounding rect BEFORE toggling the aspect-locked Flip class
        const flipState = Flip.getState(frontBoxEl);
        // Toggle aspect-locked target class (both classes share exact 1342/2000 aspect-ratio -> zero stretch!)
        if (open) {
            frontBoxEl.classList.remove("hero-front-resting");
            frontBoxEl.classList.add("hero-front-open");
        }
        else {
            frontBoxEl.classList.remove("hero-front-open");
            frontBoxEl.classList.add("hero-front-resting");
        }
        // Clear residual hover nudge before Flip computes delta
        gsap.set(frontBoxEl, { x: 0, y: 0, scale: 1 });
        const drawerStaggers = drawerEl.querySelectorAll("[data-detail-stagger]");
        const moodyAndInfo = activeEl.querySelectorAll("[data-hero-watch], [data-hero-title-line], [data-hero-info-item]");
        panelEl.style.willChange = "width, height, right";
        drawerEl.style.willChange = "transform";
        frontBoxEl.style.willChange = "transform";
        const tl = gsap.timeline({
            onComplete: () => {
                panelEl.style.willChange = "auto";
                drawerEl.style.willChange = "auto";
                frontBoxEl.style.willChange = "auto";
                if (!open) {
                    gsap.set(panelEl, { zIndex: 14 });
                    gsap.set(frontBoxEl, { zIndex: 15, opacity: 1, y: 0 });
                    setIsProductLayerActive(false);
                }
                isAnimatingRef.current = false;
            },
        });
        if (open) {
            // 1. Fade out moody watch & info column smoothly
            tl.to(moodyAndInfo, {
                opacity: 0,
                x: reduced ? 0 : -48,
                duration: reduced ? 0.3 : 0.72,
                ease,
            }, 0);
            if (chevronEl) {
                tl.to(chevronEl, { opacity: 0, duration: 0.25, ease: "power2.out" }, 0);
            }
            // 2. Expand colour panel: desktop 14vw right:0 -> 65vw right:35vw; mobile 0 -> top 46%
            if (mobile) {
                gsap.set(panelEl, { top: 0, bottom: "auto", width: "100%", height: 0, zIndex: 25 });
                tl.to(panelEl, {
                    height: "46%",
                    duration,
                    ease,
                }, 0);
            }
            else {
                tl.to(panelEl, {
                    width: "65vw",
                    right: "35vw",
                    zIndex: 25,
                    duration,
                    ease,
                }, 0);
            }
            gsap.set(frontBoxEl, { zIndex: 27 });
            // 3. Uniform non-stretchy GSAP Flip glide to center of coloured area (desktop) or fade-in (mobile)
            if (mobile) {
                tl.fromTo(frontBoxEl, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: duration * 0.75, ease: "power3.out" }, 0.15);
            }
            else {
                tl.add(Flip.from(flipState, {
                    duration,
                    ease,
                    scale: true,
                }), 0);
            }
            // 4. White details drawer slides in
            tl.to(drawerEl, mobile
                ? { y: "0%", x: "0%", duration, ease }
                : { x: "0%", y: "0%", duration, ease }, 0);
            // 5. Stagger drawer content
            tl.fromTo(drawerStaggers, { opacity: 0, y: 16 }, {
                opacity: 1,
                y: 0,
                duration: 0.55,
                stagger: 0.045,
                ease: "power3.out",
            }, reduced ? 0.1 : 0.45);
            // 6. Reveal coloured area detail controls
            if (detailCtrlEl) {
                tl.fromTo(detailCtrlEl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, reduced ? 0.15 : 0.58);
            }
        }
        else {
            // CLOSE (silky, zero-stretch exact reverse)
            if (detailCtrlEl) {
                tl.to(detailCtrlEl, { opacity: 0, duration: 0.25, ease: "power2.in" }, 0);
            }
            tl.to(drawerEl, mobile
                ? { y: "100%", duration: duration * 0.92, ease }
                : { x: "100%", duration: duration * 0.92, ease }, 0);
            // Keep front watch strictly above the coloured panel until close completes
            gsap.set(panelEl, { zIndex: 25 });
            gsap.set(frontBoxEl, { zIndex: 27, opacity: 1 });
            if (mobile) {
                tl.to(panelEl, {
                    height: 0,
                    duration: duration * 0.85,
                    ease,
                }, 0);
                tl.to(frontBoxEl, {
                    opacity: 0,
                    y: -16,
                    duration: duration * 0.35,
                    ease: "power2.in",
                }, duration * 0.45);
            }
            else {
                tl.to(panelEl, {
                    width: "14vw",
                    right: 0,
                    duration,
                    ease,
                }, 0);
                // Uniform non-stretchy GSAP Flip return to right panel preview (remains visible above panel throughout)
                tl.add(Flip.from(flipState, {
                    duration,
                    ease,
                    scale: true,
                }), 0);
            }
            // Reveal moody watch & info column cleanly
            tl.to(moodyAndInfo, {
                opacity: 1,
                x: 0,
                duration: reduced ? 0.3 : 0.82,
                ease: "power3.out",
            }, reduced ? 0.08 : 0.38);
            if (chevronEl) {
                tl.to(chevronEl, { opacity: 1, duration: 0.35, ease: "power2.out" }, 0.58);
            }
        }
    });
    const handleOpenProduct = useCallback(() => {
        animateProductState(true, true);
    }, [animateProductState]);
    const handleCloseProduct = useCallback(() => {
        animateProductState(false, true);
        scheduleAutoSlide();
    }, [animateProductState, scheduleAutoSlide]);
    // Browser Back / Forward support for /watch/[id] shallow route
    useEffect(() => {
        const onPopState = () => {
            const path = window.location.pathname;
            if (path.startsWith("/watch/")) {
                const id = path.replace("/watch/", "");
                const idx = HERO_SLIDES.findIndex((s) => s.id === id);
                if (idx >= 0 && idx !== activeIndexRef.current) {
                    activeIndexRef.current = idx;
                    setSlotSlides((prev) => activeSlotRef.current === 0 ? [idx, prev[1]] : [prev[0], idx]);
                }
                if (!isProductOpenRef.current) {
                    animateProductState(true, false);
                }
            }
            else if (isProductOpenRef.current) {
                animateProductState(false, false);
            }
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [animateProductState]);
    // =========================================================================
    // 5. MICRO-INTERACTIONS (Hero Hover/Focus Pause + Panel Hover Preview)
    // =========================================================================
    const handleStageMouseEnter = useCallback(() => {
        isHoveredRef.current = true;
        clearAutoTimer();
    }, [clearAutoTimer]);
    const handleStageMouseLeave = useCallback(() => {
        isHoveredRef.current = false;
        scheduleAutoSlide();
    }, [scheduleAutoSlide]);
    const handleHeroFocusCapture = useCallback(() => {
        isFocusedRef.current = true;
        clearAutoTimer();
    }, [clearAutoTimer]);
    const handleHeroBlurCapture = useCallback((e) => {
        if (!rootRef.current?.contains(e.relatedTarget)) {
            isFocusedRef.current = false;
            scheduleAutoSlide();
        }
    }, [scheduleAutoSlide]);
    // Panel hover preview: widens 14vw -> 16.5vw & nudges front watch -14px
    const handlePanelEnter = contextSafe(() => {
        isHoveredRef.current = true;
        clearAutoTimer();
        if (isAnimatingRef.current ||
            isProductOpenRef.current ||
            isMobileViewport() ||
            prefersReducedMotion()) {
            return;
        }
        if (panelRef.current) {
            gsap.to(panelRef.current, {
                width: "16.5vw",
                duration: 0.45,
                ease: "power3.out",
                overwrite: "auto",
            });
        }
        const activeFrontBox = getFrontBox(activeSlotRef.current);
        if (activeFrontBox) {
            gsap.to(activeFrontBox, {
                x: -14,
                scale: 1.02,
                duration: 0.45,
                ease: "power3.out",
                overwrite: "auto",
            });
        }
    });
    const handlePanelLeave = contextSafe(() => {
        if (isAnimatingRef.current || isProductOpenRef.current || isMobileViewport()) {
            return;
        }
        if (panelRef.current) {
            gsap.to(panelRef.current, {
                width: "14vw",
                duration: 0.45,
                ease: "power3.out",
                overwrite: "auto",
            });
        }
        const activeFrontBox = getFrontBox(activeSlotRef.current);
        if (activeFrontBox) {
            gsap.to(activeFrontBox, {
                x: 0,
                scale: 1,
                duration: 0.45,
                ease: "power3.out",
                overwrite: "auto",
            });
        }
    });
    // Keyboard (← → Escape) & Horizontal Wheel / Touch Swipe
    useEffect(() => {
        const onKeyDown = (e) => {
            if (filmState.open || hasOverlayOpenRef.current)
                return;
            if (e.key === "Escape" && isProductOpenRef.current) {
                handleCloseProduct();
                return;
            }
            if (isProductOpenRef.current)
                return;
            if (window.scrollY > window.innerHeight * 0.6)
                return;
            if (e.key === "ArrowRight") {
                e.preventDefault();
                handleManualNext();
            }
            else if (e.key === "ArrowLeft") {
                e.preventDefault();
                handleManualPrev();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [filmState.open, handleManualNext, handleManualPrev, handleCloseProduct]);
    const handleWheel = (e) => {
        if (isProductOpenRef.current || isAnimatingRef.current || filmState.open)
            return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.25 && Math.abs(e.deltaX) > 32) {
            const now = Date.now();
            if (now - wheelLockRef.current < 900)
                return;
            wheelLockRef.current = now;
            if (e.deltaX > 0)
                handleManualNext();
            else
                handleManualPrev();
        }
    };
    // Horizontal swipe detection without blocking vertical page scrolling
    const handleTouchStart = (e) => {
        const t = e.touches[0];
        touchStartRef.current = { x: t.clientX, y: t.clientY };
    };
    const handleTouchCancel = () => {
        touchStartRef.current = null;
    };
    const handleTouchEnd = (e) => {
        if (!touchStartRef.current || isProductOpenRef.current || isAnimatingRef.current) {
            touchStartRef.current = null;
            return;
        }
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStartRef.current.x;
        const dy = t.clientY - touchStartRef.current.y;
        touchStartRef.current = null;
        // Require clear horizontal intent so diagonal vertical scrolls never hijack page scrolling
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
            if (dx < 0)
                handleManualNext();
            else
                handleManualPrev();
        }
    };
    // Detail interactive watch tools (Expand, Zoom, Rotate 360)
    const handleToggleZoom = contextSafe(() => {
        const next = !isZoomed;
        setIsZoomed(next);
        if (next)
            setIsExpandedView(false);
        const activeInner = getFrontInner(activeSlotRef.current);
        if (activeInner) {
            gsap.to(activeInner, {
                scale: next ? 1.45 : 1,
                duration: 0.55,
                ease: "power3.out",
            });
        }
    });
    const handleToggleExpand = contextSafe(() => {
        const next = !isExpandedView;
        setIsExpandedView(next);
        if (next)
            setIsZoomed(false);
        const activeInner = getFrontInner(activeSlotRef.current);
        if (activeInner) {
            gsap.to(activeInner, {
                scale: next ? 1.2 : 1,
                duration: 0.55,
                ease: "power3.out",
            });
        }
    });
    const handleRotate360 = contextSafe(() => {
        rotationRef.current += 360;
        const activeInner = getFrontInner(activeSlotRef.current);
        if (activeInner) {
            gsap.to(activeInner, {
                rotation: rotationRef.current,
                duration: 1.0,
                ease: "expo.inOut",
            });
        }
    });
    const handleOpenFilm = useCallback((origin) => {
        setFilmState({ open: true, origin });
    }, []);
    return (<section id="hero" ref={rootRef} onFocusCapture={handleHeroFocusCapture} onBlurCapture={handleHeroBlurCapture} aria-label="Watch Inc Collection Showcase" aria-roledescription="carousel" className="relative w-full h-screen pt-[64px] md:pt-[80px] bg-[#0A0A0B] text-[#F3EFE7] overflow-hidden select-none font-sans">
      {/* Preload next & previous slide images eagerly at quality 90 for seamless transitions */}
      <div className="fixed opacity-0 pointer-events-none -z-50 w-[45vw] h-[88vh] overflow-hidden" aria-hidden="true">
        <div className="relative w-full h-full">
          <Image key={`preload-moody-${nextPreloadSlide.id}`} src={nextPreloadSlide.moodySrc} alt="" fill quality={90} loading="eager" sizes="(max-width: 768px) 90vw, 48vw"/>
        </div>
        <div className="relative w-[24vw] h-[85vh]">
          <Image key={`preload-front-${nextPreloadSlide.id}`} src={nextPreloadSlide.frontSrc} alt="" fill quality={90} loading="eager" sizes="(max-width: 768px) 60vw, 38vw"/>
        </div>
        <div className="relative w-full h-full">
          <Image key={`preload-prev-moody-${prevPreloadSlide.id}`} src={prevPreloadSlide.moodySrc} alt="" fill quality={90} loading="eager" sizes="(max-width: 768px) 90vw, 48vw"/>
        </div>
      </div>

      {/* STAGE BELOW NAV: calc(100vh - 64px) mobile / calc(100vh - 80px) desktop */}
      <div ref={stageRef} onMouseEnter={handleStageMouseEnter} onMouseLeave={handleStageMouseLeave} onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchCancel={handleTouchCancel} onTouchEnd={handleTouchEnd} className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] overflow-hidden bg-[#0A0A0B] touch-pan-y">
        {/* RIGHT COLOUR PANEL (14vw desktop; expands on Discover/preview click; hidden when closed on mobile) */}
        <div ref={panelRef} onClick={() => {
            if (!isProductOpenRef.current)
                handleManualNext();
        }} onMouseEnter={handlePanelEnter} onMouseLeave={handlePanelLeave} style={{ backgroundColor: currentSlide.panelColor }} className="group/panel absolute z-[14] right-0 top-0 w-full md:w-[14vw] h-0 md:h-full cursor-pointer overflow-hidden"/>

        {/* PERSISTENT PING-PONG FRONT-ON WATCH SLOT 0 (zero unmount -> zero post-slide flicker!) */}
        <div ref={frontBox0Ref} aria-hidden={activeSlot !== 0} style={{
            zIndex: activeSlot === 0 ? (isProductLayerActive ? 27 : 15) : 13,
            visibility: activeSlot === 0 ? "visible" : "hidden",
            opacity: activeSlot === 0 ? 1 : 0,
        }} onClick={(e) => {
            e.stopPropagation();
            if (activeSlotRef.current === 0 && !isProductOpenRef.current) {
                handleOpenProduct();
            }
        }} onMouseEnter={handlePanelEnter} onMouseLeave={handlePanelLeave} role="button" tabIndex={activeSlot === 0 ? 0 : -1} aria-label={`Open details for ${HERO_SLIDES[slotSlides[0]].titleLine1}`} onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (activeSlotRef.current === 0 && !isProductOpenRef.current)
                    handleOpenProduct();
            }
        }} className={`absolute ${isProductLayerActive ? "block" : "hidden md:block"} ${activeSlot === 0 ? "cursor-pointer pointer-events-auto" : "pointer-events-none"} ${activeSlot === 0 && isProductOpen ? "hero-front-open" : "hero-front-resting"}`}>
          <div ref={frontInner0Ref} className="w-full h-full">
            <WatchArtwork slide={HERO_SLIDES[slotSlides[0]]} variant="front" priority={slotSlides[0] === 0}/>
          </div>
        </div>

        {/* PERSISTENT PING-PONG FRONT-ON WATCH SLOT 1 */}
        <div ref={frontBox1Ref} aria-hidden={activeSlot !== 1} style={{
            zIndex: activeSlot === 1 ? (isProductLayerActive ? 27 : 15) : 13,
            visibility: activeSlot === 1 ? "visible" : "hidden",
            opacity: activeSlot === 1 ? 1 : 0,
        }} onClick={(e) => {
            e.stopPropagation();
            if (activeSlotRef.current === 1 && !isProductOpenRef.current) {
                handleOpenProduct();
            }
        }} onMouseEnter={handlePanelEnter} onMouseLeave={handlePanelLeave} role="button" tabIndex={activeSlot === 1 ? 0 : -1} aria-label={`Open details for ${HERO_SLIDES[slotSlides[1]].titleLine1}`} onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (activeSlotRef.current === 1 && !isProductOpenRef.current)
                    handleOpenProduct();
            }
        }} className={`absolute ${isProductLayerActive ? "block" : "hidden md:block"} ${activeSlot === 1 ? "cursor-pointer pointer-events-auto" : "pointer-events-none"} ${activeSlot === 1 && isProductOpen ? "hero-front-open" : "hero-front-resting"}`}>
          <div ref={frontInner1Ref} className="w-full h-full">
            <WatchArtwork slide={HERO_SLIDES[slotSlides[1]]} variant="front" priority={false}/>
          </div>
        </div>

        {/* PERSISTENT PING-PONG SLIDE SLOT 0 (no DOM unmount on transition complete -> zero text jitter!) */}
        <div ref={slot0Ref} aria-hidden={activeSlot !== 0} style={{
            zIndex: activeSlot === 0 ? 16 : 12,
            visibility: activeSlot === 0 ? "visible" : "hidden",
        }} className="absolute inset-0 pointer-events-none">
          <HeroSlideContent slide={HERO_SLIDES[slotSlides[0]]} priority={slotSlides[0] === 0} onOpenProduct={handleOpenProduct} onOpenFilm={handleOpenFilm} interactive={activeSlot === 0 && !isProductOpen}/>
        </div>

        {/* PERSISTENT PING-PONG SLIDE SLOT 1 */}
        <div ref={slot1Ref} aria-hidden={activeSlot !== 1} style={{
            zIndex: activeSlot === 1 ? 16 : 12,
            visibility: activeSlot === 1 ? "visible" : "hidden",
        }} className="absolute inset-0 pointer-events-none">
          <HeroSlideContent slide={HERO_SLIDES[slotSlides[1]]} priority={false} onOpenProduct={handleOpenProduct} onOpenFilm={handleOpenFilm} interactive={activeSlot === 1 && !isProductOpen}/>
        </div>

        {/* CURTAIN OVERLAY (sweeps slowly across entire stage during Next/Prev slide transitions) */}
        <div ref={curtainRef} aria-hidden="true" className="hidden absolute z-[24] pointer-events-none"/>

        {/* COLOURED AREA DETAIL CONTROLS (Left vertical tools, ← BACK, 64px Play Button) */}
        <div ref={detailControlsRef} aria-hidden={!isProductOpen} className="absolute inset-0 z-[28] opacity-0 pointer-events-none">
          {/* Left vertical icon column (expand, zoom, rotate-360) */}
          <div className={`absolute left-4 md:left-[3vw] top-[23%] md:top-1/2 -translate-y-1/2 flex flex-col gap-3 ${isProductOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            <button type="button" onClick={handleToggleExpand} aria-label="Expand timepiece view" className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${isExpandedView
            ? "bg-black text-white border-black"
            : "border-black/25 text-black/85 hover:bg-black hover:text-white"}`}>
              <Maximize2 size={14} strokeWidth={1.4}/>
            </button>

            <button type="button" onClick={handleToggleZoom} aria-label={isZoomed ? "Zoom out" : "Zoom in on stone dial"} className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${isZoomed
            ? "bg-black text-white border-black"
            : "border-black/25 text-black/85 hover:bg-black hover:text-white"}`}>
              {isZoomed ? (<ZoomOut size={14} strokeWidth={1.4}/>) : (<ZoomIn size={14} strokeWidth={1.4}/>)}
            </button>

            <button type="button" onClick={handleRotate360} aria-label="Rotate timepiece 360 degrees" className="w-9 h-9 rounded-full border border-black/25 text-black/85 hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer">
              <RotateCw size={14} strokeWidth={1.4}/>
            </button>
          </div>

          {/* ← BACK at top-right of coloured area */}
          <button type="button" onClick={handleCloseProduct} className={`absolute top-5 right-5 md:top-[28px] md:right-[calc(35vw+32px)] flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-black hover:opacity-65 transition-opacity cursor-pointer ${isProductOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            <ArrowLeft size={14} strokeWidth={1.5}/>
            <span>BACK</span>
          </button>

          {/* 64px Circle Play Button + "WATCH THE FILM" at right-centre of coloured area */}
          <div className={`hidden md:flex flex-col items-center gap-3 absolute right-[calc(35vw+36px)] top-1/2 -translate-y-1/2 ${isProductOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            <CircleActionButton size={64} variant="dark" ariaLabel={`Watch detail film for ${currentSlide.titleLine1}`} onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            handleOpenFilm({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            });
        }}>
              <Play size={18} strokeWidth={1.5} className="translate-x-[1px] fill-current"/>
            </CircleActionButton>
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-black/80">
              WATCH THE FILM
            </span>
          </div>
        </div>

        {/* WHITE DETAILS PANEL (#FFFFFF, width 35vw desktop / bottom sheet mobile) */}
        <ProductDetailDrawer slide={currentSlide} drawerRef={detailDrawerRef} isOpen={isProductOpen}/>
      </div>

      {/* FULLSCREEN FILM OVERLAY (#0F3350, clip-path circle expand from play button) */}
      <FilmOverlay slide={currentSlide} isOpen={filmState.open} origin={filmState.origin} onClose={() => setFilmState((prev) => ({ ...prev, open: false }))}/>
    </section>);
}
