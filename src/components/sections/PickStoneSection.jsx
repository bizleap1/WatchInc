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
 *   (0.8s), the film plays (4s the first time in a visit, 0.7s after that), then /watches opens on that watch with its side detail
 *   drawer already sliding open (HeroSlider reads ?open=<id>). ~4.3s before the page changes.
 *   Clicking the film or pressing Esc skips straight to the product page.
 *   Film = `video` below if set (e.g. "/videos/overflow.mp4", made in Google Flow / Veo, cropped to
 *   remove the watermark, 1280x720, no audio, ~1 MB); otherwise the watch's own
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
const CHOOSE_MS = 650;
const BURN_MS = 1100;
const FILM_MS = 6000;       // first film in a visit: plays this long before the product page opens (video is ~8s)
const FILM_SHORT_MS = 6000; // later films in the same visit. Set lower (e.g. 700) to shorten repeat films.
const FILM_SEEN_KEY = "wi-film-seen"; // sessionStorage flag

// x / y = centre of each stone, in % of the frame. desktop = 16:10 frame, mobile = tall frame.
const STONES = [
  { id: "overflow", name: "Overflow", stone: "Citrine", wornFor: "Worn for abundance.", desktop: [17, 44], mobile: [30, 25], accent: "#D9A441", spinCount: 92, video: "/videos/overflow.mp4", poster: "/videos/overflow-poster.jpg", titlePos: "top-left", focus: "50% 100%" },
  { id: "cherish", name: "Cherish", stone: "Rose quartz", wornFor: "Worn for the love you give yourself.", desktop: [30.5, 60], mobile: [71, 33], accent: "#D9939E", spinCount: 92, video: "/videos/cherish.mp4", poster: "/videos/cherish-poster.jpg", titlePos: "bottom-left", focus: "50% 55%" },
  { id: "hush", name: "Hush", stone: "Amethyst", wornFor: "Worn for a quieter mind.", desktop: [43.5, 41], mobile: [32, 45], accent: "#9B84C4", spinCount: 92, video: "/videos/hush.mp4", poster: "/videos/hush-poster.jpg", titlePos: "bottom-left", focus: "50% 70%" },
  { id: "ascent", name: "Ascent", stone: "Tiger's eye", wornFor: "Worn for the next step up.", desktop: [56.5, 59], mobile: [69, 54], accent: "#B9813B", spinCount: 92, video: "/videos/ascent.mp4", poster: "/videos/ascent-poster.jpg", titlePos: "top-left", focus: "50% 60%" },
  { id: "wildfire", name: "Wildfire", stone: "Sunstone", wornFor: "Worn to be seen.", desktop: [70, 42], mobile: [31, 66], accent: "#E07A4F", spinCount: 92, video: "/videos/wildfire.mp4", poster: "/videos/wildfire-poster.jpg", titlePos: "top-left", focus: "50% 50%" },
  { id: "cadence", name: "Cadence", stone: "Sodalite", wornFor: "Worn for words that land.", desktop: [83, 57], mobile: [70, 76], accent: "#5B7FC4", spinCount: 89, video: "/videos/cadence.mp4", poster: "/videos/cadence-poster.jpg", titlePos: "top-left", focus: "50% 60%" },
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
          width: 27%;
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
          .pick-stone__stone { left: var(--x-d); top: var(--y-d); width: 13%; }
        }

        /* ---- click transition: choosing (like lecrec) ----
           The page washes into a soft cream haze, the other stones blur and fade,
           the chosen stone glows white and sends soft water-light ripples outward. */
        .pick-stone__heading, .pick-stone__caption, .pick-stone__image {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease, filter 0.6s ease;
        }
        .pick-stone__wash {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(circle at var(--cx, 50%) var(--cy, 50%),
            rgba(255, 253, 248, 0.25) 0%, rgba(247, 242, 233, 0.72) 38%, rgba(245, 239, 229, 0.82) 100%);
          -webkit-backdrop-filter: blur(2.5px) saturate(0.75);
          backdrop-filter: blur(2.5px) saturate(0.75);
          opacity: 0;
          transition: opacity 0.65s ease;
        }
        .pick-stone.is-choosing .pick-stone__wash { opacity: 1; }
        .pick-stone.is-choosing .pick-stone__heading,
        .pick-stone.is-choosing .pick-stone__caption { opacity: 0.3; }
        .pick-stone__stone.is-chosen { z-index: 2; }
        .pick-stone__stone.is-chosen .pick-stone__image,
        .pick-stone__stone.is-chosen .pick-stone__link:hover .pick-stone__image {
          transform: scale(1.06);
          filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 42px rgba(255, 250, 236, 0.75));
        }
        .pick-stone__ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 110%;
          height: 110%;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 0 18px rgba(255, 255, 255, 0.55), inset 0 0 12px rgba(255, 255, 255, 0.4);
          filter: blur(1.5px);
          translate: -50% -50%;
          pointer-events: none;
          opacity: 0;
          animation: pickStoneRing 1.9s cubic-bezier(0.2, 0.6, 0.3, 1) infinite;
        }
        @keyframes pickStoneRing {
          0%   { transform: scale(1);   opacity: 0; }
          15%  { opacity: 0.85; }
          100% { transform: scale(5.5); opacity: 0; }
        }

        /* ---- click transition: burn-open film ----
           A WebGL canvas (.pick-stone__burn) "melts" the chosen stone into an organic,
           smoky-edged opening that grows to fill the screen with the film. The real film
           layer (.pick-stone__film) is revealed underneath once the opening is complete.
           Without WebGL the film opens with a simple circle instead (.is-clip). */
        .pick-stone__burn {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 10000;
          pointer-events: none;
        }
        .pick-stone__film {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0A0A0B;
          opacity: 0;
          pointer-events: none;
        }
        .pick-stone__film.is-shown { opacity: 1; pointer-events: auto; }
        .pick-stone__film.is-clip {
          opacity: 1;
          pointer-events: auto;
          clip-path: circle(0px at var(--cx) var(--cy));
          animation: pickStoneBurn ${BURN_MS}ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        @keyframes pickStoneBurn {
          to { clip-path: circle(150vmax at var(--cx) var(--cy)); }
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
        .pick-stone__film { cursor: pointer; }
        .pick-stone__skip {
          position: absolute;
          right: 28px;
          bottom: 24px;
          z-index: 2;
          padding: 8px 16px;
          border: 1px solid rgba(255, 255, 255, 0.55);
          border-radius: 999px;
          color: #fff;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(6px);
          opacity: 0;
          animation: pickStoneTitle 0.5s ease ${BURN_MS + 300}ms forwards;
        }
        .pick-stone__film-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* On screens wider than 16:9, crop from the sky, never from the watch at the bottom */
          object-position: 50% 100%;
        }
        .pick-stone__film-title.is-top { bottom: auto; top: 10%; text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35); }
        .pick-stone__film-title.is-bottom-left {
          bottom: 9%;
          left: 6%;
          right: auto;
          text-align: left;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
        }
        .pick-stone__film-title.is-top-left {
          bottom: auto;
          top: 12%;
          left: 6%;
          right: auto;
          text-align: left;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
        }
        @media (max-width: 749px) {
          .pick-stone__film-title.is-bottom-left,
          .pick-stone__film-title.is-top-left { left: 0; right: 0; text-align: center; }
        }
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
          animation: pickStoneTitle 0.9s ease ${BURN_MS + 150}ms forwards;
        }
        @keyframes pickStoneTitle {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pick-stone__ring { display: none; }
          .pick-stone__film.is-clip { animation-duration: 1ms; }
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
const warmedVideos = new Set();
function preloadSpin(stone) {
  // Stones with a film: warm the browser cache so the video starts instantly on click.
  if (stone?.video) {
    if (!warmedVideos.has(stone.video)) {
      warmedVideos.add(stone.video);
      fetch(stone.video).catch(() => { });
      const poster = new window.Image();
      poster.src = stone.poster || "";
    }
    return undefined;
  }
  if (!stone || spinFrames.has(stone.id)) return spinFrames.get(stone?.id);
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

/* ------------------------------------------------------------------ */
/* Burn-open: WebGL "melt" from the stone into the film (like lecrec)  */
/* ------------------------------------------------------------------ */

const BURN_FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uRes;      // canvas size (px)
uniform vec2 uC;        // centre of the chosen stone (px, GL coords)
uniform float uR;       // current opening radius (in screen heights)
uniform float uT;       // time (s), keeps the smoky edge alive
uniform float uTexA;    // texture aspect ratio
uniform float uFocusY;  // which part of a too-tall film stays visible: 0 = top, 1 = bottom (like CSS object-position)

float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * vn(p); p *= 2.03; a *= 0.5; }
  return v / 0.875;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 d = (fc - uC) / uRes.y;
  float dist = length(d);
  float ang = atan(d.y, d.x);

  // Soft, rounded, slowly boiling edge (smoke / ink bloom, not torn paper)
  float n = fbm(vec2(cos(ang), sin(ang)) * 1.1 + d * 1.3 + uT * 0.4);
  float edge = uR * (1.0 + (n - 0.5) * 0.6);
  float feather = 0.05 + 0.09 * min(uR, 1.0);
  float inside = 1.0 - smoothstep(edge - feather, edge + feather * 0.25, dist);
  float rim = smoothstep(edge - feather * 2.2, edge - feather * 0.2, dist) * inside;   // glowing inner edge
  float halo = (1.0 - smoothstep(edge, edge + 0.26, dist)) * (1.0 - inside);         // soft light outside

  // Film texture, "cover" fit, cropped the same way as the <video> (object-position = stone.focus)
  vec2 s = fc / uRes;
  float A = uRes.x / uRes.y;
  float k = uTexA / A; // visible height fraction on screens wider than the film
  vec2 uv = A > uTexA ? vec2(s.x, s.y * k + (1.0 - k) * (1.0 - uFocusY)) : vec2(0.5 + (s.x - 0.5) * (A / uTexA), s.y);
  vec3 tex = texture2D(uTex, uv).rgb;

  // While still small the opening is smoky and dim, it clears as it grows
  float clear = smoothstep(0.06, 0.45, uR);
  tex = mix(mix(vec3(0.34, 0.31, 0.29), tex, 0.3), tex, clear);

  vec3 light = vec3(1.0, 0.99, 0.965);
  vec3 col = mix(tex, light, rim * 0.85);
  float a = max(inside, halo * 0.8);
  gl_FragColor = vec4(col * inside + light * halo * 0.8 * (1.0 - inside), a); // premultiplied
}
`;

function BurnCanvas({ cx, cy, startRadius, focusY = 1, duration, getSource, onDone, onFail }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const fail = () => onFail();
    if (!canvas) return undefined;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) { fail(); return undefined; }
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, BURN_FRAG);
    if (!vs || !fs) { fail(); return undefined; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { fail(); return undefined; }
    gl.useProgram(prog);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 18, 16, 255]));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const u = (name) => gl.getUniformLocation(prog, name);
    const uRes = u("uRes"), uC = u("uC"), uR = u("uR"), uT = u("uT"), uTexA = u("uTexA");
    gl.uniform1f(u("uFocusY"), focusY);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uC, cx * dpr, (window.innerHeight - cy) * dpr);
    let texA = 16 / 9;

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const start = performance.now();
    let raf = 0;
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const src = getSource();
      if (src) {
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
          const w = src.videoWidth || src.naturalWidth || src.width;
          const h = src.videoHeight || src.naturalHeight || src.height;
          if (w && h) texA = w / h;
        } catch (err) { /* frame not ready yet */ }
      }
      gl.uniform1f(uTexA, texA);
      gl.uniform1f(uR, startRadius + (2.6 - startRadius) * ease(t));
      gl.uniform1f(uT, (now - start) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (t < 1) raf = requestAnimationFrame(frame);
      else onDone();
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <canvas ref={ref} className="pick-stone__burn" aria-hidden="true" />;
}

function StoneFilm({ stone, cx, cy, startRadius, onSkip }) {
  const videoRef = useRef(null);
  const stillRef = useRef(null); // poster (film) or scene image (spin fallback) for the first frames
  const [mode, setMode] = useState("burning"); // "burning" | "shown" | "clip"

  useEffect(() => {
    const img = new window.Image();
    img.src = stone.video ? stone.poster || "" : `/images/hero/scenes/${stone.id}.webp`;
    stillRef.current = img;
  }, [stone]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onSkip(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  const getSource = useCallback(() => {
    const v = videoRef.current;
    if (v && v.readyState >= 2) return v;
    const img = stillRef.current;
    return img && img.complete && img.naturalWidth ? img : null;
  }, []);

  return (
    <>
      <div
        className={`pick-stone__film${mode === "shown" ? " is-shown" : mode === "clip" ? " is-clip" : ""}`}
        style={{ "--cx": `${cx}px`, "--cy": `${cy}px` }}
        role="dialog"
        aria-label={`Opening ${stone.name}`}
        onClick={onSkip}
      >
        {stone.video ? (
          <>
            <video ref={videoRef} className="pick-stone__film-video" src={stone.video} poster={stone.poster} autoPlay muted playsInline preload="auto" style={{ objectPosition: stone.focus || "50% 100%" }} />
            {/* darken behind the title so white text stays readable on bright footage */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  {
                    top: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.18) 26%, transparent 42%)",
                    "top-left": "linear-gradient(160deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.18) 28%, transparent 50%)",
                    "bottom-left": "linear-gradient(20deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 28%, transparent 50%)",
                  }[stone.titlePos || "top"],
              }}
            />
          </>
        ) : (
          <>
            <div className="pick-stone__film-scene" style={{ backgroundImage: `url("/images/hero/scenes/${stone.id}.webp")` }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(0,0,0,0.45) 100%)" }} />
            <SpinFilm stone={stone} />
          </>
        )}
        <span className="pick-stone__skip">Skip</span>
        {/* Title placement is set per film (titlePos) so it never covers the watch; spin fallback uses bottom-centre */}
        <div className={`pick-stone__film-title${stone.video ? ` is-${stone.titlePos || "top"}` : ""}`}>
          <p className="m-0 font-serif text-[clamp(40px,6vw,84px)] tracking-[0.12em] leading-none">{stone.name.toUpperCase()}</p>
          <p className="mt-3 mb-0 font-serif italic text-[clamp(17px,1.6vw,22px)] opacity-90">{stone.wornFor}</p>
        </div>
      </div>
      {mode === "burning" && (
        <BurnCanvas
          cx={cx}
          cy={cy}
          startRadius={startRadius}
          focusY={parseFloat(String(stone.focus || "50% 100%").split(" ")[1] ?? "100") / 100}
          duration={BURN_MS}
          getSource={getSource}
          onDone={() => setMode("shown")}
          onFail={() => setMode("clip")}
        />
      )}
    </>
  );
}

export default function PickStoneSection() {
  const router = useRouter();
  const { lenis } = useSmoothScroll();
  // phase: null -> "choosing" -> "film"
  const [chosen, setChosen] = useState(null); // { stone, cx, cy, phase }
  const timers = useRef([]);
  const sectionRef = useRef(null);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    document.documentElement.style.removeProperty("overflow");
    lenis?.start?.();
  }, [lenis]);

  // Freeze the film's last frame on a cover that outlives this page. HeroSlider on /watches
  // opens the detail drawer behind it, then wipes the cover away from the left, so the
  // product page slides in straight out of the film — no black screen, no slider hero in between.
  const goToProduct = useCallback((href) => {
    if (!document.getElementById("wi-deeplink-cover")) {
      const cover = document.createElement("div");
      cover.id = "wi-deeplink-cover";
      cover.setAttribute("aria-hidden", "true");
      cover.style.cssText =
        "position:fixed;inset:0;z-index:100000;background:#0A0A0B center/cover no-repeat;pointer-events:none;clip-path:inset(0 0 0 0)";
      // Snapshot the current video frame so the cover looks exactly like the paused film.
      const video = document.querySelector(".pick-stone__film-video");
      if (video && video.videoWidth) {
        try {
          const c = document.createElement("canvas");
          c.width = video.videoWidth;
          c.height = video.videoHeight;
          c.getContext("2d").drawImage(video, 0, 0, c.width, c.height);
          cover.style.backgroundImage = `url("${c.toDataURL("image/jpeg", 0.9)}")`;
          cover.style.backgroundPosition = getComputedStyle(video).objectPosition || "50% 100%";
        } catch (err) { /* keep the dark cover */ }
        // Keep the film playing on the cover: a copy of the video continues from the same moment
        // (the file is already cached). The snapshot above shows until the copy is playing.
        const film = document.createElement("video");
        film.muted = true;
        film.playsInline = true;
        film.setAttribute("playsinline", "");
        film.preload = "auto";
        film.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${getComputedStyle(video).objectPosition || "50% 100%"
          };opacity:0`;
        const startAt = video.currentTime;
        film.addEventListener("loadedmetadata", () => { film.currentTime = startAt; }, { once: true });
        film.addEventListener("playing", () => { film.style.opacity = "1"; }, { once: true });
        film.src = video.currentSrc || video.src;
        film.play().catch(() => { });
        cover.appendChild(film);
      }
      document.body.appendChild(cover);
      // Safety net: never leave the screen covered if the next page fails to pick it up.
      setTimeout(() => cover.remove(), 5000);
    }
    router.push(href);
  }, [router]);

  const choose = useCallback((e, stone) => {
    // Let Ctrl/Cmd/Shift/middle-click open the page the normal way.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (chosen) return;
    const href = `/watches?open=${stone.id}`;
    router.prefetch(href);
    preloadSpin(stone);

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const sec = sectionRef.current?.getBoundingClientRect();
    const sx = sec ? cx - sec.left : cx;
    const sy = sec ? cy - sec.top : cy;
    const startRadius = (rect.width / 2) / window.innerHeight; // opening starts at the stone's size

    lenis?.stop?.();
    document.documentElement.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chooseMs = reduced ? 0 : CHOOSE_MS;
    // Full film the first time in this visit; a short one after, so comparing watches stays quick.
    let seen = false;
    try {
      seen = sessionStorage.getItem(FILM_SEEN_KEY) === "1";
      sessionStorage.setItem(FILM_SEEN_KEY, "1");
    } catch (err) { /* storage blocked: treat as first visit */ }
    const total = reduced ? 600 : CHOOSE_MS + BURN_MS + (seen ? FILM_SHORT_MS : FILM_MS);

    setChosen({ stone, cx, cy, sx, sy, startRadius, phase: "choosing", href });
    timers.current.push(setTimeout(() => setChosen((c) => c && { ...c, phase: "film" }), chooseMs));
    timers.current.push(setTimeout(() => goToProduct(href), total));
  }, [chosen, lenis, router, goToProduct]);

  // Skip the rest of the film and open the product page now.
  const skip = useCallback(() => {
    if (!chosen?.href) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    goToProduct(chosen.href);
  }, [chosen, goToProduct]);

  return (
    <section
      id="collection"
      aria-labelledby="pick-stone-heading"
      ref={sectionRef}
      className={`pick-stone relative isolate grid place-items-center overflow-clip${chosen ? " is-choosing" : ""}`}
      style={{
        backgroundColor: SAND,
        ...(chosen ? { "--cx": `${chosen.sx}px`, "--cy": `${chosen.sy}px` } : null),
      }}
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

      {/* Cream haze that washes over everything except the chosen stone */}
      <div aria-hidden="true" className="pick-stone__wash" />

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
                href={`/watches?open=${s.id}`}
                aria-label={`${s.name}, ${s.stone}. ${s.wornFor}`}
                className="pick-stone__link block w-full h-full rounded-full"
                onClick={(e) => choose(e, s)}
                onPointerEnter={() => preloadSpin(s)}
              >
                {chosen?.stone.id === s.id && (
                  <>
                    <span className="pick-stone__ring" />
                    <span className="pick-stone__ring" style={{ animationDelay: "0.6s" }} />
                    <span className="pick-stone__ring" style={{ animationDelay: "1.2s" }} />
                  </>
                )}
                <Image
                  src={`/images/stones/${s.id}.webp`}
                  alt={`${s.stone} stone`}
                  fill
                  sizes="(min-width: 750px) 200px, 30vw"
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
        createPortal(<StoneFilm stone={chosen.stone} cx={chosen.cx} cy={chosen.cy} startRadius={chosen.startRadius} onSkip={skip} />, document.body)}

      <style dangerouslySetInnerHTML={{ __html: PICK_STONE_CSS }} />
    </section>
  );
}