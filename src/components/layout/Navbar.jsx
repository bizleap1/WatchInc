"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { useStore } from "@/store/useStore";
import { ShoppingBag, Menu, X } from "lucide-react";
const DESKTOP_NAVBAR_HEIGHT = 80;
const MOBILE_NAVBAR_HEIGHT = 64;
const NAV_LINKS = [
    { id: "watches", label: "Watches", href: "/watches", routeFallback: "/watches" },
    { id: "ritual", label: "The Ritual", href: "#ritual", routeFallback: "/#ritual" },
    { id: "selenite", label: "Selenite", href: "#selenite", routeFallback: "/#selenite" },
];
function getNavbarHeight() {
    if (typeof window === "undefined")
        return DESKTOP_NAVBAR_HEIGHT;
    return window.innerWidth >= 768 ? DESKTOP_NAVBAR_HEIGHT : MOBILE_NAVBAR_HEIGHT;
}
export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const prefersReducedMotion = useReducedMotion();
    const [activeLink, setActiveLink] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const scrollLockUntilRef = useRef(0);
    const menuButtonRef = useRef(null);
    const drawerRef = useRef(null);
    const shouldRestoreFocusRef = useRef(false);
    const { lenis, scrollTo } = useSmoothScroll();
    const cartItems = useStore((s) => s.cartItems);
    const allocations = useStore((s) => s.allocations);
    const openCart = useStore((s) => s.openCart);
    const openWaitlist = useStore((s) => s.openWaitlist);
    const bagCount = cartItems.length || allocations.length;
    const updateActiveSection = useCallback(() => {
        if (typeof window === "undefined")
            return;
        if (pathname === "/watches" || pathname.startsWith("/watch") || pathname.startsWith("/collection")) {
            setActiveLink("watches");
            return;
        }
        if (performance.now() < scrollLockUntilRef.current)
            return;
        const sections = NAV_LINKS.filter((link) => link.href.startsWith("#")).map((link) => ({
            id: link.id,
            el: document.getElementById(link.id),
        })).filter((item) => item.el !== null);
        if (sections.length === 0) {
            setActiveLink("");
            return;
        }
        const navH = getNavbarHeight();
        const vh = window.innerHeight;
        const probeY = navH + (vh - navH) * 0.35;
        // Highlight a link ONLY when its corresponding section is visibly spanning the viewport focal line
        const visibleSection = sections.find(({ el }) => {
            const rect = el.getBoundingClientRect();
            return rect.top <= probeY && rect.bottom > probeY;
        });
        setActiveLink(visibleSection ? visibleSection.id : "");
    }, [pathname]);
    // Sync active nav item with the currently visible section
    useEffect(() => {
        let rafId = 0;
        const scheduleUpdate = () => {
            if (rafId)
                return;
            rafId = window.requestAnimationFrame(() => {
                rafId = 0;
                updateActiveSection();
            });
        };
        const releaseScrollLock = () => {
            scrollLockUntilRef.current = 0;
        };
        updateActiveSection();
        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate, { passive: true });
        window.addEventListener("wheel", releaseScrollLock, { passive: true });
        window.addEventListener("touchstart", releaseScrollLock, { passive: true });
        if (lenis) {
            lenis.on("scroll", scheduleUpdate);
        }
        return () => {
            if (rafId)
                window.cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", scheduleUpdate);
            window.removeEventListener("resize", scheduleUpdate);
            window.removeEventListener("wheel", releaseScrollLock);
            window.removeEventListener("touchstart", releaseScrollLock);
            if (lenis) {
                lenis.off("scroll", scheduleUpdate);
            }
        };
    }, [lenis, updateActiveSection]);
    // Scroll to hash target when arriving from another route (e.g. /#selenite)
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        const hash = window.location.hash;
        if (!hash)
            return;
        const targetId = hash.replace("#", "");
        const matchingLink = NAV_LINKS.find((l) => l.id === targetId);
        if (!matchingLink)
            return;
        const el = document.getElementById(targetId);
        if (!el)
            return;
        const timer = window.setTimeout(() => {
            const navH = getNavbarHeight();
            setActiveLink(targetId);
            scrollLockUntilRef.current = performance.now() + 1000;
            scrollTo(hash, {
                offset: -navH,
            });
        }, 150);
        return () => window.clearTimeout(timer);
    }, [pathname, scrollTo]);
    // Close mobile menu on desktop resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && mobileMenuOpen) {
                shouldRestoreFocusRef.current = false;
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [mobileMenuOpen]);
    // Lock page scroll, trap focus, and handle Escape while mobile drawer is open
    useEffect(() => {
        if (!mobileMenuOpen) {
            if (shouldRestoreFocusRef.current) {
                shouldRestoreFocusRef.current = false;
                menuButtonRef.current?.focus();
            }
            return;
        }
        document.body.style.overflow = "hidden";
        lenis?.stop();
        // Move initial keyboard focus into the mobile drawer
        const focusRaf = window.requestAnimationFrame(() => {
            const firstFocusable = drawerRef.current?.querySelector('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
            firstFocusable?.focus();
        });
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                shouldRestoreFocusRef.current = true;
                setMobileMenuOpen(false);
                return;
            }
            if (e.key === "Tab" && drawerRef.current) {
                const drawerFocusables = Array.from(drawerRef.current.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
                const focusCycle = [
                    ...(menuButtonRef.current ? [menuButtonRef.current] : []),
                    ...drawerFocusables,
                ];
                if (focusCycle.length === 0)
                    return;
                const first = focusCycle[0];
                const last = focusCycle[focusCycle.length - 1];
                const active = document.activeElement;
                if (e.shiftKey) {
                    if (!active || active === first || !focusCycle.includes(active)) {
                        e.preventDefault();
                        last.focus();
                    }
                }
                else {
                    if (!active || active === last || !focusCycle.includes(active)) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.cancelAnimationFrame(focusRaf);
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
            lenis?.start();
        };
    }, [mobileMenuOpen, lenis]);
    const closeMobileMenu = (restoreFocus) => {
        shouldRestoreFocusRef.current = restoreFocus;
        setMobileMenuOpen(false);
    };
    const handleLinkClick = (link) => {
        closeMobileMenu(false);
        document.body.style.overflow = "";
        lenis?.start();
        if (link.id === "watches") {
            if (pathname === "/watches") {
                scrollLockUntilRef.current = performance.now() + 1000;
                scrollTo(0, { force: true });
            } else {
                router.push("/watches");
            }
            return;
        }
        const targetEl = typeof document !== "undefined" ? document.getElementById(link.id) : null;
        if (targetEl && pathname === "/") {
            const navH = getNavbarHeight();
            setActiveLink(link.id);
            scrollLockUntilRef.current = performance.now() + 1000;
            scrollTo(link.href, {
                offset: -navH,
                force: true,
            });
        }
        else if (link.routeFallback) {
            router.push(link.routeFallback);
        }
    };
    const handleWordmarkClick = (e) => {
        closeMobileMenu(false);
        document.body.style.overflow = "";
        lenis?.start();
        if (pathname === "/") {
            e.preventDefault();
            setActiveLink("");
            scrollLockUntilRef.current = performance.now() + 1000;
            scrollTo(0, { force: true });
        }
    };
    const backdropTransition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.25, ease: "easeOut" };
    const drawerTransition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.28, ease: [0.16, 1, 0.3, 1] };
    return (<>
      <header aria-label="Primary navigation" className="fixed top-0 left-0 right-0 z-[40] h-[64px] md:h-[80px] bg-[#0A0A0B] font-sans">
        {/* Subtle top hairline sheen */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#F3EFE7]/[0.08] to-transparent pointer-events-none"/>

        <div className="w-full h-full px-5 md:px-[4vw] grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Mobile Left: Menu Trigger */}
          <button ref={menuButtonRef} type="button" onClick={() => {
            if (mobileMenuOpen) {
                closeMobileMenu(true);
            }
            else {
                setMobileMenuOpen(true);
            }
        }} aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen} aria-controls="mobile-nav-drawer" className="col-start-1 row-start-1 justify-self-start md:hidden text-[#F3EFE7]/80 hover:text-[#F3EFE7] transition-colors duration-200 motion-reduce:transition-none cursor-pointer p-1.5 -ml-1.5">
            {mobileMenuOpen ? (<X size={20} strokeWidth={1.35} aria-hidden="true"/>) : (<Menu size={20} strokeWidth={1.35} aria-hidden="true"/>)}
          </button>

          {/* Wordmark: Centre on Mobile, Left on Desktop — Clicking opens Home page */}
          <Link href="/" onClick={handleWordmarkClick} aria-label="Watch Inc — Home" className="col-start-2 row-start-1 justify-self-center md:col-start-1 md:justify-self-start group inline-flex items-center text-[#F3EFE7] hover:opacity-85 transition-opacity duration-300 motion-reduce:transition-none">
            <span className="font-sans font-medium text-[15px] tracking-[0.3em] uppercase leading-none whitespace-nowrap">
              WATCH INC
            </span>
          </Link>

          {/* Desktop Centre: Watches · The Ritual · Selenite */}
          <nav className="hidden md:flex md:col-start-2 md:row-start-1 md:justify-self-center items-center gap-10 lg:gap-12" aria-label="Primary">
            {NAV_LINKS.map((link) => {
            const isActive = activeLink === link.id;
            return (<button key={link.id} type="button" onClick={() => handleLinkClick(link)} aria-current={isActive ? "location" : undefined} className={`nav-underline py-1 bg-transparent border-0 no-underline font-sans text-[12px] font-normal uppercase tracking-[0.14em] transition-colors duration-250 motion-reduce:transition-none cursor-pointer whitespace-nowrap ${isActive
                    ? "text-[#F3EFE7]"
                    : "text-[#F3EFE7]/72 [@media(hover:hover)]:hover:text-[#F3EFE7] focus-visible:text-[#F3EFE7]"}`}>
                  {link.label}
                </button>);
        })}
          </nav>

          {/* Right: Plain-Text Join the Waitlist Trigger (Desktop) + Bag Icon */}
          <div className="col-start-3 row-start-1 justify-self-end flex items-center gap-5 lg:gap-6">
            <button type="button" onClick={() => openWaitlist()} aria-label="Join the waitlist" className="nav-underline hidden md:inline-flex items-center py-1 bg-transparent border-0 no-underline text-[#F3EFE7]/85 [@media(hover:hover)]:hover:text-[#F3EFE7] focus-visible:text-[#F3EFE7] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F3EFE7]/70 focus-visible:outline-offset-4 font-sans text-[12px] font-medium uppercase tracking-[0.13em] transition-colors duration-250 motion-reduce:transition-none cursor-pointer whitespace-nowrap">
              Join the Waitlist
            </button>

            <button type="button" onClick={() => {
            closeMobileMenu(false);
            openCart();
        }} aria-label={bagCount > 0
            ? `Open bag, ${bagCount} ${bagCount === 1 ? "item" : "items"}`
            : "Open bag"} className="relative flex items-center gap-2 text-[#F3EFE7]/80 hover:text-[#F3EFE7] transition-colors duration-300 motion-reduce:transition-none cursor-pointer p-1.5 -mr-1.5 md:p-1 md:mr-0">
              <ShoppingBag size={17} strokeWidth={1.35} aria-hidden="true"/>
              {bagCount > 0 && (<>
                  <span className="font-sans font-medium tabular-nums text-[10px] text-[#F3EFE7]/85">
                    {bagCount}
                  </span>
                  <span aria-hidden="true" className="absolute top-1 right-1 md:top-0.5 md:right-0 w-[4px] h-[4px] rounded-full bg-[#F3EFE7]"/>
                </>)}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (<div id="mobile-nav-drawer" className="fixed inset-0 top-[64px] z-[39] md:hidden">
            {/* Outside Tap Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={backdropTransition} onClick={() => closeMobileMenu(true)} aria-hidden="true" className="absolute inset-0 bg-black/75 backdrop-blur-sm"/>

            {/* Simple Dark Slide-In Drawer */}
            <motion.nav ref={drawerRef} role="dialog" aria-modal="true" aria-label="Mobile navigation" initial={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }} animate={prefersReducedMotion ? { opacity: 1 } : { x: "0%" }} exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }} transition={drawerTransition} className="relative z-10 h-full w-[82vw] max-w-[320px] bg-[#0A0A0B] border-r border-[#F3EFE7]/[0.08] flex flex-col justify-between px-7 py-10 font-sans overflow-y-auto">
              <div className="flex flex-col">
                {NAV_LINKS.map((link) => {
                const isActive = activeLink === link.id;
                return (<button key={link.id} type="button" onClick={(e) => {
                        e.currentTarget.blur();
                        handleLinkClick(link);
                    }} aria-current={isActive ? "location" : undefined} className={`flex items-center justify-between text-left no-underline font-sans text-[14px] uppercase tracking-[0.14em] py-4 border-b border-[#F3EFE7]/[0.08] transition-colors duration-200 motion-reduce:transition-none cursor-pointer ${isActive
                        ? "text-[#F3EFE7] font-medium"
                        : "text-[#F3EFE7]/75 [@media(hover:hover)]:hover:text-[#F3EFE7] focus-visible:text-[#F3EFE7]"}`}>
                      <span className="nav-underline-label py-0.5">
                        {link.label}
                      </span>
                      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full transition-opacity duration-200 motion-reduce:transition-none ${isActive ? "bg-[#F3EFE7] opacity-100" : "opacity-0"}`}/>
                    </button>);
            })}
              </div>

              <div className="pt-8">
                <button type="button" onClick={(e) => {
                e.currentTarget.blur();
                closeMobileMenu(false);
                openWaitlist();
            }} aria-label="Join the waitlist" className="nav-underline inline-flex items-center py-1 bg-transparent border-0 no-underline text-[#F3EFE7]/90 [@media(hover:hover)]:hover:text-[#F3EFE7] focus-visible:text-[#F3EFE7] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F3EFE7]/70 focus-visible:outline-offset-4 font-sans text-[13px] font-medium uppercase tracking-[0.14em] transition-colors duration-250 motion-reduce:transition-none cursor-pointer">
                  Join the Waitlist
                </button>
              </div>
            </motion.nav>
          </div>)}
      </AnimatePresence>
    </>);
}
