/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        "idf-olive": {
          50: "#f7f8f5",
          100: "#eef0e8",
          200: "#dde1d1",
          300: "#c7d0b4",
          400: "#b0bf97",
          500: "#9aae7a",
          600: "#7d8c62",
          700: "#606a4a",
          800: "#434832",
          900: "#26261a",
          950: "#13130d",
        },
        "idf-gold": {
          50: "#fffdf2",
          100: "#fffbe6",
          200: "#fff7cc",
          300: "#fff0b3",
          400: "#ffe999",
          500: "#ffd700",
          600: "#e6c200",
          700: "#ccad00",
          800: "#b39900",
          900: "#998500",
          950: "#806b00",
        },
      },
      boxShadow: {
        "glass-olive": "0 8px 32px 0 rgba(154, 174, 134, 0.2)",
        "glass-gold": "0 8px 32px 0 rgba(255, 209, 51, 0.2)",
      },
      backdropBlur: {
        glass: "8px",
      },
    },
  },
  plugins: [],
};
