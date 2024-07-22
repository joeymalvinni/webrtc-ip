'use client'

import { useState, useEffect } from "react";
import { getIP } from 'webrtc-ip';

export default function Home() {
    const [ip, setIp] = useState<string>("0.0.0.0");
    const [time, setTime] = useState<number>(0);

    useEffect(() => {
        (async () => {
            try {
                const t0 = performance.now();
                const ipAddress = await getIP();
                const t1 = performance.now();
                setTime(t1 - t0);
                setIp(ipAddress);
            } catch (error) {
                console.error("Failed to fetch IP address:", error);
            }
        })();
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <p>{ip} - {time} ms</p>
        </main>
    );
}
