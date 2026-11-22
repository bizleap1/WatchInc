"use client";

/**
 * Hero — scroll-driven watch showcase modelled on czard.com.
 * The section is pinned (sticky) while the user scrolls through it; every
 * ~100vh of scroll moves to the next watch. Each change crossfades a
 * full-bleed scene, swaps the giant serif name, and turns the watch in 3D.
 * Within a slide the watch keeps rotating slightly with scroll for depth.
 *
 * Per-watch scenes: set `bgSrc` on each entry. Until bespoke scenes exist,
 * every watch uses the pavilion, colour-graded with its stone accent.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { getPieceById } from "@/data/collection";
import dynamic from "next/dynamic";

const SkyBackground = dynamic(() => import("./SkyBackground"), { ssr: false, loading: () => null });


const DEFAULT_BG = "/images/hero/architectural-pavilion.webp";

const HERO_WATCHES = [
  { id: "overflow", name: "OVERFLOW", stone: "Citrine", tagline: "Worn for abundance.", frontSrc: "/watches/overflow/front.webp", sideSrc: "/watches/overflow/diagonal.webp", spin: { dir: "/watches/overflow/spin", count: 92 }, accent: "#D9A441", bgSrc: "/images/hero/scenes/overflow.webp" },
  { id: "cherish", name: "CHERISH", stone: "Rose Quartz", tagline: "Worn for the love you give yourself.", frontSrc: "/watches/cherish/front.webp", sideSrc: "/watches/cherish/diagonal.webp", spin: { dir: "/watches/cherish/spin", count: 92 }, accent: "#D9939E", bgSrc: "/images/hero/scenes/cherish.webp" },
  { id: "hush", name: "HUSH", stone: "Amethyst", tagline: "Worn for a quieter mind.", frontSrc: "/watches/hush/front.webp", sideSrc: "/watches/hush/diagonal.webp", spin: { dir: "/watches/hush/spin", count: 92 }, accent: "#9B84C4", bgSrc: "/images/hero/scenes/hush.webp" },
  { id: "ascent", name: "ASCENT", stone: "Tiger's Eye", tagline: "Worn for the next step up.", frontSrc: "/watches/ascent/front.webp", sideSrc: "/watches/ascent/diagonal.webp", spin: { dir: "/watches/ascent/spin", count: 92 }, accent: "#B9813B", bgSrc: "/images/hero/scenes/ascent.webp" },
  { id: "wildfire", name: "WILDFIRE", stone: "Sunstone", tagline: "Worn to be seen.", frontSrc: "/watches/wildfire/front.webp", sideSrc: "/watches/wildfire/diagonal.webp", spin: { dir: "/watches/wildfire/spin", count: 92 }, accent: "#E07A4F", bgSrc: "/images/hero/scenes/wildfire.webp" },
  { id: "cadence", name: "CADENCE", stone: "Sodalite", tagline: "Worn for words that land.", frontSrc: "/watches/cadence/front.webp", sideSrc: "/watches/cadence/diagonal.webp", spin: { dir: "/watches/cadence/spin", count: 89 }, accent: "#5B7FC4", bgSrc: "/images/hero/scenes/cadence.webp" },
];

const EASE = [0.16, 1, 0.3, 1];
const BROWN = "#3B2914";
const CREAM = "#FFF6E6";
const TOTAL = HERO_WATCHES.length;

/* ---------- Golden sparkle trail orbiting the watch ---------- */
function SparkleTrail({ color = "#F3D9A4", active = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const particles = [];
    let t = 0;

    const tick = () => {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const rx = w * 0.42;
      const ry = h * 0.46;

      // Spawn new particles at the head of the comet trail
      for (let i = 0; i < 3; i++) {
        const a = t * 1.6 + Math.random() * 0.05;
        particles.push({
          x: cx + Math.cos(a) * rx + (Math.random() - 0.5) * 8,
          y: cy + Math.sin(a) * ry * Math.cos(a * 0.5) + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.25,
          vy: Math.random() * 0.35,
          life: 1,
          size: Math.random() * 1.6 + 0.4,
        });
      }

      ctx.globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.011;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life * 0.9;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (Math.random() < 0.03) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(p.x - 0.5, p.y - 3, 1, 6);
          ctx.fillRect(p.x - 3, p.y - 0.5, 6, 1);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color, active]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ---------- Real turntable frames: one full 360° turn per appearance ---------- */
const SPIN_MS = 1800;
// Flip to false if the watch should turn the other way relative to the background slide
const SPIN_REVERSE = true;
const spinCache = new Map(); // dir -> Promise<HTMLImageElement[]>

function loadSpin(spin) {
  if (spinCache.has(spin.dir)) return spinCache.get(spin.dir);
  const p = Promise.all(
    Array.from({ length: spin.count }, (_, i) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = `${spin.dir}/${String(i).padStart(3, "0")}.webp`;
      return img.decode().then(() => img).catch(() => img);
    })
  );
  spinCache.set(spin.dir, p);
  return p;
}

// Load the first watch's frames on their own, then the others one watch at a time,
// so the opening spin isn't stuck in a queue behind ~500 other images.
let preloadStarted = false;
function preloadAllSpins(list) {
  if (preloadStarted) return;
  preloadStarted = true;
  const withSpin = list.filter((w) => w.spin);
  withSpin.reduce((chain, w) => chain.then(() => loadSpin(w.spin)), Promise.resolve());
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function SpinSequence({ spin, dir = 1, play = true, alt, delay = 0 }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const framesRef = useRef(null);

  const draw = (img) => {
    const c = canvasRef.current;
    if (!c || !img) return;
    const ctx = c.getContext("2d");
    if (c.width !== img.naturalWidth) { c.width = img.naturalWidth; c.height = img.naturalHeight; }
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0);
  };

  useEffect(() => {
    let alive = true;
    loadSpin(spin).then((frames) => {
      if (!alive) return;
      framesRef.current = frames;
      draw(frames[0]);
      setReady(true);
    });
    return () => { alive = false; };
  }, [spin]);

  // Smooth ease-in-out turn that starts once the watch has faded in and all frames are decoded
  useEffect(() => {
    if (!play || !ready) return;
    const frames = framesRef.current;
    const n = frames.length;
    let raf = 0;
    let start = 0;
    let last = -1;
    const t0 = setTimeout(() => {
      start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / SPIN_MS);
        let i = Math.round(easeInOut(t) * n) % n;
        const turnBack = SPIN_REVERSE ? dir > 0 : dir < 0;
        if (turnBack) i = (n - i) % n;
        if (i !== last) { draw(frames[i]); last = i; }
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t0); cancelAnimationFrame(raf); };
  }, [play, ready, dir, delay]);

  return (
    <>
      {/* Crisp front frame shows instantly while the rest decode */}
      {!ready && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${spin.dir}/000.webp`} alt={alt} draggable={false}
          className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]" />
      )}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </>
  );
}

/* ---------- In-scene brand intro (CSS-driven so it plays the moment the page paints) ---------- */
function BrandIntro({ onDone }) {
  const words = ["Six", "stones.", "Six", "intentions."];
  return (
    <motion.div
      key="intro"
      onClick={onDone}
      initial={false}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: EASE } }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 cursor-pointer"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(10,8,5,0.55)_0%,rgba(10,8,5,0.25)_60%,rgba(10,8,5,0.1)_100%)]" />
      <p
        className="wi-intro-kicker relative font-sans uppercase text-[12px] md:text-[14px] pl-[0.5em]"
        style={{ color: CREAM, textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
      >
        Watch Inc
      </p>
      <h1 className="relative mt-6 flex flex-wrap justify-center gap-x-[0.26em] font-serif font-normal leading-[1.05] text-[clamp(44px,7.4vw,112px)] text-center">
        {words.map((w, i) => (
          <span key={i} className="overflow-hidden inline-block pb-[0.1em]">
            <span
              className="wi-intro-word inline-block"
              style={{ color: CREAM, textShadow: "0 2px 30px rgba(0,0,0,0.45)", animationDelay: `${0.1 + i * 0.1}s` }}
            >
              {w}
            </span>
          </span>
        ))}
      </h1>
      <span aria-hidden="true" className="wi-intro-line relative mt-8 block h-px w-28 md:w-40" style={{ backgroundColor: "rgba(255,246,230,0.6)" }} />
      <style>{`
        @keyframes wiWord { from { transform: translateY(110%); } to { transform: translateY(0); } }
        @keyframes wiKicker { from { opacity: 0; letter-spacing: 0.9em; } to { opacity: 0.9; letter-spacing: 0.5em; } }
        @keyframes wiLine { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }
        .wi-intro-word { transform: translateY(110%); animation: wiWord 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .wi-intro-kicker { opacity: 0; letter-spacing: 0.9em; animation: wiKicker 1.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .wi-intro-line { transform: scaleX(0); animation: wiLine 1.2s 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
    </motion.div>
  );
}

// Survives client-side navigation (so the intro doesn't repeat when coming back
// to the homepage) but resets on a real reload.
let introShownThisLoad = false;

/* ---------- Scroll-pinned watch worlds ---------- */
export default function ArchitecturalHero() {
  const reduced = useReducedMotion();
  const setInspectedPiece = useStore((s) => s.setInspectedPiece);
  const sectionRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const indexRef = useRef(0);
  const busyRef = useRef(false);
  const [turning, setTurning] = useState(false);

  // ---- Brand intro: ~2.4s on every fresh page load, any gesture skips it ----
  const [introDone, setIntroDone] = useState(introShownThisLoad);
  const introDoneRef = useRef(introShownThisLoad);
  const finishIntro = useCallback(() => {
    if (introDoneRef.current) return;
    introDoneRef.current = true;
    introShownThisLoad = true;
    setIntroDone(true);
  }, []);
  useEffect(() => {
    if (introDoneRef.current) return;
    // Reloaded further down the page? The browser restores that spot — no intro then.
    const skipIfScrolled = () => { if (window.scrollY > 60) finishIntro(); };
    skipIfScrolled();
    const t1 = setTimeout(skipIfScrolled, 120);
    const t2 = setTimeout(skipIfScrolled, 400);
    window.addEventListener("scroll", skipIfScrolled, { passive: true, once: true });
    // Measured from page load (not from when JS hydrated), so slow loads don't stretch the intro
    const remaining = Math.max(700, 2800 - performance.now());
    const t = setTimeout(finishIntro, remaining);
    return () => {
      clearTimeout(t); clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener("scroll", skipIfScrolled);
    };
  }, [finishIntro]);

  const watch = HERO_WATCHES[index];

  // Change watch. Wraps around (Cadence → Overflow) and ignores clicks while a turn is playing.
  const go = useCallback((i, dir) => {
    if (busyRef.current) return;
    const nextIndex = ((i % TOTAL) + TOTAL) % TOTAL;
    if (nextIndex === indexRef.current) return;
    busyRef.current = true;
    setTurning(true);
    setDirection(dir);
    indexRef.current = nextIndex;
    setIndex(nextIndex);
    setTimeout(() => setTurning(false), SPIN_MS - 150);
    setTimeout(() => { busyRef.current = false; }, SPIN_MS + 150);
  }, []);

  const next = useCallback(() => go(indexRef.current + 1, 1), [go]);
  const prev = useCallback(() => go(indexRef.current - 1, -1), [go]);
  const goTo = useCallback((i) => go(i, i > indexRef.current ? 1 : -1), [go]);

  // ---- Gentle autoplay: a new watch every 8s until the visitor does anything ----
  const AUTOPLAY_MS = 4000;
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const stop = () => setAutoplay(false);
    const opts = { passive: true, once: true };
    window.addEventListener("wheel", stop, opts);
    window.addEventListener("touchstart", stop, opts);
    window.addEventListener("keydown", stop, opts);
    window.addEventListener("pointerdown", stop, opts);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
    };
  }, [autoplay]);

  useEffect(() => {
    if (!autoplay || !introDone || reduced) return;
    const t = setInterval(() => {
      // only while the hero is on screen and the tab is visible
      const r = sectionRef.current?.getBoundingClientRect();
      const visible = r && r.bottom > window.innerHeight * 0.5 && r.top < window.innerHeight * 0.5;
      if (visible && document.visibilityState === "visible") next();
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [autoplay, introDone, reduced, next]);

  // Swipe left/right and the ←/→ keys change watch; vertical scrolling is never blocked
  useEffect(() => {
    let sx = null, sy = null;
    const onTouchStart = (e) => {
      if (!sectionRef.current?.contains(e.target)) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      sx = sy = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) (dx < 0 ? next : prev)();
    };
    const onKey = (e) => {
      const el = document.activeElement;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const r = sectionRef.current?.getBoundingClientRect();
      if (!r || r.bottom < window.innerHeight * 0.4) return; // hero not in view
      if (!introDoneRef.current) { finishIntro(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [next, prev, finishIntro]);

  // Any scroll while the intro is up just lifts the intro (page still scrolls normally)
  useEffect(() => {
    if (introDone) return;
    const lift = () => finishIntro();
    window.addEventListener("wheel", lift, { passive: true, once: true });
    window.addEventListener("touchmove", lift, { passive: true, once: true });
    return () => {
      window.removeEventListener("wheel", lift);
      window.removeEventListener("touchmove", lift);
    };
  }, [introDone, finishIntro]);

  const discover = () => {
    const piece = getPieceById(watch.id);
    if (piece) setInspectedPiece(piece);
  };

  // Decode every watch's spin frames in the background
  useEffect(() => { preloadAllSpins(HERO_WATCHES); }, []);

  // Preload watch images
  useEffect(() => {
    HERO_WATCHES.forEach((w) => {
      [w.frontSrc, w.sideSrc].forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Watch Inc — the six stones"
      aria-roledescription="carousel"
      className="relative w-full h-[100svh] min-h-[560px] bg-[#0A0A0B]"
    >
      <div className="relative h-full w-full overflow-hidden select-none">
        {/* ===== World background: crossfade + slow push-in ===== */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.22, filter: "blur(14px) brightness(0.7)" }}
          animate={introDone ? { scale: 1, filter: "blur(0px) brightness(1)" } : { scale: 1.08, filter: "blur(3px) brightness(0.85)" }}
          transition={{ duration: introDone ? 1.4 : 2.8, ease: EASE }}
        >
          {/* Czard-style 360° room turn: current scene on the front of a sphere, next behind */}
          {/* Instant plain image (preloaded by Next) — visible during the intro and until the 3D view is ready */}
          <Image
            src={HERO_WATCHES[0].bgSrc}
            alt=""
            aria-hidden="true"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <SkyBackground
            scenes={HERO_WATCHES.map((w) => w.bgSrc)}
            index={index}
            direction={direction}
            duration={SPIN_MS}
          />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[52%] md:h-[26%] bg-gradient-to-b from-[rgba(10,8,5,0.6)] via-[rgba(10,8,5,0.38)] md:from-[rgba(10,8,5,0.45)] md:via-transparent to-transparent pointer-events-none" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-[rgba(10,8,5,0.4)] to-transparent pointer-events-none" />

        </motion.div>

        {/* ===== Foreground (appears once the intro lifts) ===== */}
        <motion.div
          initial={false}
          animate={{ opacity: introDone ? 1 : 0, y: introDone ? 0 : 24 }}
          transition={{ duration: 1, delay: introDone ? 0.35 : 0, ease: EASE }}
          className="relative z-10 h-full w-full flex flex-col items-center pt-[clamp(140px,26svh,250px)] md:pt-[88px] pb-7 md:pb-9 px-4"
        >
          {/* Giant watch name */}
          <div className="relative w-full h-[clamp(70px,13vh,140px)] flex items-start justify-center">
            <AnimatePresence initial={false}>
              <motion.h2
                key={`title-${watch.id}`}
                initial={{ opacity: 0, y: direction * 18, letterSpacing: "0.4em", filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.22em", filter: "blur(0px)" }}
                exit={{ opacity: 0, y: direction * -18, filter: "blur(6px)" }}
                transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
                className="absolute inset-x-0 top-0 whitespace-nowrap font-serif font-normal uppercase text-center leading-none text-[clamp(40px,5.6vw,80px)] pl-[0.22em]"
                style={{ color: CREAM, textShadow: "0 2px 22px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.55)" }}
              >
                {watch.name}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Watch with 3D turn + sparkle trail */}
          <div className="relative flex-1 w-full flex items-center justify-center" style={{ perspective: 1400 }}>
            <motion.div style={{ transformStyle: "preserve-3d" }} className="relative h-[min(44svh,calc(74svh_-_230px))] md:h-[min(58svh,calc(100svh_-_290px))] max-h-[600px] min-h-[240px] aspect-square">
              <AnimatePresence initial={false}>
                <motion.button
                  key={`watch-${watch.id}`}
                  type="button"
                  onClick={discover}
                  aria-label={`Discover ${watch.name}, ${watch.stone}`}
                  initial={reduced || watch.spin ? { opacity: 0 } : { opacity: 0, rotateY: direction * 75, scale: 0.9, x: direction * 60 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ transformStyle: "preserve-3d", position: "absolute", left: "50%", top: "50%", translate: "-50% -50%" }}
                  className={`block h-[min(44svh,calc(74svh_-_230px))] md:h-[min(58svh,calc(100svh_-_290px))] max-h-[600px] min-h-[240px] cursor-pointer ${watch.spin ? "aspect-[585/760]" : "aspect-[2/3]"}`}
                >
                  {watch.spin ? (
                    <SpinSequence spin={watch.spin} dir={direction} play={!reduced && introDone} alt={`${watch.name} — ${watch.stone} dial watch`} />
                  ) : (
                    <Image
                      src={watch.frontSrc}
                      alt={`${watch.name} — ${watch.stone} dial watch`}
                      fill
                      sizes="(max-width: 768px) 60vw, 320px"
                      className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
                    />
                  )}
                </motion.button>
              </AnimatePresence>
            </motion.div>

            {/* Stone · tagline */}
            <AnimatePresence initial={false}>
              <motion.p
                key={`cap-${watch.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute bottom-0 inset-x-0 text-center whitespace-nowrap font-serif italic text-[17px] md:text-[22px]"
                style={{ color: "#FFF6E6", textShadow: "0 1px 14px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.6)" }}
              >
                {watch.stone} · {watch.tagline}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* ‹ DISCOVER › — fades out while the room turns, returns as the new watch settles */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`controls-${watch.id}`}
              className="mt-6 flex items-center gap-4 md:gap-5"
              initial={{ opacity: 0, y: direction * 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: direction * -18, filter: "blur(6px)", transition: { duration: 0.35, ease: EASE } }}
              transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
              style={{ pointerEvents: turning ? "none" : "auto" }}
            >
              <button
                type="button"
                onClick={prev}
                aria-label="Previous watch"
                className="w-10 h-10 md:w-11 md:h-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:bg-[#FFF6E6]/10 disabled:opacity-35 cursor-pointer disabled:cursor-default"
                style={{ borderColor: "rgba(255,246,230,0.55)", color: CREAM, backgroundColor: "rgba(59,41,20,0.35)" }}
              >
                <ChevronLeft size={16} strokeWidth={1.4} />
              </button>
              <button
                type="button"
                onClick={discover}
                className="rounded-full font-sans font-semibold uppercase text-[12px] tracking-[0.16em] px-[35px] py-[13.6px] transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98] cursor-pointer"
                style={{ backgroundColor: "rgba(59,41,20,0.88)", color: CREAM }}
              >
                Discover
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next watch"
                className="w-10 h-10 md:w-11 md:h-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:bg-[#FFF6E6]/10 disabled:opacity-35 cursor-pointer disabled:cursor-default"
                style={{ borderColor: "rgba(255,246,230,0.55)", color: CREAM, backgroundColor: "rgba(59,41,20,0.35)" }}
              >
                <ChevronRight size={16} strokeWidth={1.4} />
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Vertical progress ticks */}
        <nav
          aria-label="Choose a watch"
          className="hidden md:flex absolute right-6 lg:right-9 top-1/2 -translate-y-1/2 z-20 flex-col items-end gap-3"
        >
          {HERO_WATCHES.map((w, i) => {
            const isActive = i === index;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${w.name}, ${w.stone}`}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-center gap-3 py-1 cursor-pointer"
              >
                <span
                  className={`font-sans uppercase text-[9.5px] tracking-[0.22em] transition-opacity duration-300 ${isActive ? "opacity-90" : "opacity-0 group-hover:opacity-70"}`}
                  style={{ color: CREAM }}
                >
                  {w.name}
                </span>
                <span
                  className="block h-px transition-all duration-500"
                  style={{ width: isActive ? 34 : 14, backgroundColor: isActive ? CREAM : "rgba(255,246,230,0.45)" }}
                />
              </button>
            );
          })}
        </nav>

        {/* ===== Brand intro overlay ===== */}
        <AnimatePresence>
          {!introDone && <BrandIntro onDone={finishIntro} />}
        </AnimatePresence>

        {/* Scroll hint on first slide */}
        <AnimatePresence>
          {index === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="hidden md:block absolute inset-x-0 text-center bottom-2 z-20 font-sans uppercase text-[9.5px] tracking-[0.3em]"
              style={{ color: CREAM }}
            >
              Scroll
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}