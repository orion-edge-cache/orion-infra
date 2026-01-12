/**
 * ORION Cache Configuration - Edge Runtime
 *
 * Lightweight config parser for Fastly Compute@Edge.
 * Reads configuration from Config Store and applies cache rules.
 */

import { ConfigStore } from "fastly:config-store";

// =============================================================================
// TYPES (mirrors CLI types, but standalone for edge runtime)
// =============================================================================

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

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: CacheConfig = {
  version: "1.0",
  name: "orion",
  defaults: {
    maxAge: 900,              // 15 minutes
    staleWhileRevalidate: 0,
    staleIfError: 0,
  },
  rules: [],
  invalidations: {},
};

// =============================================================================
// CONFIG LOADING
// =============================================================================

/**
 * Loads cache configuration from Config Store.
 * Reads fresh on each request - ConfigStore is fast (in-memory at edge).
 * This allows config changes to take effect without redeploying.
 */
export function loadCacheConfig(): CacheConfig {
  try {
    const configStore = new ConfigStore("orion_configstore_35a18af5");
    const configJson = configStore.get("CACHE_CONFIG_JSON");

    if (configJson && configJson !== "{}") {
      const parsed = JSON.parse(configJson);
      // Merge with defaults to ensure all required fields exist
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        defaults: {
          ...DEFAULT_CONFIG.defaults,
          ...(parsed.defaults || {}),
        },
      };
    }
  } catch (error) {
    // Config Store not available or invalid JSON
    console.error("Failed to load cache config:", error);
  }

  return DEFAULT_CONFIG;
}

// =============================================================================
// RULE MATCHING
// =============================================================================

/**
 * Finds the cache rule that applies to a given type.
 *
 * @param typeName - The GraphQL type (e.g., 'User', 'Query.feed')
 * @returns The matching rule, or undefined if no rule matches
 */
export function findMatchingRule(typeName: string): CacheRule | undefined {
  const config = loadCacheConfig();

  for (const rule of config.rules) {
    for (const pattern of rule.types) {
      if (matchesPattern(pattern, typeName)) {
        return rule;
      }
    }
  }

  return undefined;
}

/**
 * Checks if a type name matches a pattern.
 *
 * Patterns:
 * - 'User' matches 'User'
 * - 'Query.*' matches 'Query.user', 'Query.posts', etc.
 * - 'Mutation.*' matches all mutations
 * - '*' matches everything
 */
function matchesPattern(pattern: string, typeName: string): boolean {
  // Exact match
  if (pattern === typeName) return true;

  // Wildcard match
  if (pattern.endsWith(".*")) {
    const prefix = pattern.slice(0, -2);
    return typeName.startsWith(prefix + ".");
  }

  // Global wildcard
  if (pattern === "*") return true;

  return false;
}

// =============================================================================
// CACHE HEADERS
// =============================================================================

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
export function getCacheHeaders(entityTypes: Set<string>, isMutation: boolean): CacheHeaders {
  // Mutations are never cached
  if (isMutation) {
    return {
      cacheControl: "private, no-store",
      surrogateControl: "no-store",
    };
  }

  const config = loadCacheConfig();

  // Find the most restrictive rule among all entity types
  let minMaxAge = config.defaults.maxAge;
  let maxSwr = config.defaults.staleWhileRevalidate;
  let maxSie = config.defaults.staleIfError;
  let scope: 'public' | 'private' = 'public';
  let passthrough = false;

  for (const typeName of entityTypes) {
    const rule = findMatchingRule(typeName);

    if (rule) {
      if (rule.passthrough) {
        passthrough = true;
        break;
      }

      if (rule.maxAge !== undefined && rule.maxAge < minMaxAge) {
        minMaxAge = rule.maxAge;
      }

      if (rule.staleWhileRevalidate !== undefined && rule.staleWhileRevalidate > maxSwr) {
        maxSwr = rule.staleWhileRevalidate;
      }

      if (rule.staleIfError !== undefined && rule.staleIfError > maxSie) {
        maxSie = rule.staleIfError;
      }

      if (rule.scope === 'private') {
        scope = 'private';
      }
    }
  }

  // Passthrough means no caching
  if (passthrough) {
    return {
      cacheControl: "private, no-store",
      surrogateControl: "no-store",
    };
  }

  // Build Cache-Control header
  const cacheControlParts: string[] = [];
  cacheControlParts.push(scope);
  cacheControlParts.push(`max-age=${minMaxAge}`);

  if (scope === 'public') {
    cacheControlParts.push(`s-maxage=${minMaxAge}`);
  }

  if (maxSwr > 0) {
    cacheControlParts.push(`stale-while-revalidate=${maxSwr}`);
  }

  if (maxSie > 0) {
    cacheControlParts.push(`stale-if-error=${maxSie}`);
  }

  // Build Surrogate-Control header (for CDN)
  // Private scope should not be cached by CDN - only browser can cache
  if (scope === 'private') {
    return {
      cacheControl: cacheControlParts.join(", "),
      surrogateControl: "no-store",
    };
  }

  const surrogateControlParts: string[] = [];
  surrogateControlParts.push(`max-age=${minMaxAge}`);

  if (maxSwr > 0) {
    surrogateControlParts.push(`stale-while-revalidate=${maxSwr}`);
  }

  if (maxSie > 0) {
    surrogateControlParts.push(`stale-if-error=${maxSie}`);
  }

  return {
    cacheControl: cacheControlParts.join(", "),
    surrogateControl: surrogateControlParts.join(", "),
  };
}

// =============================================================================
// INVALIDATION HELPERS
// =============================================================================

/**
 * Gets additional invalidation targets for a mutation.
 *
 * @param mutationName - The mutation name (e.g., 'createPost')
 * @returns Array of additional types/keys to purge
 */
export function getInvalidationTargets(mutationName: string): string[] {
  const config = loadCacheConfig();

  // Try exact match first
  if (config.invalidations[mutationName]) {
    return config.invalidations[mutationName];
  }

  // Try with "Mutation." prefix
  const prefixed = `Mutation.${mutationName}`;
  if (config.invalidations[prefixed]) {
    return config.invalidations[prefixed];
  }

  return [];
}
