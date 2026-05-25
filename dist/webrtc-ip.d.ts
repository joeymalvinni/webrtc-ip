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
type WebRTCIPErrorCode = "UNSUPPORTED" | "TIMEOUT" | "NO_PUBLIC_CANDIDATE" | "WEBRTC_BLOCKED" | "INVALID_STUN_URL" | "INVALID_OPTIONS" | "ABORTED";
type CandidateType = "host" | "srflx" | "prflx" | "relay" | (string & {});
type GetIPInfoResult = {
    ip: string;
    type: CandidateType;
    elapsedMs: number;
    candidate: string;
    protocol?: string;
    port?: number;
};
declare class WebRTCIPError extends Error {
    readonly code: WebRTCIPErrorCode;
    readonly cause?: unknown;
    constructor(code: WebRTCIPErrorCode, message: string, cause?: unknown);
}
declare function isWebRTCIPError(error: unknown): error is WebRTCIPError;
declare function isSupported(): boolean;
declare function getIPInfo(stunOrOptions?: string | string[] | GetIPOptions): Promise<GetIPInfoResult>;
declare function getIP(stunOrOptions?: string | string[] | GetIPOptions): Promise<string>;
declare function getIPOrNull(stunOrOptions?: string | string[] | GetIPOptions): Promise<string | null>;
declare function prefetchIP(stunOrOptions?: string | string[] | GetIPOptions): Promise<string>;
declare function clearIPCache(): void;
export { WebRTCIPError, clearIPCache, getIP, getIPInfo, getIPOrNull, isSupported, isWebRTCIPError, prefetchIP };
export type { CandidateType, GetIPInfoResult, GetIPOptions, WebRTCIPErrorCode };
