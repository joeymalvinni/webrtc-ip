import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#504EC2',
                primary_hovered: "#4644B7",
                secondary: "rgb(34, 33, 41, 0.5)",
                secondary_hovered: "rgb(33, 31, 39, 0.4)",
                dark_gray: "rgb(255, 255, 255, 0.3)",
            },
            fontFamily: {
                poppins: ["var(--font-poppins)"],
                ibm: ["var(--font-ibm)"],
                hack: ["var(--font-hack)"],
            }
        },
    },
    plugins: [],
};
export default config;
