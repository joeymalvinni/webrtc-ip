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
            colors: {
                primary: '#D8FF4A',
                primary_hovered: "#E5FF6E",
                secondary: "rgba(232, 232, 227, 0.06)",
                secondary_hovered: "rgba(232, 232, 227, 0.1)",
                dark_gray: "rgba(232, 232, 227, 0.3)",
                ink: {
                    900: '#08080A',
                    800: '#0E0E10',
                    700: '#131317',
                    600: '#1A1A1F',
                    500: '#22222A',
                    400: '#2D2D37',
                },
                bone: '#E8E8E3',
                acid: '#D8FF4A',
                ember: '#FF6B3D',
            },
            fontFamily: {
                fraunces: ["var(--font-fraunces)"],
                instrument: ["var(--font-instrument)"],
                ibm: ["var(--font-ibm)"],
                mono: ["var(--font-ibm)", "ui-monospace", "monospace"],
                hack: ["var(--font-hack)"],
            },
            backgroundImage: {
                'grid-fine': "linear-gradient(rgba(232,232,227,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,232,227,0.04) 1px, transparent 1px)",
                'noise': "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(12px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "marquee": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
                "pulse-dot": {
                    "0%, 100%": { opacity: "1", transform: "scale(1)" },
                    "50%": { opacity: "0.5", transform: "scale(0.85)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-up": "fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
                "fade-in": "fade-in 1.2s ease-out both",
                "marquee": "marquee 40s linear infinite",
                "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
