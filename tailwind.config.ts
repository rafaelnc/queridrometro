import type { Config } from "tailwindcss";

/**
 * Tema "Kabaret do Rhadonym": as escalas slate/purple/sky são remapeadas
 * para a paleta da identidade (marrom queimado → creme, magenta, amarelo),
 * assim todas as páginas herdam o visual sem trocar cada classe.
 */
const kabaretInk = {
  50: "#fff8f0",
  100: "#fdf0e0",
  200: "#f8e2c8",
  300: "#f0c9a3",
  400: "#e0a77c",
  500: "#c07f55",
  600: "#93502c",
  700: "#71361a",
  800: "#4d200c",
  900: "#2f1105",
  950: "#1d0902",
};

const kabaretPink = {
  50: "#fff0f6",
  100: "#ffd9e8",
  200: "#ffb3d0",
  300: "#ff8fb8",
  400: "#ff5f9a",
  500: "#f0287a",
  600: "#e8125c",
  700: "#b80d48",
  800: "#8a0a37",
  900: "#5c0624",
  950: "#3a0316",
};

const kabaretYellow = {
  50: "#fffbea",
  100: "#fff3c4",
  200: "#ffe99a",
  300: "#ffdc6b",
  400: "#ffc400",
  500: "#f5b400",
  600: "#d99a00",
  700: "#a87400",
  800: "#7a5400",
  900: "#4d3500",
  950: "#2e2000",
};

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        slate: kabaretInk,
        purple: kabaretPink,
        sky: kabaretYellow,
        "querido-purple": "#e8125c",
        "querido-orange": "#ff6a00",
        kabaret: {
          orange: "#ff6a00",
          burnt: "#e4540f",
          red: "#f24a0c",
          yellow: "#ffc400",
          pink: "#e8125c",
          cream: "#fdf0e0",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      animation: {
        "scroll-slow": "scroll 40s linear infinite",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
