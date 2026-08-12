import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        gold: { DEFAULT: "#C9A84C", light: "#E5C878", dark: "#9A7B2E" },
        pearl: "#F5F0E8",
        cinnabar: "#C41E24",
        indigo2: "#1A2A3A",
      },
      fontFamily: {
        fa: ["var(--font-vazir)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
        latin: ["var(--font-montserrat)", "sans-serif"],
        zh: ["var(--font-noto-sc)", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 24s linear infinite",
        float: "float 6s ease-in-out infinite",
        pulse2: "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
