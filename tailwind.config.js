/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark fintech palette
        "void":       "#0A0A0F",
        "glass":      "rgba(18,18,26,0.82)",
        "surface":    "#12121A",
        "violet":     "#7C5CFC",
        "violet-lt":  "#9171FD",
        "violet-dim": "rgba(124,92,252,0.12)",
        "teal-dim":   "#22D3EE",
        "orange-dim": "#F97316",
        "muted":      "#8A8A9A",
        // Keep legacy
        offwhite: "#F9F9F7",
        charcoal: "#0F0F0F",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "18px",
        "3xl": "24px",
      },
      backdropBlur: {
        glass: "16px",
      },
      boxShadow: {
        glow:      "0 0 32px rgba(124,92,252,0.20), 0 4px 24px rgba(0,0,0,0.6)",
        "glow-sm": "0 0 16px rgba(124,92,252,0.14)",
        "glow-lg": "0 0 56px rgba(124,92,252,0.28), 0 8px 40px rgba(0,0,0,0.7)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
