import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0B0C",
          surface: "#121214",
          elevated: "#18181B",
        },
        parchment: {
          DEFAULT: "#EDE8DF",
          muted: "rgba(237, 232, 223, 0.65)",
          faint: "rgba(237, 232, 223, 0.25)",
        },
        theme: {
          bg: "var(--theme-bg, #0B0B0C)",
          text: "var(--theme-text, #EDE8DF)",
          accent: "var(--theme-accent, #E8A33D)",
          glow: "var(--theme-glow, rgba(232, 163, 61, 0.35))",
          border: "var(--theme-border, rgba(237, 232, 223, 0.12))",
          muted: "var(--theme-text-muted, rgba(237, 232, 223, 0.65))",
        },
        // Dedicated Stone Worlds
        citrine: {
          bg: "#2A1A05",
          accent: "#E8A33D",
          glow: "rgba(232, 163, 61, 0.35)",
        },
        rosequartz: {
          bg: "#2B1518",
          accent: "#E9B4B8",
          glow: "rgba(233, 180, 184, 0.35)",
        },
        amethyst: {
          bg: "#170F24",
          accent: "#A98BD9",
          glow: "rgba(169, 139, 217, 0.35)",
        },
        tigereye: {
          bg: "#1E1308",
          accent: "#C68A3E",
          glow: "rgba(198, 138, 62, 0.35)",
        },
        sunstone: {
          bg: "#2A0F07",
          accent: "#F0773A",
          glow: "rgba(240, 119, 58, 0.35)",
        },
        sodalite: {
          bg: "#0A1426",
          accent: "#4F7BD8",
          glow: "rgba(79, 123, 216, 0.35)",
        },
        selenite: {
          bg: "#E9E6E1",
          text: "#0B0B0C",
          accent: "#8F8B84",
          glow: "rgba(255, 255, 255, 0.4)",
        },
      },
      fontFamily: {
        "hero-display": ["var(--font-archivo)", "var(--font-unbounded)", "sans-serif"],
        "hero-ui": ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
        display: ["var(--font-archivo)", "var(--font-unbounded)", "sans-serif"],
        serif: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        "dial-mono": ["var(--font-mono)", "JetBrains Mono", "monospace"],
        "ui-label": ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        "editorial-wide": "0.2em",
        "editorial-widest": "0.26em",
        "tight-display": "-0.035em",
        "tight-editorial": "-0.02em",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "slow-spin": "spin 40s linear infinite",
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        "drift-soft": "driftSoft 18s ease-in-out infinite alternate",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.65" },
        },
        driftSoft: {
          "0%": { transform: "translate(0px, 0px)" },
          "100%": { transform: "translate(15px, -15px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
