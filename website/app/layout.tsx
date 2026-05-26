import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

const fraunces = Fraunces({
    subsets: ["latin"],
    weight: ['300', '400', '500', '600', '700', '900'],
    variable: "--font-fraunces",
});
const instrument = Instrument_Serif({ subsets: ["latin"], weight: ['400'], style: ['normal', 'italic'], variable: "--font-instrument" });
const ibm = IBM_Plex_Mono({ subsets: ["latin"], weight: ['300', '400', '500', '700'], variable: "--font-ibm" });
const hack = localFont({
    src: [
        {
            path: '../public/hack/Hack-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../public/hack/Hack-Bold.ttf',
            weight: '700',
            style: 'bold',
        },
    ],
    variable: '--font-hack'
})

export const metadata: Metadata = {
    title: "WebRTC IP Comparison Website",
    description: "The official website which speed tests WebRTC-IP and other related IP methods.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${fraunces.variable} ${instrument.variable} ${hack.variable} ${ibm.variable} font-mono bg-[#0A0A0B] text-[#E8E8E3] antialiased`}>{children}</body>
        </html>
    );
}