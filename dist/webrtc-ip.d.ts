type GetIPOptions = {
    stun?: string | string[];
    timeout?: number;
    cache?: boolean;
    cacheTtl?: number;
    includeLocal?: boolean;
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
