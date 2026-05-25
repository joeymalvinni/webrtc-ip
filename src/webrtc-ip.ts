type GetIPOptions = {
    stun?: string | string[];
    timeout?: number;
    cache?: boolean;
    includeLocal?: boolean;
};

const DEFAULT_STUN = "stun:stun.l.google.com:19302";
const DEFAULT_TIMEOUT = 3000;

const cachedIPPromises = new Map<string, Promise<string>>();

function getPeerConnection(): typeof RTCPeerConnection | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }

    return window.RTCPeerConnection ||
        (window as typeof window & { webkitRTCPeerConnection?: typeof RTCPeerConnection }).webkitRTCPeerConnection ||
        (window as typeof window & { mozRTCPeerConnection?: typeof RTCPeerConnection }).mozRTCPeerConnection;
}

function normalizeOptions(stunOrOptions?: string | string[] | GetIPOptions): Required<GetIPOptions> {
    if (typeof stunOrOptions === "string" || Array.isArray(stunOrOptions)) {
        return {
            stun: stunOrOptions,
            timeout: DEFAULT_TIMEOUT,
            cache: true,
            includeLocal: false
        };
    }

    return {
        stun: stunOrOptions?.stun ?? DEFAULT_STUN,
        timeout: stunOrOptions?.timeout ?? DEFAULT_TIMEOUT,
        cache: stunOrOptions?.cache ?? true,
        includeLocal: stunOrOptions?.includeLocal ?? false
    };
}

function readCandidate(candidate: string): { ip: string; type: string } | null {
    const parts = candidate.trim().split(/\s+/);
    const typeIndex = parts.indexOf("typ");

    if (typeIndex === -1 || typeIndex + 1 >= parts.length || parts.length < 5) {
        return null;
    }

    return {
        ip: parts[4],
        type: parts[typeIndex + 1]
    };
}

function createIPPromise(options: Required<GetIPOptions>): Promise<string> {
    const PeerConnection = getPeerConnection();
    if (!PeerConnection) {
        return Promise.resolve("");
    }

    const iceServers = Array.isArray(options.stun) && options.stun.length === 0
        ? []
        : [{ urls: options.stun }];

    const connection = new PeerConnection({
        iceCandidatePoolSize: 1,
        iceServers
    });

    return new Promise<string>((resolve, reject) => {
        let settled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const finish = (callback: () => void) => {
            if (settled) {
                return;
            }

            settled = true;

            if (timer) {
                clearTimeout(timer);
            }

            connection.onicecandidate = null;
            connection.onicegatheringstatechange = null;
            connection.close();
            callback();
        };

        timer = setTimeout(() => {
            finish(() => reject(new Error("Timed out while gathering WebRTC IP candidates")));
        }, options.timeout);

        connection.onicecandidate = (event) => {
            if (event.candidate && event.candidate.candidate) {
                const candidate = readCandidate(event.candidate.candidate);

                if (candidate && (options.includeLocal || candidate.type !== "host")) {
                    finish(() => resolve(candidate.ip));
                }
            }
        };

        connection.onicegatheringstatechange = () => {
            if (connection.iceGatheringState === "complete") {
                finish(() => reject(new Error("No public WebRTC IP candidate found")));
            }
        };

        connection.createDataChannel("");
        connection.createOffer()
            .then((offer) => connection.setLocalDescription(offer))
            .catch((error) => finish(() => reject(error)));
    });
}

function cacheKey(options: Required<GetIPOptions>): string {
    return JSON.stringify(options);
}

function getIP(stunOrOptions?: string | string[] | GetIPOptions): Promise<string> {
    const options = normalizeOptions(stunOrOptions);

    if (!options.cache) {
        return createIPPromise(options);
    }

    const key = cacheKey(options);
    const cached = cachedIPPromises.get(key);

    if (cached) {
        return cached;
    }

    const promise = createIPPromise(options).catch((error) => {
        cachedIPPromises.delete(key);
        throw error;
    });

    cachedIPPromises.set(key, promise);
    return promise;
}

function prefetchIP(stunOrOptions?: string | string[] | GetIPOptions): Promise<string> {
    return getIP(stunOrOptions);
}

function clearIPCache(): void {
    cachedIPPromises.clear();
}

export { clearIPCache, getIP, prefetchIP };
export type { GetIPOptions };
