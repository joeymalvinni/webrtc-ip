import type { Metadata } from "next";
import { Poppins, IBM_Plex_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '700'], variable: "--font-poppins" });
const ibm = IBM_Plex_Mono({ subsets: ["latin"], weight: ['400', '700'], variable: "--font-ibm" });
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
            <body className={`${poppins.variable} ${hack.variable} ${ibm.variable} font-poppins`}>{children}</body>
        </html>
    );
}

