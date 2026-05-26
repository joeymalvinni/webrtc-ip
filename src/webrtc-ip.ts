type GetIPOptions = {
    /** STUN server URL(s). Pass an empty array with includeLocal for local-only candidates. */
    stun?: string | string[];
    /** Maximum time to wait for ICE candidates, in milliseconds. */
    timeout?: number;
    /** Reuse an in-flight or cached lookup. Defaults to true. */
    cache?: boolean;
    /** How long a completed cached lookup stays fresh, in milliseconds. Defaults to forever. */
    cacheTtl?: number;
    /** Allow host/local candidates. These may be private IPs or mDNS hostnames. */
    includeLocal?: boolean;
    /** Abort an in-flight lookup. */
    signal?: AbortSignal;
};

type WebRTCIPErrorCode =
    | "UNSUPPORTED"
    | "TIMEOUT"
    | "NO_PUBLIC_CANDIDATE"
    | "WEBRTC_BLOCKED"
    | "INVALID_STUN_URL"
    | "INVALID_OPTIONS"
    | "ABORTED";

type CandidateType = "host" | "srflx" | "prflx" | "relay" | (string & {});

type GetIPInfoResult = {
    ip: string;
    type: CandidateType;
    elapsedMs: number;
    candidate: string;
    protocol?: string;
    port?: number;
};

type NormalizedGetIPOptions = {
    stun: string | string[];
    timeout: number;
    cache: boolean;
    cacheTtl: number;
    includeLocal: boolean;
    signal?: AbortSignal;
};

type ParsedCandidate = {
    ip: string;
    type: CandidateType;
    candidate: string;
    protocol?: string;
    port?: number;
};

type CacheEntry = {
    promise: Promise<GetIPInfoResult>;
    settled: boolean;
    expiresAt: number;
};

type PeerConnectionConstructor = typeof RTCPeerConnection;

type WebRTCScope = {
    RTCPeerConnection?: PeerConnectionConstructor;
    webkitRTCPeerConnection?: PeerConnectionConstructor;
    mozRTCPeerConnection?: PeerConnectionConstructor;
    window?: WebRTCScope;
};

const DEFAULT_STUN = "stun:stun.l.google.com:19302";
const DEFAULT_TIMEOUT = 3000;
const DEFAULT_CACHE_TTL = Number.POSITIVE_INFINITY;
const ERROR_CODES = new Set<string>([
    "UNSUPPORTED",
    "TIMEOUT",
    "NO_PUBLIC_CANDIDATE",
    "WEBRTC_BLOCKED",
    "INVALID_STUN_URL",
    "INVALID_OPTIONS",
    "ABORTED"
]);

const cachedIPInfoPromises = new Map<string, CacheEntry>();

class WebRTCIPError extends Error {
    readonly code: WebRTCIPErrorCode;
    readonly cause?: unknown;

    constructor(code: WebRTCIPErrorCode, message: string, cause?: unknown) {
        super(message);
        this.name = "WebRTCIPError";
        this.code = code;
        this.cause = cause;
        Object.setPrototypeOf(this, WebRTCIPError.prototype);
    }
}

function isWebRTCIPError(error: unknown): error is WebRTCIPError {
    if (error instanceof WebRTCIPError) {
        return true;
    }

    if (typeof error !== "object" || error === null) {
        return false;
    }

    const candidate = error as { name?: unknown; code?: unknown };
    return candidate.name === "WebRTCIPError" &&
        typeof candidate.code === "string" &&
        ERROR_CODES.has(candidate.code);
}

function getGlobalScope(): WebRTCScope | undefined {
    return typeof globalThis === "undefined"
        ? undefined
        : globalThis as unknown as WebRTCScope;
}

function getPeerConnection(): PeerConnectionConstructor | undefined {
    const scope = getGlobalScope();
    const windowScope = scope?.window;

    return scope?.RTCPeerConnection ||
        scope?.webkitRTCPeerConnection ||
        scope?.mozRTCPeerConnection ||
        windowScope?.RTCPeerConnection ||
        windowScope?.webkitRTCPeerConnection ||
        windowScope?.mozRTCPeerConnection;
}

function isSupported(): boolean {
    return Boolean(getPeerConnection());
}

function nowMs(): number {
    return typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
}

function createError(code: WebRTCIPErrorCode, message: string, cause?: unknown): WebRTCIPError {
    return cause instanceof WebRTCIPError ? cause : new WebRTCIPError(code, message, cause);
}

function createAbortError(): WebRTCIPError {
    return createError("ABORTED", "WebRTC IP lookup was aborted");
}

function validateTimeout(timeout: number): void {
    if (!Number.isFinite(timeout) || timeout <= 0) {
        throw createError("INVALID_OPTIONS", "timeout must be a positive finite number");
    }
}

function validateCacheTtl(cacheTtl: number): void {
    if (cacheTtl !== Number.POSITIVE_INFINITY && (!Number.isFinite(cacheTtl) || cacheTtl < 0)) {
        throw createError("INVALID_OPTIONS", "cacheTtl must be zero, a positive finite number, or Infinity");
    }
}

function normalizeStun(stun: string | string[]): string | string[] {
    return Array.isArray(stun)
        ? stun.map((url) => typeof url === "string" ? url.trim() : "")
        : typeof stun === "string" ? stun.trim() : "";
}

function validateIceServerUrls(stun: string | string[]): void {
    const urls = Array.isArray(stun) ? stun : [stun];

    if (urls.length === 0) {
        return;
    }

    for (const url of urls) {
        if (!/^stuns?:[^\s]+$/i.test(url)) {
            throw createError("INVALID_STUN_URL", `Invalid STUN URL: ${url || "<empty>"}`);
        }
    }
}

function normalizeOptions(stunOrOptions?: string | string[] | GetIPOptions): NormalizedGetIPOptions {
    const rawOptions = typeof stunOrOptions === "string" || Array.isArray(stunOrOptions)
        ? { stun: stunOrOptions }
        : stunOrOptions ?? {};

    const stun = normalizeStun(rawOptions.stun ?? DEFAULT_STUN);
    const timeout = rawOptions.timeout ?? DEFAULT_TIMEOUT;
    const cacheTtl = rawOptions.cacheTtl ?? DEFAULT_CACHE_TTL;

    validateIceServerUrls(stun);
    validateTimeout(timeout);
    validateCacheTtl(cacheTtl);

    return {
        stun,
        timeout,
        cache: rawOptions.cache ?? true,
        cacheTtl,
        includeLocal: rawOptions.includeLocal ?? false,
        signal: rawOptions.signal
    };
}

function readCandidate(candidate: string): ParsedCandidate | null {
    const parts = candidate.trim().split(/\s+/);
    const typeIndex = parts.indexOf("typ");
    const ip = parts[4];
    const type = parts[typeIndex + 1] as CandidateType | undefined;

    if (!ip || typeIndex === -1 || !type) {
        return null;
    }

    const port = Number(parts[5]);

    return {
        ip,
        type,
        candidate,
        protocol: parts[2]?.toLowerCase(),
        port: Number.isFinite(port) ? port : undefined
    };
}

function createIPInfoPromise(options: NormalizedGetIPOptions): Promise<GetIPInfoResult> {
    return new Promise<GetIPInfoResult>((resolve, reject) => {
        if (options.signal?.aborted) {
            reject(createAbortError());
            return;
        }

        const PeerConnection = getPeerConnection();
        if (!PeerConnection) {
            reject(createError("UNSUPPORTED", "WebRTC RTCPeerConnection is not available in this environment"));
            return;
        }

        const startedAt = nowMs();
        const iceServers = Array.isArray(options.stun) && options.stun.length === 0
            ? []
            : [{ urls: options.stun }];

        let connection: RTCPeerConnection | undefined;
        let settled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const cleanup = () => {
            if (timer) {
                clearTimeout(timer);
            }

            options.signal?.removeEventListener("abort", handleAbort);

            if (connection) {
                connection.onicecandidate = null;
                connection.onicegatheringstatechange = null;
                connection.close();
            }
        };

        const finish = (callback: () => void) => {
            if (settled) {
                return;
            }

            settled = true;
            cleanup();
            callback();
        };

        const fail = (error: WebRTCIPError) => finish(() => reject(error));

        const handleAbort = () => {
            fail(createAbortError());
        };

        try {
            connection = new PeerConnection({
                iceCandidatePoolSize: 1,
                iceServers
            });
        } catch (error) {
            reject(createError("WEBRTC_BLOCKED", "WebRTC RTCPeerConnection could not be created", error));
            return;
        }

        options.signal?.addEventListener("abort", handleAbort, { once: true });

        timer = setTimeout(() => {
            fail(createError("TIMEOUT", `Timed out after ${options.timeout}ms while gathering WebRTC IP candidates`));
        }, options.timeout);

        connection.onicecandidate = (event) => {
            if (!event.candidate?.candidate) {
                return;
            }

            const candidate = readCandidate(event.candidate.candidate);

            if (candidate && (options.includeLocal || candidate.type !== "host")) {
                finish(() => resolve({
                    ...candidate,
                    elapsedMs: nowMs() - startedAt
                }));
            }
        };

        connection.onicegatheringstatechange = () => {
            if (connection?.iceGatheringState === "complete") {
                const message = options.includeLocal
                    ? "No WebRTC IP candidate found"
                    : "No public WebRTC IP candidate found";
                fail(createError("NO_PUBLIC_CANDIDATE", message));
            }
        };

        try {
            connection.createDataChannel("");
            connection.createOffer()
                .then((offer) => {
                    if (!settled && connection) {
                        return connection.setLocalDescription(offer);
                    }

                    return undefined;
                })
                .catch((error) => {
                    fail(createError("WEBRTC_BLOCKED", "WebRTC ICE gathering could not be started", error));
                });
        } catch (error) {
            fail(createError("WEBRTC_BLOCKED", "WebRTC ICE gathering could not be started", error));
        }
    });
}

function cacheKey(options: NormalizedGetIPOptions): string {
    return JSON.stringify({
        stun: options.stun,
        timeout: options.timeout,
        cacheTtl: options.cacheTtl === Number.POSITIVE_INFINITY ? "Infinity" : options.cacheTtl,
        includeLocal: options.includeLocal
    });
}

function omitSignal(options: NormalizedGetIPOptions): NormalizedGetIPOptions {
    return {
        ...options,
        signal: undefined
    };
}

function withAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
    if (!signal) {
        return promise;
    }

    if (signal.aborted) {
        return Promise.reject(createAbortError());
    }

    return new Promise<T>((resolve, reject) => {
        const cleanup = () => signal.removeEventListener("abort", handleAbort);
        const handleAbort = () => {
            cleanup();
            reject(createAbortError());
        };

        signal.addEventListener("abort", handleAbort, { once: true });
        promise.then(
            (value) => {
                cleanup();
                resolve(value);
            },
            (error) => {
                cleanup();
                reject(error);
            }
        );
    });
}

function getCachedIPInfo(options: NormalizedGetIPOptions): Promise<GetIPInfoResult> {
    const key = cacheKey(options);
    const cached = cachedIPInfoPromises.get(key);
    const currentTime = Date.now();

    if (cached && (!cached.settled || cached.expiresAt > currentTime)) {
        return cached.promise;
    }

    if (cached) {
        cachedIPInfoPromises.delete(key);
    }

    const entry: CacheEntry = {
        promise: createIPInfoPromise(options),
        settled: false,
        expiresAt: Number.POSITIVE_INFINITY
    };

    entry.promise = entry.promise
        .then((result) => {
            entry.settled = true;
            entry.expiresAt = options.cacheTtl === Number.POSITIVE_INFINITY
                ? Number.POSITIVE_INFINITY
                : Date.now() + options.cacheTtl;

            if (options.cacheTtl === 0 && cachedIPInfoPromises.get(key) === entry) {
                cachedIPInfoPromises.delete(key);
            }

            return result;
        })
        .catch((error) => {
            if (cachedIPInfoPromises.get(key) === entry) {
                cachedIPInfoPromises.delete(key);
            }

            throw error;
        });

    cachedIPInfoPromises.set(key, entry);
    return entry.promise;
}

function getIPInfo(stunOrOptions?: string | string[] | GetIPOptions): Promise<GetIPInfoResult> {
    try {
        const options = normalizeOptions(stunOrOptions);

        if (options.signal?.aborted) {
            return Promise.reject(createAbortError());
        }

        if (!options.cache) {
            return createIPInfoPromise(options);
        }

        return withAbort(getCachedIPInfo(omitSignal(options)), options.signal);
    } catch (error) {
        return Promise.reject(error);
    }
}

function getIP(stunOrOptions?: string | string[] | GetIPOptions): Promise<string> {
    return getIPInfo(stunOrOptions).then((result) => result.ip);
}

function getIPOrNull(stunOrOptions?: string | string[] | GetIPOptions): Promise<string | null> {
    return getIP(stunOrOptions).catch(() => null);
}

function prefetchIP(stunOrOptions?: string | string[] | GetIPOptions): Promise<string> {
    return getIP(stunOrOptions);
}

function clearIPCache(): void {
    cachedIPInfoPromises.clear();
}

export {
    WebRTCIPError,
    clearIPCache,
    getIP,
    getIPInfo,
    getIPOrNull,
    isSupported,
    isWebRTCIPError,
    prefetchIP
};
export type { CandidateType, GetIPInfoResult, GetIPOptions, WebRTCIPErrorCode };