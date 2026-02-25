/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Colors for map markers and categories
    "bg-primary-100", // Adapted to new system if needed, but keeping legacy safelist for now to prevent breakage
    "bg-blue-100",
    "bg-blue-500",
    "bg-blue-700",
    "text-blue-500",
    "text-blue-700",
    "bg-purple-100",
    "bg-purple-500",
    "bg-purple-700",
    "text-purple-500",
    "text-purple-700",
    "bg-green-100",
    "bg-green-500",
    "bg-green-700",
    "text-green-500",
    "text-green-700",
    "bg-yellow-100",
    "bg-yellow-500",
    "bg-yellow-700",
    "text-yellow-500",
    "text-yellow-700",
    "bg-red-100",
    "bg-red-500",
    "bg-red-700",
    "text-red-500",
    "text-red-700",
    "bg-gray-100",
    "bg-gray-500",
    "bg-gray-700",
    "text-gray-500",
    "text-gray-700",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0030E3", // Digital Blue
          dark: "#002080",
          light: "#99B2FF", // Legacy support
          container: "#DDE3FF",
          "on-container": "#000E44",
        },
        secondary: {
          DEFAULT: "#1839AD",
          dark: "#0F2573",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          variant: "#F3F4F6", // Gray-100
        },
        error: {
          DEFAULT: "#BA1A1A",
          container: "#FFDAD6",
        },
        neutral: {
          900: "#1F2937", // Gray-800: High-emphasis
          700: "#374151", // Gray-700: Medium-emphasis
          500: "#6B7280", // Gray-500: Disabled/Icons
          200: "#E5E7EB", // Gray-200: Borders
          100: "#F3F4F6", // Gray-100: Backgrounds
        },
        // Legacy Brand palette - keeping for backward compatibility but mapped closer to system where possible
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        teal: {
          DEFAULT: "#00E5D1",
          dark: "#00665C",
          light: "#99FFF5",
        },
        purple: {
          DEFAULT: "#954BF9",
          dark: "#4F2E80",
          light: "#C499FF",
        },
      },
      fontFamily: {
        display: ["Roboto", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        body: ["Roboto", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
      boxShadow: {
        "md-1": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)", // shadow-sm equivalent
        "md-2": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // shadow-md equivalent
        "md-3": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)", // shadow-xl equivalent
      },
      zIndex: {
        400: 400,
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
