'use client'

import { useEffect, useState } from "react";
import { getIPs } from "@/components/webrtc-ip";

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [fetchTimes, setFetchTimes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    let startWebrtcTime = performance.now();
    getIPs().then((ipList) => {
      let endWebrtcTime = performance.now();
      setIps(ipList);
      let webrtcTime = endWebrtcTime - startWebrtcTime;
      setFetchTimes((prevTimes) => ({ ...prevTimes, 'webrtc': webrtcTime }));
    });

    const fetchLinks = async () => {
      await fetchAndTime('ipapi', 'https://ipapi.co/json/');
      
      await fetchAndTime('ip-api', 'http://ip-api.com/json');

      await fetchAndTime('ipdata', 'https://api.ipdata.co?api-key=be0f755b93290b4c100445d77533d291763a417c75524e95e07819ad');
      
      await fetchAndTime('ipfind', 'https://ipfind.co/me?auth=50e887ce-e3bb-4f00-a9b9-667597db5539');
      
      await fetchAndTime('ipify', 'https://api.ipify.org/');
      
      await fetchAndTime('ipregistry', 'https://api.ipregistry.co/?key=c4j3vfp0lre55jsw');

      await fetchAndTime('abstract', 'https://ipgeolocation.abstractapi.com/v1/?api_key=fac1da3073bf4cf9b0096b114e6ee1b6&ip_address=');
      
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
