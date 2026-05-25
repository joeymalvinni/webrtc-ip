type GetIPOptions = {
    stun?: string | string[];
    timeout?: number;
    cache?: boolean;
    includeLocal?: boolean;
};
declare function getIP(stunOrOptions?: string | string[] | GetIPOptions): Promise<string>;
declare function prefetchIP(stunOrOptions?: string | string[] | GetIPOptions): Promise<string>;
declare function clearIPCache(): void;
export { clearIPCache, getIP, prefetchIP };
export type { GetIPOptions };
