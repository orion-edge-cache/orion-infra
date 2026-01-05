/**
 * ORION Cache Configuration - Edge Runtime
 *
 * Lightweight config parser for Fastly Compute@Edge.
 * Reads configuration from Config Store and applies cache rules.
 */
export interface CacheRule {
    types: string[];
    maxAge?: number;
    staleWhileRevalidate?: number;
    staleIfError?: number;
    passthrough?: boolean;
    scope?: 'public' | 'private';
}
export interface CacheDefaults {
    maxAge: number;
    staleWhileRevalidate: number;
    staleIfError: number;
}
export interface InvalidationMap {
    [mutation: string]: string[];
}
export interface CacheConfig {
    version: string;
    name: string;
    defaults: CacheDefaults;
    rules: CacheRule[];
    invalidations: InvalidationMap;
}
/**
 * Loads cache configuration from Config Store.
 * Reads fresh on each request - ConfigStore is fast (in-memory at edge).
 * This allows config changes to take effect without redeploying.
 */
export declare function loadCacheConfig(): CacheConfig;
/**
 * Finds the cache rule that applies to a given type.
 *
 * @param typeName - The GraphQL type (e.g., 'User', 'Query.feed')
 * @returns The matching rule, or undefined if no rule matches
 */
export declare function findMatchingRule(typeName: string): CacheRule | undefined;
export interface CacheHeaders {
    cacheControl: string;
    surrogateControl: string;
}
/**
 * Gets cache headers for a response based on entity types.
 *
 * @param entityTypes - Set of entity types in the response (e.g., ['User', 'Post'])
 * @param isMutation - Whether this is a mutation request
 * @returns Cache-Control and Surrogate-Control header values
 */
export declare function getCacheHeaders(entityTypes: Set<string>, isMutation: boolean): CacheHeaders;
/**
 * Gets additional invalidation targets for a mutation.
 *
 * @param mutationName - The mutation name (e.g., 'createPost')
 * @returns Array of additional types/keys to purge
 */
export declare function getInvalidationTargets(mutationName: string): string[];
//# sourceMappingURL=config.template.d.ts.map