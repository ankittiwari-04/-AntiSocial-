/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#050508",
          900: "#0a0a0f",
          800: "#111118",
          700: "#1a1a24",
          600: "#222230",
          500: "#2a2a3a",
        },
        brand: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
        purple: {
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        "gradient-card": "linear-gradient(145deg, #1a1a24 0%, #111118 100%)",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(99,102,241,0.3)",
        "glow-sm": "0 0 10px rgba(99,102,241,0.2)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-up": "slideUp 0.3s ease forwards",
        "bounce-heart": "bounceHeart 0.3s ease",
        shimmer: "shimmer 1.5s infinite",
        "pulse-ring": "pulseRing 2s infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        bounceHeart: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.4)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseRing: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};
