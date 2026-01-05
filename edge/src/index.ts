import { Logger } from "fastly:logger";
import { ConfigStore } from "fastly:config-store";
import { SecretStore } from "fastly:secret-store";
import {
  extractEntities,
  extractEntityTypes,
  toSurrogateKey,
  isMutation,
} from "./entities.js";
import {
  injectTypename,
  getOperationType,
  getOperationName,
} from "./transform.js";
import { getCacheHeaders, getInvalidationTargets } from "./config.js";

// =============================================================================
// COMPUTE@EDGE SERVICE - GraphQL Proxy with Auto-Purge
// =============================================================================
//
// This service:
// 1. Receives GraphQL requests from VCL (via X-GraphQL-Query header)
// 2. Injects __typename for entity extraction
// 3. Forwards to origin GraphQL server
// 4. Extracts entities from response for Surrogate-Key tagging
// 5. Auto-purges related cache entries on mutations
//
// =============================================================================

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event: FetchEvent) {
  const secrets = new SecretStore("orion_secretstore_35a18af5");
  const config = new ConfigStore("orion_configstore_35a18af5");
  const configDomain =
    config.get("compute_backend_domain") || "vfa102.website";
  const configProtocol =
    config.get("compute_backend_protocol") || "http";
  const configHostOverride = config.get("compute_backend_host_override") || "";

  const request = event.request;
  const kinesisLogger = new Logger("kinesis-stream");
  const timestamp = new Date().toISOString();

  // Reject unsupported methods
  if (["HEAD", "PURGE"].includes(request.method)) {
    return new Response("Method not allowed", { status: 405 });
  }

  // Get GraphQL query from VCL header
  const rawHeader = request.headers.get("X-GraphQL-Query") || "";
  if (!rawHeader) {
    return new Response("Missing X-GraphQL-Query header", { status: 400 });
  }

  // Parse query (handles VCL-escaped JSON)
  const { query, body: originalBody } = parseGraphQLHeader(rawHeader);
  const operationType = getOperationType(query);
  const isMutationRequest = operationType === "mutation" || isMutation(query);

  // Inject __typename for entity extraction
  const transformedQuery = injectTypename(query);
  const requestBody = originalBody
    ? JSON.stringify({ ...originalBody, query: transformedQuery })
    : JSON.stringify({ query: transformedQuery });

  // Log request
  kinesisLogger.log(
    JSON.stringify({
      title: "Fastly Compute Request",
      timestamp,
      url: request.url,
      method: request.method,
      backend: `${configProtocol}://${configDomain}`,
      operationType,
      isMutation: isMutationRequest,
    }),
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  try {
    const authSecret = await secrets.get("ORIGIN_AUTH_SECRET");
    if (authSecret) {
      const authHeader =
        config.get("ORIGIN_AUTH_HEADER_NAME") || "Authorization";
      headers[authHeader] = authSecret.plaintext();
    }
  } catch {
    /* No auth configured */
  }

  const graphqlRequest = new Request("/graphql", {
    backend: "graphql-server",
    method: "POST",
    headers: {
      ...headers,
      Host: configHostOverride,
    },
    body: requestBody,
  });

  const response = await fetch(graphqlRequest);

  if (response.status !== 200) {
    return new Response(await response.text(), {
      status: response.status,
      statusText: response.statusText,
    });
  }

  // Parse response and extract entities
  const responseBody = await response.text();
  let entities = new Set<string>();
  let surrogateKey = "";

  try {
    const data = JSON.parse(responseBody);
    if (data.data) {
      entities = extractEntities(data.data);
      surrogateKey = toSurrogateKey(entities);
    }
  } catch {
    /* Parse error */
  }

  // Build response headers
  const responseHeaders = new Headers(response.headers);

  // Debug headers for load testing
  responseHeaders.set("X-Debug-Entity-Count", String(entities.size));
  if (surrogateKey) {
    responseHeaders.set("X-Debug-Entities", surrogateKey);
  }

  // Extract entity types for cache rule matching
  const entityTypes = extractEntityTypes(entities);

  // Get cache headers from config
  const cacheHeaders = getCacheHeaders(entityTypes, isMutationRequest);
  responseHeaders.set("Cache-Control", cacheHeaders.cacheControl);
  responseHeaders.set("Surrogate-Control", cacheHeaders.surrogateControl);

  if (isMutationRequest) {
    // Mutations: trigger purge
    if (surrogateKey) {
      // Get additional invalidation targets from config
      const operationName = getOperationName(query);
      const additionalTargets = operationName
        ? getInvalidationTargets(operationName)
        : [];

      // Combine entity keys with configured invalidation targets
      const allPurgeKeys = [...surrogateKey.split(" "), ...additionalTargets];
      const uniquePurgeKeys = [...new Set(allPurgeKeys)];

      responseHeaders.set("X-Purge-Keys", uniquePurgeKeys.join(" "));
      kinesisLogger.log(
        JSON.stringify({
          event: "purge",
          timestamp,
          keys: uniquePurgeKeys,
          operationName,
        }),
      );
      await autoPurge(uniquePurgeKeys);
    }
  } else {
    // Queries: add surrogate keys for cache invalidation
    if (surrogateKey) {
      responseHeaders.set("Surrogate-Key", surrogateKey);
    }

    kinesisLogger.log(
      JSON.stringify({
        event: "cache",
        timestamp,
        entityCount: entities.size,
        entityTypes: [...entityTypes],
        surrogateKey: surrogateKey || null,
        cacheControl: cacheHeaders.cacheControl,
      }),
    );
  }

  return new Response(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

// =============================================================================
// AUTO-PURGE
// =============================================================================

async function autoPurge(keys: string[]): Promise<void> {
  try {
    const secrets = new SecretStore("orion_secretstore_35a18af5");
    const config = new ConfigStore("orion_configstore_35a18af5");

    const serviceId = config.get("VCL_SERVICE_ID");
    const apiKeySecret = await secrets.get("FASTLY_API_KEY");
    if (!serviceId || !apiKeySecret) return;

    const apiKey = apiKeySecret.plaintext();

    for (const key of keys) {
      await fetch(
        `https://api.fastly.com/service/${serviceId}/purge/${encodeURIComponent(key)}`,
        {
          backend: "fastly-api",
          method: "POST",
          headers: { "Fastly-Key": apiKey },
        },
      );
    }
  } catch {
    /* Purge failures are non-fatal */
  }
}

// =============================================================================
// UTILITIES
// =============================================================================

function parseGraphQLHeader(raw: string): { query: string; body: any } {
  // Try direct JSON parse
  try {
    const parsed = JSON.parse(raw);
    return { query: parsed.query || "", body: parsed };
  } catch {
    /* Not JSON */
  }

  // Try decoding escaped string
  const decoded = raw
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r")
    .replace(/\\\"/g, '"')
    .replace(/\\\\/g, "\\");

  try {
    const parsed = JSON.parse(decoded);
    return { query: parsed.query || "", body: parsed };
  } catch {
    /* Not JSON after decoding */
  }

  return { query: decoded, body: null };
}
