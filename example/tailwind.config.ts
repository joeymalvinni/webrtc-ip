import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        bg: "#15141b",
        text: "#EDECEE",
        sub: "#9A95A6",
        green: "#61FFCA",
        orange: "#FFCA85",
        gray: "#6D6D6D",
        mutedgray: "#9893A5"
      }
    },
  },
  plugins: [],
};
export default config;
