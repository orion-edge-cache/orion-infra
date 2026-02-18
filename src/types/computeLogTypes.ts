// Base compute log structure
export interface ComputeLogBase {
  request_id: string;
  source: "compute";
  event: "debug" | "error" | "health check" | "purge" | "cache";
  level: "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// Health Check Logs (no timestamp, empty data)
export interface ComputeHealthCheckPassed extends ComputeLogBase {
  event: "health check";
  level: "info";
  message: "Health check passed";
  data: {};
}

export interface ComputeHealthCheckFailed extends ComputeLogBase {
  event: "health check";
  level: "error";
  message: "Health check failed";
  data: {};
}

// Debug - Incoming Request
export interface ComputeDebugIncomingRequest extends ComputeLogBase {
  event: "debug";
  level: "debug";
  data: {
    url: string;
    method: string;
    backend: string;
    operationType: "query" | "mutation";
    isMutation: boolean;
  };
}

// Debug - Forwarding to Origin
export interface ComputeDebugForwarding extends ComputeLogBase {
  event: "debug";
  level: "debug";
  data: {
    url: string;
    method: string;
    backend: string;
    body: string;
  };
}

// Debug - Origin Response
export interface ComputeDebugOriginResponse extends ComputeLogBase {
  event: "debug";
  level: "debug";
  data: {
    url: string;
    status: number;
    statusText: string;
    body: string;
  };
}

// Error - Non-200 Response
export interface ComputeError extends ComputeLogBase {
  event: "error";
  level: "error";
  message: string; // e.g., "[500] Internal Server Error"
  timestamp: string;
  data: {
    status: number;
    statusText: string;
    body: string;
    operationType: "query" | "mutation";
  };
}

// Purge - Mutation with surrogate key
export interface ComputePurge extends ComputeLogBase {
  event: "purge";
  message: "Is Mutation with surrogate key";
  data: {
    keys: string[];
    operationName: string;
  };
}

// Cache - Query (non-mutation)
export interface ComputeCache extends ComputeLogBase {
  event: "cache";
  message: "Is Mutation without surrogate key";
  data: {
    entityCount: number;
    entityTypes: string[];
    surrogateKey: string | null;
    cacheControl: string;
  };
}

// Union type for all compute logs
export type ComputeLog =
  | ComputeHealthCheckPassed
  | ComputeHealthCheckFailed
  | ComputeDebugIncomingRequest
  | ComputeDebugForwarding
  | ComputeDebugOriginResponse
  | ComputeError
  | ComputePurge
  | ComputeCache;
