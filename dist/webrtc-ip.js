"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearIPCache = clearIPCache;
exports.getIP = getIP;
exports.prefetchIP = prefetchIP;
const DEFAULT_STUN = "stun:stun.l.google.com:19302";
const DEFAULT_TIMEOUT = 3000;
const cachedIPPromises = new Map();
function normalizeOptions(stunOrOptions) {
    var _a, _b, _c, _d;
    if (typeof stunOrOptions === "string" || Array.isArray(stunOrOptions)) {
        return {
            stun: stunOrOptions,
            timeout: DEFAULT_TIMEOUT,
            cache: true,
            includeLocal: false
        };
    }
    return {
        stun: (_a = stunOrOptions === null || stunOrOptions === void 0 ? void 0 : stunOrOptions.stun) !== null && _a !== void 0 ? _a : DEFAULT_STUN,
        timeout: (_b = stunOrOptions === null || stunOrOptions === void 0 ? void 0 : stunOrOptions.timeout) !== null && _b !== void 0 ? _b : DEFAULT_TIMEOUT,
        cache: (_c = stunOrOptions === null || stunOrOptions === void 0 ? void 0 : stunOrOptions.cache) !== null && _c !== void 0 ? _c : true,
        includeLocal: (_d = stunOrOptions === null || stunOrOptions === void 0 ? void 0 : stunOrOptions.includeLocal) !== null && _d !== void 0 ? _d : false
    };
}
function readCandidate(candidate) {
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
function createIPPromise(options) {
    if (typeof window === 'undefined') {
        return Promise.resolve("");
    }
    const iceServers = Array.isArray(options.stun) && options.stun.length === 0
        ? []
        : [{ urls: options.stun }];
    const config = {
        iceCandidatePoolSize: 1,
        iceServers
    };
    const p = new RTCPeerConnection(config);
    return new Promise((resolve, reject) => {
        let settled = false;
        let timer = null;
        const finish = (callback) => {
            if (settled) {
                return;
            }
            settled = true;
            if (timer) {
                clearTimeout(timer);
            }
            p.onicecandidate = null;
            p.onicegatheringstatechange = null;
            p.close();
            callback();
        };
        timer = setTimeout(() => {
            finish(() => reject(new Error("Timed out while gathering WebRTC IP candidates")));
        }, options.timeout);
        p.onicecandidate = (event) => {
            if (event.candidate && event.candidate.candidate) {
                const candidate = readCandidate(event.candidate.candidate);
                if (candidate && (options.includeLocal || candidate.type !== "host")) {
                    finish(() => resolve(candidate.ip));
                }
            }
        };
        p.onicegatheringstatechange = () => {
            if (p.iceGatheringState === "complete") {
                finish(() => reject(new Error("No public WebRTC IP candidate found")));
            }
        };
        p.createDataChannel('ip channel');
        p.createOffer()
            .then((offer) => p.setLocalDescription(offer))
            .catch((error) => finish(() => reject(error)));
    });
}
function cacheKey(options) {
    return JSON.stringify(options);
}
function getIP(stunOrOptions) {
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
function prefetchIP(stunOrOptions) {
    return getIP(stunOrOptions);
}
function clearIPCache() {
    cachedIPPromises.clear();
}
