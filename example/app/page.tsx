'use client'

import { useEffect, useState } from "react";
import { getIP } from "@/components/webrtc-ip";

export default function Home() {
  const [ip, setIp] = useState<string>("");
  const [fetchTimes, setFetchTimes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    let startWebrtcTime = performance.now();
    getIP().then((ip) => {
      let endWebrtcTime = performance.now();
      setIp(ip);
      let webrtcTime = endWebrtcTime - startWebrtcTime;
      setFetchTimes((prevTimes) => ({ ...prevTimes, 'webrtc': webrtcTime }));
    });

    const fetchLinks = async () => {
      await fetchAndTime('ipify', 'https://api.ipify.org/');
      
      await fetchAndTime('ipregistry', 'https://api.ipregistry.co/?key=c4j3vfp0lre55jsw');

      await fetchAndTime('jsonip', 'https://jsonip.com/');
    }

    fetchLinks();
  }, []);

  async function fetchAndTime(apiName: string, apiUrl: string) {
    let startTime = performance.now();
    fetch(apiUrl, {cache: "no-store"})
      .then(() => {
        let endTime = performance.now();
        let time = endTime - startTime;
        setFetchTimes((prevTimes) => ({ ...prevTimes, [apiName]: time }));
      })
      .catch(error => {
        console.error(`Error fetching IP from ${apiName}:`, error);
      });
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-y-8 bg-bg">

      {Object.entries(fetchTimes).sort((a, b) => a[1] - b[1]).map(([apiName, time], i) => (
        <p key={i} id={apiName} className="ip">{apiName} time - {time} ms</p>
      ))}
    </main>
  );
}
