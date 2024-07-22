import type { Config } from "tailwindcss"

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
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
    plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
