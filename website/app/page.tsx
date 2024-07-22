"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Code from "@/components/ui/Code";
import Graph from "@/components/charts/graph";
import { getIP } from "webrtc-ip";

const webrtc_code = `import { get_ip } from "webrtc-ip";

get_ip().then((my_ip) => {
    console.log(my_ip);
});`;

const fetch_code = `fetch('https://api.ipify.org')
  .then(response => {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.text();
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });`;

const Home: React.FC = () => {
    const [code, setCode] = useState(webrtc_code);
    const [isWebRTC, setIsWebRTC] = useState(true);
    const [ip, setIp] = useState<string>("");
    const [data, setData] = useState<{ name: string; time: number }[]>([]);
    const [speedFactor, setSpeedFactor] = useState<number | null>(null);

    const handleFetchClick = () => {
        setCode(fetch_code);
        setIsWebRTC(false);
    };

    const handleWebRTCClick = () => {
        setCode(webrtc_code);
        setIsWebRTC(true);
    };

    useEffect(() => {
        let startWebrtcTime = performance.now();
        getIP().then((ip) => {
            let endWebrtcTime = performance.now();
            setIp(ip);
            let webrtcTime = endWebrtcTime - startWebrtcTime;

            const fetchLinks = async () => {
                const times = await Promise.all([
                    fetchAndTime('ipify', 'https://api.ipify.org/'),
                    fetchAndTime('ipregistry', 'https://api.ipregistry.co/?key=c4j3vfp0lre55jsw'),
                    fetchAndTime('jsonip', 'https://jsonip.com/')
                ]);

                const averageFetchTime = times.reduce((a, b) => a + b, 0) / times.length;
                const speedFactor = averageFetchTime / webrtcTime;

                const combinedData = [
                    { name: "WebRTC-IP", time: webrtcTime },
                    { name: "IPIFY", time: times[0] },
                    { name: "IPRegistry", time: times[1] },
                    { name: "JSONIP", time: times[2] }
                ].sort((a, b) => a.time - b.time);

                setData(combinedData);
                setSpeedFactor(speedFactor);
            };

            fetchLinks();
        });

    }, []);

    async function fetchAndTime(apiName: string, apiUrl: string): Promise<number> {
        let startTime = performance.now();
        return fetch(apiUrl, { cache: "no-store" })
            .then(() => {
                let endTime = performance.now();
                let time = endTime - startTime;
                return time;
            })
            .catch(error => {
                console.error(`Error fetching IP from ${apiName}:`, error);
                return -1;
            });
    }

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#0E0F11] text-white">
            <h1 className="font-ibm text-4xl mt-32 mb-1 drop-shadow-[0px_0px_4px_#646E82]">WebRTC-IP Comparison</h1>
            <h2 className="text-2xl">🌐 Enhanced IP address querying with WebRTC</h2>

            <h3>{ip}</h3>

            <div className="mt-32 px-32 py-32 flex flex-row justify-between w-[50%] bg-[#111115] rounded-xl drop-shadow-[0px_1px_5px_#646584] border-2 border-[#343443]">
                <div className="mr-32 w-[40%]">
                    <h1 className="text-white/30 text-2xl">WEBRTC-IP</h1>
                    <h2 className="text-2xl m-0 p-0 leading-none mb-8">
                        Up to {speedFactor ? speedFactor.toFixed(2) : "0"}x faster <br />
                        <span className="text-base text-[#C3C3C7] mt-0 p-0 leading-none">
                            than the average fetch request
                        </span>
                    </h2>

                    <Graph data={data} />
                </div>

                <div>
                    <div>
                        <Button
                            variant={isWebRTC ? "primary" : "secondary"}
                            className="mr-2 mt-2"
                            onClick={handleWebRTCClick}
                        >
                            WEBRTC-IP
                        </Button>
                        <Button
                            variant={!isWebRTC ? "primary" : "secondary"}
                            onClick={handleFetchClick}
                        >
                            FETCH
                        </Button>
                    </div>

                    <div className="mt-4 bg-[#0E0E10] text-sm">
                        <Code
                            code={code}
                            lang="tsx"
                            theme="material-theme-palenight"
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Home;
