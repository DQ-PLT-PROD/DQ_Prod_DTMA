/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Colors for map markers and categories - Keeping legacy safelist
    "bg-primary-100",
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
        // Material Design 3 Color Roles
        primary: {
          DEFAULT: "#0030E3", // Primary
          on: "#FFFFFF",      // On Primary
          container: "#DDE3FF",
          "on-container": "#000E44",
        },
        secondary: {
          DEFAULT: "#1839AD",
          on: "#FFFFFF",
          container: "#DDE1FF", // Calculated approximate
          "on-container": "#00115A",
        },
        tertiary: {
          DEFAULT: "#76517B", // Example tertiary
          on: "#FFFFFF",
          container: "#FFD7F6",
          "on-container": "#2D0D32",
        },
        error: {
          DEFAULT: "#BA1A1A",
          on: "#FFFFFF",
          container: "#FFDAD6",
          "on-container": "#410002",
        },
        background: {
          DEFAULT: "#FEFBFF",
          on: "#1B1B1F",
        },
        surface: {
          DEFAULT: "#FEFBFF", // Surface
          on: "#1B1B1F",      // On Surface
          variant: "#E3E2E6", // Surface Variant
          "on-variant": "#45464F", // On Surface Variant
          "container-lowest": "#FFFFFF",
          "container-low": "#F7F2FA",
          container: "#F3EDF7",
          "container-high": "#ECE6F0",
          "container-highest": "#E6E0E9",
        },
        outline: {
          DEFAULT: "#767680",
          variant: "#C6C6CA",
        },
        scrim: "#000000",
        inverse: {
          surface: "#303034",
          on: "#F3F0F4",
          primary: "#B6C4FF",
        },
        // Legacy Brand Palette (Mapped for backward compatibility)
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
        // Legacy Support
        teal: { DEFAULT: "#00E5D1", dark: "#00665C", light: "#99FFF5" },
        purple: { DEFAULT: "#954BF9", dark: "#4F2E80", light: "#C499FF" },
      },
      fontFamily: {
        // M3 Typography Scale
        display: ["Roboto", "sans-serif"],
        headline: ["Roboto", "sans-serif"],
        title: ["Roboto", "sans-serif"],
        body: ["Roboto", "sans-serif"],
        label: ["Roboto", "sans-serif"],
      },
      fontSize: {
        // M3 Type Scale
        "display-lg": ["3.5625rem", { lineHeight: "4rem", letterSpacing: "-0.015625rem" }], // 57px
        "display-md": ["2.8125rem", { lineHeight: "3.25rem", letterSpacing: "0rem" }],      // 45px
        "display-sm": ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "0rem" }],        // 36px

        "headline-lg": ["2rem", { lineHeight: "2.5rem", letterSpacing: "0rem" }],           // 32px
        "headline-md": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "0rem" }],       // 28px
        "headline-sm": ["1.5rem", { lineHeight: "2rem", letterSpacing: "0rem" }],           // 24px

        "title-lg": ["1.375rem", { lineHeight: "1.75rem", letterSpacing: "0rem" }],         // 22px
        "title-md": ["1rem", { lineHeight: "1.5rem", letterSpacing: "0.009375rem" }],       // 16px
        "title-sm": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.00625rem" }],   // 14px

        "body-lg": ["1rem", { lineHeight: "1.5rem", letterSpacing: "0.03125rem" }],         // 16px
        "body-md": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.015625rem" }],   // 14px
        "body-sm": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.025rem" }],          // 12px

        "label-lg": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.00625rem", fontWeight: "500" }], // 14px
        "label-md": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.03125rem", fontWeight: "500" }],     // 12px
        "label-sm": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.03125rem", fontWeight: "500" }],   // 11px
      },
      borderRadius: {
        // M3 Shape System
        none: "0px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "28px",
        full: "9999px",
      },
      boxShadow: {
        // M3 Elevation (approximations using Tailwind shadows)
        "elevation-1": "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)",
        "elevation-2": "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)",
        "elevation-3": "0px 1px 3px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)",
        "elevation-4": "0px 2px 3px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)",
        "elevation-5": "0px 4px 4px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)",
      },
      transitionTimingFunction: {
        // M3 Easing
        standard: "cubic-bezier(0.2, 0.0, 0, 1.0)",
        emphasized: "cubic-bezier(0.2, 0.0, 0, 1.0)",
        decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1.0)",
        accelerate: "cubic-bezier(0.4, 0.0, 1.0, 1.0)",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
