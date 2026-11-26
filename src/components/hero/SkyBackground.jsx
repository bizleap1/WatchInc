"use client";

/**
 * SkyBackground — the czard.com "turn your head" transition.
 *
 * The camera sits inside a sphere. The current scene is mapped on the front half, the next
 * scene on the back half. Changing watch rotates the view 180° (left or right), so one room
 * turns away while the next turns into view, through a short dark passage between them.
 * At rest the front image is shown exactly like `object-fit: cover`.
 *
 * Props
 *   scenes     – array of image URLs, one per watch
 *   index      – which scene is showing
 *   direction  – +1 (next) or -1 (previous); decides which way the room turns
 *   duration   – turn time in ms (keep in sync with the watch spin)
 */

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D texA;   // front scene
  uniform sampler2D texB;   // scene behind the camera
  uniform float uRot;       // view rotation (0 = front, ±PI = back)
  uniform vec2 uHalf;       // half extent of the image in tan-space (cover fit)
  varying vec3 vDir;
  #define PI 3.14159265359

  vec3 sampleSide(sampler2D t, vec3 d) {
    // perspective-correct planar projection onto the image in front of the camera;
    // beyond the image edges the last pixels stretch out and fade into a dark passage
    if (d.z >= 0.0) return vec3(0.0);
    vec2 p = vec2(d.x, d.y) / -d.z;
    vec2 uv = p / uHalf * 0.5 + 0.5;
    vec2 o = max(abs(uv - 0.5) - 0.5, 0.0);
    float beyond = max(o.x, o.y);
    vec3 c = texture2D(t, clamp(uv, 0.0, 1.0)).rgb;
    return c * (1.0 - smoothstep(0.0, 1.2, beyond));
  }

  void main() {
    vec3 d = normalize(vDir);
    float c = cos(uRot), s = sin(uRot);
    d = vec3(c * d.x - s * d.z, d.y, s * d.x + c * d.z);

    float lon = atan(d.x, -d.z);            // 0 = straight ahead of the front scene
    vec3 a = sampleSide(texA, d);
    vec3 b = sampleSide(texB, vec3(-d.x, d.y, -d.z));

    // soft crossfade across the 90° seam, darkened like a passing wall
    float w = 1.0 - smoothstep(PI * 0.5 - 0.32, PI * 0.5 + 0.32, abs(lon));
    vec3 col = mix(b, a, w);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function SkyBackground({ scenes, index, direction = 1, duration = 1000, className = "" }) {
    // The canvas is only shown while a turn is playing; at rest the hero's plain <img> shows the scene.
    const [visible, setVisible] = React.useState(false);
    const hostRef = useRef(null);
    const stateRef = useRef(null);

    // ---- one-time setup ----
    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";
        renderer.domElement.style.visibility = "hidden";
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.set(0, 0, 0);

        const loader = new THREE.TextureLoader();
        const textures = scenes.map((src) => {
            const t = loader.load(src, (tx) => {
                st.imgAspect[src] = tx.image.width / tx.image.height;
                st.fit();
                st.dirty = true;
            });
            t.colorSpace = THREE.SRGBColorSpace;
            t.wrapS = THREE.ClampToEdgeWrapping;
            t.wrapT = THREE.ClampToEdgeWrapping;
            t.minFilter = THREE.LinearFilter;
            t.generateMipmaps = false;
            t.anisotropy = renderer.capabilities.getMaxAnisotropy();
            return t;
        });

        const uniforms = {
            texA: { value: textures[index] },
            texB: { value: textures[index] },
            uRot: { value: 0 },
            uHalf: { value: new THREE.Vector2(1, 1) },
        };
        const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide, depthWrite: false });
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 96, 48), mat));

        const st = {
            renderer, camera, scene, uniforms, textures,
            current: index, anim: null, dirty: true, raf: 0, imgAspect: {},
            w: 0,
            h: 0,
            fit() {
                // cover-fit the image to the viewport, in tan-space
                const ty = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
                const tx = ty * camera.aspect;
                const ia = st.imgAspect[scenes[st.current]] || 16 / 9;
                if (tx / ty > ia) uniforms.uHalf.value.set(tx, tx / ia);
                else uniforms.uHalf.value.set(ty * ia, ty);
                st.dirty = true;
            },
            resize() {
                const w = host.clientWidth;
                const h = host.clientHeight;
                if (w < 10 || h < 10) return; // not laid out yet — the ResizeObserver will call again
                // Only touch the canvas size when the viewport really changed — resizing a canvas
                // wipes it for a frame, which showed up as a flicker while scenes were loading.
                if (w !== st.w || h !== st.h) {
                    st.w = w;
                    st.h = h;
                    renderer.setSize(w, h, false);
                    camera.aspect = w / h;
                    camera.updateProjectionMatrix();
                }
                st.fit();
            },
        };
        stateRef.current = st;

        const loop = (now) => {
            if (st.anim) {
                const t = Math.min(1, (now - st.anim.start) / st.anim.duration);
                uniforms.uRot.value = st.anim.to * easeInOut(t);
                st.dirty = true;
                if (t >= 1) {
                    // settle: the new scene becomes the front, view resets
                    uniforms.texA.value = textures[st.anim.target];
                    uniforms.uRot.value = 0;
                    st.anim = null;
                    st.hideAfterRender = true; // draw the settled frame, then hand back to the <img>
                }
            }
            if (st.dirty && st.w >= 10) {
                renderer.render(scene, camera);
                st.dirty = false;
                renderer.domElement.style.visibility = "visible";
                if (st.hideAfterRender) {
                    st.hideAfterRender = false;
                    setVisible(false);
                }
            }
            st.raf = requestAnimationFrame(loop);
        };
        st.raf = requestAnimationFrame(loop);

        const ro = new ResizeObserver(() => st.resize());
        ro.observe(host);
        st.resize();

        return () => {
            cancelAnimationFrame(st.raf);
            ro.disconnect();
            textures.forEach((t) => t.dispose());
            mat.dispose();
            renderer.dispose();
            renderer.domElement.remove();
            stateRef.current = null;
        };
        // scenes are static for the lifetime of the hero
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- turn to a new scene whenever index changes ----
    useEffect(() => {
        const st = stateRef.current;
        if (!st || index === st.current) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (st.anim) st.uniforms.texA.value = st.textures[st.anim.target]; // finish any turn in progress
        st.uniforms.texB.value = st.textures[index];
        st.current = index;
        if (reduced) {
            st.uniforms.texA.value = st.textures[index];
            st.uniforms.uRot.value = 0;
            st.anim = null;
        } else {
            st.uniforms.uRot.value = 0;
            st.anim = { start: performance.now(), duration, to: direction > 0 ? Math.PI : -Math.PI, target: index };
            // only take over from the <img> if the canvas has a real size and the scenes are loaded
            if (st.w >= 10 && st.textures[index].image && st.uniforms.texA.value.image) setVisible(true);
        }
        st.resize();
    }, [index, direction, duration]);

    return (
        <div
            ref={hostRef}
            aria-hidden="true"
            className={`absolute inset-0 ${className}`}
            style={{ opacity: visible ? 1 : 0 }}
        />
    );
}