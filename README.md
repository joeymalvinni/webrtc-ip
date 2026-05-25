<p align="center">
    <img src="https://raw.githubusercontent.com/joeymalvinni/webrtc-ip/main/imgs/webrtc-ips-banner.svg"></img>
    <br>
</p>
<p align="center">
  <a href="https://travis-ci.com/joeymalvinni/webrtc-ip">
    <img alt="Build Status" src="https://travis-ci.com/joeymalvinni/is-tor.svg?branch=main">
  </a>
  <a href="https://opensource.org/licenses/Apache-2.0">
	<img alt="Apache 2.0 License" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg">
  </a>
  <a href="https://github.com/joeymalvinni/webrtc-ip/contributors/">
	<img alt="Github contributors" src="https://img.shields.io/github/contributors/joeymalvinni/webrtc-ip.svg">
  </a>
  <a href="https://snyk.io/test/github/joeymalvinni/webrtc-ip/">
	<img alt="Snyk vulnerabilities" src="https://snyk.io/test/github/joeymalvinni/webrtc-ip/badge.svg?targetFile=package.json">
  </a>
  <a href="https://github.com/joeymalvinni/webrtc-ip/pulls">
	<img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg">
  </a>
</p>

<br>


## Installation

The `webrtc-ip` package is available through [npm](https://www.npmjs.com/package/webrtc-ip):

```bash
npm install webrtc-ip
```

Alternatively, install using `bun`:
``` bash
bun install webrtc-ip
```


## Usage

WebRTC-IP is intended to be used with Next.js. A minimal example is present in [website/example]:

```ts
import { useState, useEffect } from "react";
import { getIP, prefetchIP } from 'webrtc-ip';

prefetchIP();

export default function Home() {
    const [ip, setIp] = useState<string>("0.0.0.0");

    useEffect(() => {
        (async () => {
            try {
                const ipAddress: string = await getIP();
                setIp(ipAddress);
            } catch (error) {
                console.error("Failed to fetch IP address:", error);
            }
        })();
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <p>{ip}</p>
        </main>
    );
}
```

For the fastest public IP lookup in the browser, start the WebRTC/STUN probe as early as possible with `prefetchIP()` and read the cached result later with `getIP()`. The first call still has to wait for ICE gathering, but repeated calls reuse the same in-flight or completed promise.

```ts
const ip = await getIP({
    stun: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302"
    ],
    timeout: 3000
});
```

If you only need a local network candidate, `getIP({ stun: [], includeLocal: true })` skips STUN and can resolve earlier. Modern browsers often mask local addresses with mDNS names, so the default waits for a public server-reflexive candidate.

## Authors

The author of webrtc-ips is [Joey Malvinni](https://github.com/joeymalvinni)

[List of all contributors](https://github.com/joeymalvinni/webrtc-ip/graphs/contributors)

## License

  [Apache 2.0](LICENSE)
