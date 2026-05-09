import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        tropical: {
          lime:   "#b5f542",
          yellow: "#fde047",
          orange: "#fb923c",
          pink:   "#f472b6",
          teal:   "#2dd4bf",
        },
        surface: {
          DEFAULT: "#0f0a1a",
          subtle:  "#1a1028",
          card:    "#221638",
          border:  "#3a2658",
          hover:   "#2e1f4a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body:    ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        glow:       "0 0 30px -5px rgba(168, 85, 247, 0.5)",
        "glow-sm":  "0 0 12px -3px rgba(168, 85, 247, 0.4)",
        "glow-lime":"0 0 30px -5px rgba(181, 245, 66, 0.4)",
        card:       "0 4px 24px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #581c87 0%, #3b0764 50%, #0f0a1a 100%)",
        "gradient-tropical":
          "linear-gradient(135deg, #b5f542 0%, #2dd4bf 100%)",
        "gradient-card":
          "linear-gradient(145deg, rgba(58,38,88,0.6) 0%, rgba(34,22,56,0.8) 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(168,85,247,0.3)" },
          "50%":      { boxShadow: "0 0 40px rgba(168,85,247,0.7)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to:   { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "fade-in":   "fade-in 0.4s ease-out forwards",
        "slide-up":  "slide-up 0.4s ease-out forwards",
        "pulse-glow":"pulse-glow 2s ease-in-out infinite",
        float:       "float 3s ease-in-out infinite",
        shimmer:     "shimmer 2s linear infinite",
      },
      screens: {
        xs:  "375px",
        sm:  "640px",
        md:  "768px",
        lg:  "1024px",
        xl:  "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};

export default config;
