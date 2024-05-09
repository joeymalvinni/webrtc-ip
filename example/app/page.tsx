'use client'

import { useEffect, useState } from "react";
import { getIPs } from "@/components/webrtc-ip";
import { parse_ice_candidate } from "@/components/candidate";

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);

  useEffect(() => {
    getIPs().then((ipList) => {
      setIps(ipList);
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-y-8">
      {ips.map((ip, i) => (
      <p key={i} className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">{ip}</p>
      ))}
    </main>
  );
}
