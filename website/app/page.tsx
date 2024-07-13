import Button from "@/components/Button";

const webrtc_code = `import { get_ip } from "webrtc-ip";

const my_ip = get_ip();

console.log(my_ip);`;

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center">
            <h1 className="font-ibm text-4xl mt-32 drop-shadow mb-1 drop-shadow-[0px_0px_4px_#646E82]">WebRTC-IP Comparison</h1>
            <h2 className="text-2xl">🌐 Enhanced IP address querying with WebRTC</h2>

            <div className="border-dashed border-2 border-white/30 mt-32 px-32 py-32 flex flex-row">
                <div className="mr-32">
                    <h1 className="text-white/30 text-2xl mb-4">WEBRTC-IP</h1>
                    <h2 className="text-2xl m-0 p-0 leading-none">Up to 2.5x faster <br />
                        <span className="text-base text-[#C3C3C7] mt-0 p-0 leading-none">than the average fetch request</span>
                    </h2>
                </div>

                <div>
                    <div>
                        <Button variant="primary" className="mr-4 mt-2">WEBRTC-IP</Button>
                        <Button variant="secondary" >FETCH</Button>
                    </div>

                    <div className="mt-4 bg-[#0E0E10] px-4 py-8 text-sm">
                        <code className="font-hack whitespace-pre block">
                            {webrtc_code}
                        </code>
                    </div>
                </div>
            </div>

        </main>
    );
}
