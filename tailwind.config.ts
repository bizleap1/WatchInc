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
          DEFAULT: "#F3EFE7",
          muted: "rgba(243, 239, 231, 0.65)",
          faint: "rgba(243, 239, 231, 0.25)",
        },
        ivory: {
          DEFAULT: "#F3EFE7",
          muted: "rgba(243, 239, 231, 0.68)",
          faint: "rgba(243, 239, 231, 0.14)",
        },
        theme: {
          bg: "var(--theme-bg, #0A0A0B)",
          text: "var(--theme-text, #F3EFE7)",
          accent: "var(--theme-accent, #F3EFE7)",
          glow: "var(--theme-glow, rgba(243, 239, 231, 0.16))",
          border: "var(--theme-border, rgba(243, 239, 231, 0.12))",
          muted: "var(--theme-text-muted, rgba(243, 239, 231, 0.62))",
        },
        // Dedicated Stone Worlds (Muted Mineral Panels)
        citrine: {
          bg: "#2A1A05",
          accent: "#B58E4A",
          glow: "rgba(181, 142, 74, 0.28)",
        },
        rosequartz: {
          bg: "#2B1518",
          accent: "#B88B90",
          glow: "rgba(184, 139, 144, 0.28)",
        },
        amethyst: {
          bg: "#170F24",
          accent: "#8C7BA8",
          glow: "rgba(140, 123, 168, 0.28)",
        },
        tigereye: {
          bg: "#1E1308",
          accent: "#A3794B",
          glow: "rgba(163, 121, 75, 0.28)",
        },
        sunstone: {
          bg: "#2A0F07",
          accent: "#BF7352",
          glow: "rgba(191, 115, 82, 0.28)",
        },
        sodalite: {
          bg: "#0A1426",
          accent: "#5F7AA8",
          glow: "rgba(95, 122, 168, 0.28)",
        },
        selenite: {
          bg: "#ECEAE6",
          text: "#0A0A0B",
          accent: "#8F8B84",
          glow: "rgba(243, 239, 231, 0.35)",
        },
      },
      fontFamily: {
        "hero-display": ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        "hero-ui": ["var(--font-sans)", "Jost", "-apple-system", "sans-serif"],
        display: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Jost", "-apple-system", "sans-serif"],
        mono: ["var(--font-sans)", "Jost", "-apple-system", "sans-serif"],
        "dial-mono": ["var(--font-sans)", "Jost", "-apple-system", "sans-serif"],
        "ui-label": ["var(--font-sans)", "Jost", "-apple-system", "sans-serif"],
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
