"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// Ensure ScrollTrigger is registered with GSAP
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}
const SmoothScrollContext = createContext({
    lenis: null,
    scrollTo: () => { },
});
export const useSmoothScroll = () => useContext(SmoothScrollContext);
export default function SmoothScrollProvider({ children, }) {
    const pathname = usePathname();
    const [lenisInstance, setLenisInstance] = useState(null);
    const lenisRef = useRef(null);
    useEffect(() => {
        const save = () => {
            try { sessionStorage.setItem("wi-scroll:" + window.location.pathname, String(Math.round(window.scrollY))); } catch (e) { }
        };
        window.addEventListener("pagehide", save);
        window.addEventListener("beforeunload", save);
        return () => {
            window.removeEventListener("pagehide", save);
            window.removeEventListener("beforeunload", save);
        };
    }, []);
    // Clean up and refresh scroll & triggers on route change.
    // Skipped on the first load so a reload keeps the visitor where they were.
    const firstLoadRef = useRef(true);
    useEffect(() => {
        if (firstLoadRef.current) {
            firstLoadRef.current = false;
            // On a reload, put the visitor back where they were
            let restoreTimer;
            try {
                const nav = performance.getEntriesByType("navigation")[0];
                const saved = Number(sessionStorage.getItem("wi-scroll:" + pathname));
                if (nav && nav.type === "reload" && saved > 0) {
                    restoreTimer = setTimeout(() => {
                        if (lenisRef.current) lenisRef.current.scrollTo(saved, { immediate: true, force: true });
                        else window.scrollTo(0, saved);
                    }, 60);
                }
            } catch (e) { }
            const t = setTimeout(() => ScrollTrigger.refresh(), 180);
            return () => { clearTimeout(t); clearTimeout(restoreTimer); };
        }
        if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true });
        }
        else if (typeof window !== "undefined") {
            window.scrollTo(0, 0);
        }
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 120);
        return () => clearTimeout(timer);
    }, [pathname]);
    useEffect(() => {
        // Respect user's reduced-motion preference
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            // Keep standard native scroll
            return;
        }
        const lenis = new Lenis({
            duration: 1.25,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
        });
        lenisRef.current = lenis;
        setLenisInstance(lenis);
        // Synchronize Lenis scroll position with GSAP ScrollTrigger
        lenis.on("scroll", ScrollTrigger.update);
        // Synchronize GSAP ticker with Lenis frame update
        const updateTicker = (time) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(updateTicker);
        gsap.ticker.lagSmoothing(0);
        return () => {
            gsap.ticker.remove(updateTicker);
            lenis.destroy();
            lenisRef.current = null;
            setLenisInstance(null);
        };
    }, []);
    const scrollTo = (target, options = {}) => {
        if (lenisRef.current) {
            lenisRef.current.scrollTo(target, {
                duration: 1.4,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                ...options,
            });
        }
        else {
            if (typeof target === "string") {
                const el = document.querySelector(target);
                if (el) {
                    const offset = typeof options.offset === "number" ? options.offset : 0;
                    const top = el.getBoundingClientRect().top + window.scrollY + offset;
                    window.scrollTo({ top, behavior: "smooth" });
                }
            }
            else if (typeof target === "number") {
                window.scrollTo({ top: target, behavior: "smooth" });
            }
            else if (target instanceof HTMLElement) {
                const offset = typeof options.offset === "number" ? options.offset : 0;
                const top = target.getBoundingClientRect().top + window.scrollY + offset;
                window.scrollTo({ top, behavior: "smooth" });
            }
        }
    };
    return (<SmoothScrollContext.Provider value={{ lenis: lenisInstance, scrollTo }}>
        {children}
    </SmoothScrollContext.Provider>);
}