const DEFAULT_STUN = "stun:stun.l.google.com:19302";
const DEFAULT_TIMEOUT = 3000;
const DEFAULT_CACHE_TTL = Number.POSITIVE_INFINITY;
const ERROR_CODES = new Set([
    "UNSUPPORTED",
    "TIMEOUT",
    "NO_PUBLIC_CANDIDATE",
    "WEBRTC_BLOCKED",
    "INVALID_STUN_URL",
    "INVALID_OPTIONS",
    "ABORTED"
]);
const cachedIPInfoPromises = new Map();
class WebRTCIPError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.name = "WebRTCIPError";
        this.code = code;
        this.cause = cause;
        Object.setPrototypeOf(this, WebRTCIPError.prototype);
    }
}
function isWebRTCIPError(error) {
    if (error instanceof WebRTCIPError) {
        return true;
    }
    if (typeof error !== "object" || error === null) {
        return false;
    }
    const candidate = error;
    return candidate.name === "WebRTCIPError" &&
        typeof candidate.code === "string" &&
        ERROR_CODES.has(candidate.code);
}
function getGlobalScope() {
    return typeof globalThis === "undefined"
        ? undefined
        : globalThis;
}
function getPeerConnection() {
    const scope = getGlobalScope();
    const windowScope = scope === null || scope === void 0 ? void 0 : scope.window;
    return (scope === null || scope === void 0 ? void 0 : scope.RTCPeerConnection) ||
        (scope === null || scope === void 0 ? void 0 : scope.webkitRTCPeerConnection) ||
        (scope === null || scope === void 0 ? void 0 : scope.mozRTCPeerConnection) ||
        (windowScope === null || windowScope === void 0 ? void 0 : windowScope.RTCPeerConnection) ||
        (windowScope === null || windowScope === void 0 ? void 0 : windowScope.webkitRTCPeerConnection) ||
        (windowScope === null || windowScope === void 0 ? void 0 : windowScope.mozRTCPeerConnection);
}
function isSupported() {
    return Boolean(getPeerConnection());
}
function nowMs() {
    return typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
}
function createError(code, message, cause) {
    return cause instanceof WebRTCIPError ? cause : new WebRTCIPError(code, message, cause);
}
function createAbortError() {
    return createError("ABORTED", "WebRTC IP lookup was aborted");
}
function validateTimeout(timeout) {
    if (!Number.isFinite(timeout) || timeout <= 0) {
        throw createError("INVALID_OPTIONS", "timeout must be a positive finite number");
    }
}
function validateCacheTtl(cacheTtl) {
    if (cacheTtl !== Number.POSITIVE_INFINITY && (!Number.isFinite(cacheTtl) || cacheTtl < 0)) {
        throw createError("INVALID_OPTIONS", "cacheTtl must be zero, a positive finite number, or Infinity");
    }
}
function normalizeStun(stun) {
    return Array.isArray(stun)
        ? stun.map((url) => typeof url === "string" ? url.trim() : "")
        : typeof stun === "string" ? stun.trim() : "";
}
function validateIceServerUrls(stun) {
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
function normalizeOptions(stunOrOptions) {
    var _a, _b, _c, _d, _e;
    const rawOptions = typeof stunOrOptions === "string" || Array.isArray(stunOrOptions)
        ? { stun: stunOrOptions }
        : stunOrOptions !== null && stunOrOptions !== void 0 ? stunOrOptions : {};
    const stun = normalizeStun((_a = rawOptions.stun) !== null && _a !== void 0 ? _a : DEFAULT_STUN);
    const timeout = (_b = rawOptions.timeout) !== null && _b !== void 0 ? _b : DEFAULT_TIMEOUT;
    const cacheTtl = (_c = rawOptions.cacheTtl) !== null && _c !== void 0 ? _c : DEFAULT_CACHE_TTL;
    validateIceServerUrls(stun);
    validateTimeout(timeout);
    validateCacheTtl(cacheTtl);
    return {
        stun,
        timeout,
        cache: (_d = rawOptions.cache) !== null && _d !== void 0 ? _d : true,
        cacheTtl,
        includeLocal: (_e = rawOptions.includeLocal) !== null && _e !== void 0 ? _e : false,
        signal: rawOptions.signal
    };
}
function readCandidate(candidate) {
    var _a;
    const parts = candidate.trim().split(/\s+/);
    const typeIndex = parts.indexOf("typ");
    const ip = parts[4];
    const type = parts[typeIndex + 1];
    if (!ip || typeIndex === -1 || !type) {
        return null;
    }
    const port = Number(parts[5]);
    return {
        ip,
        type,
        candidate,
        protocol: (_a = parts[2]) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
        port: Number.isFinite(port) ? port : undefined
    };
}
function createIPInfoPromise(options) {
    return new Promise((resolve, reject) => {
        var _a, _b;
        if ((_a = options.signal) === null || _a === void 0 ? void 0 : _a.aborted) {
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
        let connection;
        let settled = false;
        let timer;
        const cleanup = () => {
            var _a;
            if (timer) {
                clearTimeout(timer);
            }
            (_a = options.signal) === null || _a === void 0 ? void 0 : _a.removeEventListener("abort", handleAbort);
            if (connection) {
                connection.onicecandidate = null;
                connection.onicegatheringstatechange = null;
                connection.close();
            }
        };
        const finish = (callback) => {
            if (settled) {
                return;
            }
            settled = true;
            cleanup();
            callback();
        };
        const fail = (error) => finish(() => reject(error));
        const handleAbort = () => {
            fail(createAbortError());
        };
        try {
            connection = new PeerConnection({
                iceCandidatePoolSize: 1,
                iceServers
            });
        }
        catch (error) {
            reject(createError("WEBRTC_BLOCKED", "WebRTC RTCPeerConnection could not be created", error));
            return;
        }
        (_b = options.signal) === null || _b === void 0 ? void 0 : _b.addEventListener("abort", handleAbort, { once: true });
        timer = setTimeout(() => {
            fail(createError("TIMEOUT", `Timed out after ${options.timeout}ms while gathering WebRTC IP candidates`));
        }, options.timeout);
        connection.onicecandidate = (event) => {
            var _a;
            if (!((_a = event.candidate) === null || _a === void 0 ? void 0 : _a.candidate)) {
                return;
            }
            const candidate = readCandidate(event.candidate.candidate);
            if (candidate && (options.includeLocal || candidate.type !== "host")) {
                finish(() => resolve(Object.assign(Object.assign({}, candidate), { elapsedMs: nowMs() - startedAt })));
            }
        };
        connection.onicegatheringstatechange = () => {
            if ((connection === null || connection === void 0 ? void 0 : connection.iceGatheringState) === "complete") {
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
        }
        catch (error) {
            fail(createError("WEBRTC_BLOCKED", "WebRTC ICE gathering could not be started", error));
        }
    });
}
function cacheKey(options) {
    return JSON.stringify({
        stun: options.stun,
        timeout: options.timeout,
        cacheTtl: options.cacheTtl === Number.POSITIVE_INFINITY ? "Infinity" : options.cacheTtl,
        includeLocal: options.includeLocal
    });
}
function omitSignal(options) {
    return Object.assign(Object.assign({}, options), { signal: undefined });
}
function withAbort(promise, signal) {
    if (!signal) {
        return promise;
    }
    if (signal.aborted) {
        return Promise.reject(createAbortError());
    }
    return new Promise((resolve, reject) => {
        const cleanup = () => signal.removeEventListener("abort", handleAbort);
        const handleAbort = () => {
            cleanup();
            reject(createAbortError());
        };
        signal.addEventListener("abort", handleAbort, { once: true });
        promise.then((value) => {
            cleanup();
            resolve(value);
        }, (error) => {
            cleanup();
            reject(error);
        });
    });
}
function getCachedIPInfo(options) {
    const key = cacheKey(options);
    const cached = cachedIPInfoPromises.get(key);
    const currentTime = Date.now();
    if (cached && (!cached.settled || cached.expiresAt > currentTime)) {
        return cached.promise;
    }
    if (cached) {
        cachedIPInfoPromises.delete(key);
    }
    const entry = {
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
function getIPInfo(stunOrOptions) {
    var _a;
    try {
        const options = normalizeOptions(stunOrOptions);
        if ((_a = options.signal) === null || _a === void 0 ? void 0 : _a.aborted) {
            return Promise.reject(createAbortError());
        }
        if (!options.cache) {
            return createIPInfoPromise(options);
        }
        return withAbort(getCachedIPInfo(omitSignal(options)), options.signal);
    }
    catch (error) {
        return Promise.reject(error);
    }
}
function getIP(stunOrOptions) {
    return getIPInfo(stunOrOptions).then((result) => result.ip);
}
function getIPOrNull(stunOrOptions) {
    return getIP(stunOrOptions).catch(() => null);
}
function prefetchIP(stunOrOptions) {
    return getIP(stunOrOptions);
}
function clearIPCache() {
    cachedIPInfoPromises.clear();
}
export { WebRTCIPError, clearIPCache, getIP, getIPInfo, getIPOrNull, isSupported, isWebRTCIPError, prefetchIP };
