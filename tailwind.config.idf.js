/**
 * Tailwind CSS configuration with IDF branding colors
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // IDF Brand Colors
        "idf-olive": {
          50: "#f7f8f4",
          100: "#eef0e8",
          200: "#dde1d1",
          300: "#c7d0b8",
          400: "#b0bf9f",
          500: "#9aae86",
          600: "#7d8f6b",
          700: "#606f52",
          800: "#434f39",
          900: "#262f20",
          950: "#191f14",
        },
        "idf-gold": {
          50: "#fffdf7",
          100: "#fff9e6",
          200: "#fff2cc",
          300: "#ffe999",
          400: "#ffdd66",
          500: "#ffd133",
          600: "#e6b800",
          700: "#cc9f00",
          800: "#b38600",
          900: "#996d00",
          950: "#805400",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        "glass-olive": "0 8px 32px 0 rgba(154, 174, 134, 0.2)",
        "glass-gold": "0 8px 32px 0 rgba(255, 209, 51, 0.2)",
        "glass-olive-lg": "0 16px 64px 0 rgba(154, 174, 134, 0.3)",
        "glass-gold-lg": "0 16px 64px 0 rgba(255, 209, 51, 0.3)",
      },
      backdropBlur: {
        glass: "8px",
        "glass-lg": "16px",
      },
      fontFamily: {
        hebrew: ["Arial", "Helvetica", "sans-serif"],
        english: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "glass-glow": "glassGlow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glassGlow: {
          "0%": { boxShadow: "0 8px 32px 0 rgba(154, 174, 134, 0.2)" },
          "100%": { boxShadow: "0 8px 32px 0 rgba(154, 174, 134, 0.4)" },
        },
      },
    },
  },
  plugins: [],
  // Ensure RTL support
  corePlugins: {
    // Enable RTL utilities
    direction: true,
  },
};
