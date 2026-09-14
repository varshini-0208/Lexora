import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
          950: "#0c0a09",
        },
        brand: {
          50: "#f0f4fd",
          100: "#e1e9fb",
          200: "#c4d5f8",
          500: "#3b68f5",
          600: "#234fe0",
          700: "#1b3eb5",
          900: "#14296e",
        },
        risk: {
          low: {
            bg: "#ecfdf5",
            border: "#a7f3d0",
            text: "#065f46",
            badge: "#10b981",
          },
          moderate: {
            bg: "#fffbeb",
            border: "#fde68a",
            text: "#92400e",
            badge: "#f59e0b",
          },
          high: {
            bg: "#fff1f2",
            border: "#fecdd3",
            text: "#9f1239",
            badge: "#f43f5e",
          },
          critical: {
            bg: "#450a0a",
            border: "#991b1b",
            text: "#fecaca",
            badge: "#ef4444",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Merriweather", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        elevated: "0 12px 32px -4px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
