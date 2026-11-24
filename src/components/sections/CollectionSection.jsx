"use client";

/**
 * "Pick your stone." — built on the same layout as lecrec.com's "Pick your pearl." section.
 *
 * Layout (taken from lecrec's CSS):
 * - Section is at least one full screen tall, sand background #F3ECE1.
 * - Everything sits inside a 16:10 "frame" whose width is capped by the screen HEIGHT
 *   (min(100%, 160svh)), so on a normal laptop the stones stay grouped in the middle.
 * - Heading 9.8% from the top, caption 7.1% from the bottom, stones ~9.4% of frame width.
 * - Mobile: tall 392:852 frame, two zig-zag columns.
 * - Live water-light (caustics) animation drawn with a small WebGL shader, like lecrec's canvas.
 *   A static image shows underneath until WebGL is ready (and stays if WebGL is unavailable).
 *   The animation pauses when the section is off screen and respects reduced-motion.
 * - Hover: the stone scales to 1.07. Nothing else changes.
 * - Click (like lecrec): the chosen stone glows and sends out light rings while the rest fade
 *   (0.5s), then a circle "burns" open from the stone to a full-screen film of that watch
 *   (0.8s), the film plays (1.2s), and the product page opens. ~2.5s in total.
 *   Film = `video` below if set (e.g. "/videos/overflow.mp4"); otherwise the watch's own
 *   360° spin frames over its hero scene. Ctrl/Cmd-click or middle-click opens the page normally.
 *
 * Copy comes from the product copy sheet. Keep "worn for" wording — no outcome promises.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

const SAND = "#F3ECE1";

// Click transition timing (ms). Total before the product page opens = CHOOSE + BURN + FILM.
const CHOOSE_MS = 500;
const BURN_MS = 800;
const FILM_MS = 1200;

// x / y = centre of each stone, in % of the frame. desktop = 16:10 frame, mobile = tall frame.
const STONES = [
  { id: "overflow", name: "Overflow", stone: "Citrine", wornFor: "Worn for abundance.", desktop: [17, 44], mobile: [30, 25], accent: "#D9A441", spinCount: 92, video: null },
  { id: "cherish", name: "Cherish", stone: "Rose quartz", wornFor: "Worn for the love you give yourself.", desktop: [30.5, 60], mobile: [71, 33], accent: "#D9939E", spinCount: 92, video: null },
  { id: "hush", name: "Hush", stone: "Amethyst", wornFor: "Worn for a quieter mind.", desktop: [43.5, 41], mobile: [32, 45], accent: "#9B84C4", spinCount: 92, video: null },
  { id: "ascent", name: "Ascent", stone: "Tiger's eye", wornFor: "Worn for the next step up.", desktop: [56.5, 59], mobile: [69, 54], accent: "#B9813B", spinCount: 92, video: null },
  { id: "wildfire", name: "Wildfire", stone: "Sunstone", wornFor: "Worn to be seen.", desktop: [70, 42], mobile: [31, 66], accent: "#E07A4F", spinCount: 92, video: null },
  { id: "cadence", name: "Cadence", stone: "Sodalite", wornFor: "Worn for words that land.", desktop: [83, 57], mobile: [70, 76], accent: "#5B7FC4", spinCount: 89, video: null },
];

// Plain CSS injected as-is (dangerouslySetInnerHTML) so server and browser HTML match exactly.
const PICK_STONE_CSS = `
        .pick-stone { min-height: max(100svh, 560px); }

        .pick-stone__caustics {
          inset: -6%;
          background-image: url("/images/stones/seabed-caustics.webp");
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          opacity: 0.75;
        }
        .pick-stone__canvas {
          position: absolute;
          inset: 0;
          z-index: -15;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.8s ease;
        }
        .pick-stone__canvas.is-live { opacity: 1; }

        /* Mobile frame (lecrec: 392 / 852) */
        .pick-stone__frame {
          width: min(100%, calc(100svh * 392 / 852));
          aspect-ratio: 392 / 852;
          container-type: inline-size;
        }
        .pick-stone__heading {
          top: 11%;
          padding-inline: 6cqw;
          color: #1F1D24;
          font-size: calc(10.2cqw - 2px);
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .pick-stone__caption {
          bottom: 11%;
          padding-inline: 6cqw;
          color: #333541;
          font-size: calc(5.87cqw - 2px);
          line-height: 1.22;
          letter-spacing: -0.01em;
        }
        .pick-stone__stone {
          left: var(--x-m);
          top: var(--y-m);
          width: 22%;
          aspect-ratio: 1 / 1;
          translate: -50% -50%;
        }

        .pick-stone__image {
          filter: drop-shadow(rgba(84, 66, 44, 0.32) 3px 6px 4px) drop-shadow(rgba(118, 96, 66, 0.2) 8px 16px 12px);
          transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pick-stone__link:focus-visible { outline: 2px solid rgba(31, 29, 36, 0.6); outline-offset: 6px; }
        @media (hover: hover) and (pointer: fine) {
          .pick-stone__link:hover .pick-stone__image { transform: scale(1.07); }
        }

        /* Desktop frame (lecrec: 1440 / 900) */
        @media (min-width: 750px) {
          .pick-stone__frame {
            width: min(100%, 160svh);
            aspect-ratio: 1440 / 900;
          }
          .pick-stone__heading { top: 17%; font-size: 4.44cqw; line-height: 1.125; }
          .pick-stone__caption { bottom: 19.5%; font-size: max(1.875cqw, 18px); line-height: 1.26; }
          .pick-stone__stone { left: var(--x-d); top: var(--y-d); width: 9.4%; }
        }

        /* ---- click transition: choosing ---- */
        .pick-stone__heading, .pick-stone__caption, .pick-stone__image {
          transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease, filter 0.5s ease;
        }
        .pick-stone.is-choosing .pick-stone__heading,
        .pick-stone.is-choosing .pick-stone__caption { opacity: 0.12; }
        .pick-stone.is-choosing .pick-stone__stone:not(.is-chosen) .pick-stone__image {
          opacity: 0.28;
          filter: grayscale(0.6) drop-shadow(rgba(84, 66, 44, 0.15) 3px 6px 4px);
        }
        .pick-stone__stone.is-chosen { z-index: 2; }
        .pick-stone__stone.is-chosen .pick-stone__image,
        .pick-stone__stone.is-chosen .pick-stone__link:hover .pick-stone__image {
          transform: scale(1.14);
          filter: drop-shadow(0 0 18px var(--accent)) drop-shadow(rgba(84, 66, 44, 0.3) 3px 6px 6px);
        }
        .pick-stone__ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 14px var(--accent), inset 0 0 10px var(--accent);
          translate: -50% -50%;
          pointer-events: none;
          animation: pickStoneRing 1.1s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes pickStoneRing {
          0%   { transform: scale(1);   opacity: 0.9; }
          100% { transform: scale(4.2); opacity: 0; }
        }

        /* ---- click transition: burn-open film ---- */
        .pick-stone__film {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0A0A0B;
          clip-path: circle(0px at var(--cx) var(--cy));
          animation: pickStoneBurn ${BURN_MS}ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        @keyframes pickStoneBurn {
          to { clip-path: circle(150vmax at var(--cx) var(--cy)); }
        }
        .pick-stone__burn-edge {
          position: fixed;
          z-index: 10000;
          left: var(--cx);
          top: var(--cy);
          width: 300vmax;
          height: 300vmax;
          border-radius: 50%;
          translate: -50% -50%;
          pointer-events: none;
          background: radial-gradient(circle, transparent 48.6%, var(--accent) 49.2%, #fff6e0 49.6%, transparent 50.4%);
          filter: blur(6px);
          transform: scale(0);
          animation: pickStoneEdge ${BURN_MS}ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        @keyframes pickStoneEdge {
          0%   { transform: scale(0);   opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: scale(1);   opacity: 0; }
        }
        .pick-stone__film-scene {
          position: absolute;
          inset: -4%;
          background-size: cover;
          background-position: center;
          animation: pickStoneKen ${BURN_MS + FILM_MS + 600}ms ease-out forwards;
        }
        @keyframes pickStoneKen {
          from { transform: scale(1.12); }
          to   { transform: scale(1.0); }
        }
        .pick-stone__film-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .pick-stone__film-watch {
          position: absolute;
          left: 50%;
          top: 46%;
          height: min(62vh, 120vw);
          aspect-ratio: 585 / 760;
          translate: -50% -50%;
          filter: drop-shadow(0 30px 40px rgba(0, 0, 0, 0.45));
        }
        .pick-stone__film-title {
          position: absolute;
          inset-inline: 0;
          bottom: 9%;
          text-align: center;
          color: #fff;
          opacity: 0;
          animation: pickStoneTitle 0.9s ease ${Math.round(BURN_MS * 0.6)}ms forwards;
        }
        @keyframes pickStoneTitle {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pick-stone__ring, .pick-stone__burn-edge { display: none; }
          .pick-stone__film { animation-duration: 1ms; }
          .pick-stone__image { transition: none; }
        }
      `;


/* ------------------------------------------------------------------ */
/* Live water light — small WebGL shader                               */
/* ------------------------------------------------------------------ */

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

// Classic tileable water-caustic pattern, tinted to the sand palette.
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;

float caustic(vec2 uv, float t) {
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < 5; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 5.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  uv *= 0.62;                                   // size of the light cells
  uv += vec2(sin(uTime * 0.05), cos(uTime * 0.04)) * 0.08;
  float v = caustic(uv, uTime * 0.32 + 23.0);
  v = smoothstep(0.0, 1.0, clamp(v, 0.0, 1.0));
  vec3 shadow = vec3(0.925, 0.890, 0.838);      // shaded sand
  vec3 light  = vec3(1.000, 0.992, 0.968);      // bright water light
  gl_FragColor = vec4(mix(shadow, light, v), 1.0);
}
`;

function CausticsCanvas() {
  const ref = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return undefined; // static image stays as fallback

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return undefined;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return undefined;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");

    // Render at reduced resolution — the pattern is soft, and this keeps phones cool.
    const SCALE = 0.5;
    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      const h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = false;
    let last = 0;
    const start = performance.now();

    const draw = (now) => {
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now) => {
      raf = 0;
      if (!visible) return;
      if (now - last > 33) { // ~30 fps is plenty for slow water
        draw(now);
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };

    draw(start);
    setLive(true);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduced && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    return () => {
      io.disconnect();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`pick-stone__canvas${live ? " is-live" : ""}`} />;
}


/* ------------------------------------------------------------------ */
/* Full-screen film shown after a stone is chosen                      */
/* ------------------------------------------------------------------ */

const spinFrames = new Map(); // id -> Promise<HTMLImageElement[]>
function preloadSpin(stone) {
  if (!stone || stone.video || spinFrames.has(stone.id)) return spinFrames.get(stone?.id);
  const p = Promise.all(
    Array.from({ length: stone.spinCount }, (_, i) => new Promise((resolve) => {
      const img = new window.Image();
      img.onload = img.onerror = () => resolve(img);
      img.src = `/watches/${stone.id}/spin/${String(i).padStart(3, "0")}.webp`;
    }))
  );
  spinFrames.set(stone.id, p);
  return p;
}

function SpinFilm({ stone }) {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    let alive = true;
    preloadSpin(stone).then((frames) => {
      const canvas = ref.current;
      if (!alive || !canvas || !frames.length) return;
      const ctx = canvas.getContext("2d");
      canvas.width = frames[0].naturalWidth || 585;
      canvas.height = frames[0].naturalHeight || 760;
      const start = performance.now();
      const fps = 36;
      const tick = (now) => {
        const f = frames[Math.floor(((now - start) / 1000) * fps) % frames.length];
        if (f && f.complete && f.naturalWidth) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(f, 0, 0, canvas.width, canvas.height);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [stone]);
  return (
    <div className="pick-stone__film-watch">
      {/* first frame shows instantly while the rest load */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/watches/${stone.id}/spin/000.webp`} alt="" className="absolute inset-0 w-full h-full object-contain" />
      <canvas ref={ref} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

function StoneFilm({ stone, cx, cy }) {
  return (
    <>
      <div
        className="pick-stone__film"
        style={{ "--cx": `${cx}px`, "--cy": `${cy}px` }}
        role="dialog"
        aria-label={`Opening ${stone.name}`}
      >
        {stone.video ? (
          <video className="pick-stone__film-video" src={stone.video} autoPlay muted playsInline preload="auto" />
        ) : (
          <>
            <div className="pick-stone__film-scene" style={{ backgroundImage: `url("/images/hero/scenes/${stone.id}.webp")` }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(0,0,0,0.45) 100%)" }} />
            <SpinFilm stone={stone} />
          </>
        )}
        <div className="pick-stone__film-title">
          <p className="m-0 font-serif text-[clamp(40px,6vw,84px)] tracking-[0.12em] leading-none">{stone.name.toUpperCase()}</p>
          <p className="mt-3 mb-0 font-serif italic text-[clamp(17px,1.6vw,22px)] opacity-90">{stone.wornFor}</p>
        </div>
      </div>
      <div className="pick-stone__burn-edge" style={{ "--cx": `${cx}px`, "--cy": `${cy}px`, "--accent": stone.accent }} />
    </>
  );
}

export default function PickStoneSection() {
  const router = useRouter();
  const { lenis } = useSmoothScroll();
  // phase: null -> "choosing" -> "film"
  const [chosen, setChosen] = useState(null); // { stone, cx, cy, phase }
  const timers = useRef([]);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    document.documentElement.style.removeProperty("overflow");
    lenis?.start?.();
  }, [lenis]);

  const choose = useCallback((e, stone) => {
    // Let Ctrl/Cmd/Shift/middle-click open the page the normal way.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (chosen) return;
    const href = `/watch/${stone.id}`;
    router.prefetch(href);
    preloadSpin(stone);

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    lenis?.stop?.();
    document.documentElement.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chooseMs = reduced ? 0 : CHOOSE_MS;
    const total = reduced ? 600 : CHOOSE_MS + BURN_MS + FILM_MS;

    setChosen({ stone, cx, cy, phase: "choosing" });
    timers.current.push(setTimeout(() => setChosen((c) => c && { ...c, phase: "film" }), chooseMs));
    timers.current.push(setTimeout(() => router.push(href), total));
  }, [chosen, lenis, router]);

  return (
    <section
      id="collection"
      aria-labelledby="pick-stone-heading"
      className={`pick-stone relative isolate grid place-items-center overflow-clip${chosen ? " is-choosing" : ""}`}
      style={{ backgroundColor: SAND }}
    >
      {/* Water light drifting over the sand */}
      <div aria-hidden="true" className="pick-stone__caustics absolute -z-20" />
      <CausticsCanvas />
      {/* Fade top and bottom into plain sand */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: `linear-gradient(180deg, ${SAND} 0%, transparent 20%, transparent 80%, ${SAND} 100%)` }}
      />

      <div className="pick-stone__frame relative">
        <h2 id="pick-stone-heading" className="pick-stone__heading absolute inset-x-0 m-0 text-center font-serif font-normal">
          Pick your stone.
        </h2>

        <ul className="m-0 p-0 list-none">
          {STONES.map((s) => (
            <li
              key={s.id}
              className={`pick-stone__stone absolute${chosen?.stone.id === s.id ? " is-chosen" : ""}`}
              style={{
                "--accent": s.accent,
                "--x-d": `${s.desktop[0]}%`,
                "--y-d": `${s.desktop[1]}%`,
                "--x-m": `${s.mobile[0]}%`,
                "--y-m": `${s.mobile[1]}%`,
              }}
            >
              <Link
                href={`/watch/${s.id}`}
                aria-label={`${s.name}, ${s.stone}. ${s.wornFor}`}
                className="pick-stone__link block w-full h-full rounded-full"
                onClick={(e) => choose(e, s)}
                onPointerEnter={() => preloadSpin(s)}
              >
                {chosen?.stone.id === s.id && (
                  <>
                    <span className="pick-stone__ring" />
                    <span className="pick-stone__ring" style={{ animationDelay: "0.16s" }} />
                    <span className="pick-stone__ring" style={{ animationDelay: "0.32s" }} />
                  </>
                )}
                <Image
                  src={`/images/stones/${s.id}.webp`}
                  alt={`${s.stone} stone`}
                  fill
                  sizes="(min-width: 750px) 140px, 25vw"
                  className="pick-stone__image object-contain select-none"
                  draggable={false}
                />
              </Link>
            </li>
          ))}
        </ul>

        <p className="pick-stone__caption absolute inset-x-0 m-0 text-center font-serif italic">
          Choose a stone.
          <br />
          Discover its story.
        </p>
      </div>

      {/* Portal to <body> so the film covers the navbar too */}
      {chosen?.phase === "film" &&
        createPortal(<StoneFilm stone={chosen.stone} cx={chosen.cx} cy={chosen.cy} />, document.body)}

      <style dangerouslySetInnerHTML={{ __html: PICK_STONE_CSS }} />
    </section>
  );
}