import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0c",
          soft: "#0f1014",
          card: "#15171d",
          elev: "#1c1f26",
        },
        ink: {
          DEFAULT: "#f5f5f0",
          dim: "#a1a1a8",
          mute: "#65656d",
          ghost: "#3a3a40",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          soft: "rgba(255,255,255,0.05)",
          strong: "rgba(255,255,255,0.14)",
        },
        accent: {
          DEFAULT: "#c8ff00",
          warm: "#ff5c2e",
        },
        verdict: {
          legit: "#5cff9e",
          susp: "#ffc83d",
          scam: "#ff4d4d",
        },
      },
      fontFamily: {
        sans: ["var(--font-sora)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: { tightest: "-0.05em" },
      animation: {
        "pulse-dot": "pulseDot 1.6s ease-in-out infinite",
        "fade-up": "fadeUp .6s ease-out both",
        "shimmer": "shimmer 2.4s linear infinite",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: ".4", transform: "scale(1.4)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
