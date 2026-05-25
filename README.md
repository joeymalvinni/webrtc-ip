<p align="center">
    <img src="https://raw.githubusercontent.com/joeymalvinni/webrtc-ip/main/imgs/webrtc-ips-banner.svg" alt="webrtc-ip banner" />
    <br>
</p>
<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0">
    <img alt="Apache 2.0 License" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg">
  </a>
  <a href="https://github.com/joeymalvinni/webrtc-ip/contributors/">
    <img alt="Github contributors" src="https://img.shields.io/github/contributors/joeymalvinni/webrtc-ip.svg">
  </a>
  <a href="https://github.com/joeymalvinni/webrtc-ip/pulls">
    <img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg">
  </a>
</p>

## webrtc-ip

Fast browser public-IP lookup using WebRTC ICE candidates and a STUN server.

```ts
import { getIP, prefetchIP } from "webrtc-ip";

void prefetchIP().catch(() => undefined); // start as early as possible

const ip = await getIP();
```

`webrtc-ip` is a **browser/client-side** library. It requires `RTCPeerConnection`, so it does not run during SSR or in plain Node.js. In unsupported environments, v5 rejects with a typed `WebRTCIPError` instead of returning an empty string.

## Installation

```bash
npm install webrtc-ip
```

```bash
bun add webrtc-ip
```

## Usage

### Basic

```ts
import { getIP } from "webrtc-ip";

try {
  const ip = await getIP();
  console.log(ip);
} catch (error) {
  console.error("Could not resolve IP", error);
}
```

### Next.js / React

Use it from a client component only:

```tsx
"use client";

import { useEffect, useState } from "react";
import { getIP, prefetchIP } from "webrtc-ip";

void prefetchIP().catch(() => undefined);

export default function Home() {
  const [ip, setIp] = useState<string | null>(null);

  useEffect(() => {
    getIP()
      .then(setIp)
      .catch(() => setIp(null));
  }, []);

  return <p>{ip ?? "Resolving…"}</p>;
}
```

### Options

```ts
const ip = await getIP({
  stun: [
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302"
  ],
  timeout: 3000,
  cache: true,
  cacheTtl: 60_000
});
```

| Option | Default | Description |
| --- | --- | --- |
| `stun` | `"stun:stun.l.google.com:19302"` | STUN URL or URL array. Pass `[]` with `includeLocal: true` for local-only candidates. |
| `timeout` | `3000` | Maximum time to wait for ICE candidates, in ms. |
| `cache` | `true` | Reuse an in-flight/completed lookup for matching options. |
| `cacheTtl` | `Infinity` | How long completed cached lookups remain fresh, in ms. |
| `includeLocal` | `false` | Include host/local candidates. Modern browsers may expose mDNS names instead of private IPs. |
| `signal` | `undefined` | `AbortSignal` for cancellation. |

### Rich result

```ts
import { getIPInfo } from "webrtc-ip";

const info = await getIPInfo();

console.log(info.ip);        // "203.0.113.42"
console.log(info.type);      // "srflx", "host", "relay", ...
console.log(info.elapsedMs); // lookup duration, not cached-read time
```

### Safe nullable helper

```ts
import { getIPOrNull } from "webrtc-ip";

const ip = await getIPOrNull(); // string | null
```

### Cancellation

```ts
const controller = new AbortController();

const promise = getIP({ signal: controller.signal, timeout: 5000 });
controller.abort();

await promise; // rejects with WebRTCIPError code "ABORTED"
```

## API

```ts
getIP(options?: string | string[] | GetIPOptions): Promise<string>
getIPInfo(options?: string | string[] | GetIPOptions): Promise<GetIPInfoResult>
getIPOrNull(options?: string | string[] | GetIPOptions): Promise<string | null>
prefetchIP(options?: string | string[] | GetIPOptions): Promise<string>
clearIPCache(): void
isSupported(): boolean
isWebRTCIPError(error: unknown): error is WebRTCIPError
```

## Errors

Failures reject with `WebRTCIPError`:

```ts
import { getIP, isWebRTCIPError } from "webrtc-ip";

try {
  await getIP();
} catch (error) {
  if (isWebRTCIPError(error)) {
    console.log(error.code);
  }
}
```

Error codes:

- `UNSUPPORTED` — `RTCPeerConnection` is unavailable, such as SSR/Node.js.
- `TIMEOUT` — no accepted candidate arrived before `timeout`.
- `NO_PUBLIC_CANDIDATE` — ICE completed without a public/server-reflexive candidate.
- `WEBRTC_BLOCKED` — browser policy, permissions, or networking blocked WebRTC setup.
- `INVALID_STUN_URL` — a STUN URL is malformed.
- `INVALID_OPTIONS` — `timeout` or `cacheTtl` is invalid.
- `ABORTED` — the supplied `AbortSignal` was aborted.

## Notes

- `prefetchIP()` starts the same cached lookup that `getIP()` reads later. This is what makes later calls fast.
- If you fire-and-forget `prefetchIP()`, attach a `.catch()` handler because unsupported or blocked environments reject.
- WebRTC/STUN still performs a network round trip and can fail on restrictive networks, VPNs, hardened browsers, or when WebRTC/UDP is disabled.
- Local candidates may be masked as `.local` mDNS names by modern browsers.

## Migration from v4 to v5

- Unsupported environments now reject with `WebRTCIPError` code `UNSUPPORTED` instead of resolving `""`.
- Package exports now provide both CommonJS and ESM entry points.
- New APIs: `isSupported`, `getIPInfo`, `getIPOrNull`, `isWebRTCIPError`, `cacheTtl`, and `AbortSignal` support.

## Authors

The author of webrtc-ip is [Joey Malvinni](https://github.com/joeymalvinni).

[List of all contributors](https://github.com/joeymalvinni/webrtc-ip/graphs/contributors)

## License

[Apache 2.0](LICENSE)
