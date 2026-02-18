export interface CdnLogBase {
  request_id: string;
  source: "cdn";
  level: "info";
  event: "recv" | "hash" | "miss" | "hit" | "pass" | "fetch" | "deliver";
  timestamp: string;
  message: string;
}

// Recv subroutine data
export interface CdnLogRecvData {
  cdn_version: string;
  req_host: string;
  req_path: string;
  req_method: string;
  req_body: string;
  req_restarts: string;
  req_user_agent: string;
  req_accept: string;
  req_content_type: string;
  req_origin: string;
  req_referrer: string;
  req_x_graphql_query: string;
  req_is_purge: "true" | "false";
}

// Miss subroutine data
export interface CdnLogMissData {
  bereq_method: string;
  bereq_proto: string;
  bereq_url_basename: string;
  bereq_url_path: string;
  bereq_url_qs: string;
  bereq_url: string;
  req_backend_is_origin: "true" | "false";
}

// Hit subroutine data
export interface CdnLogHitData {
  obj_age: string;
  obj_cacheable: "true" | "false";
  obj_hits: string;
  obj_lastuse: string;
  obj_response: string;
  obj_protocol: string;
  obj_sie: string;
  obj_swr: string;
  obj_status: string;
  obj_ttl: string;
}

// Fetch subroutine data
export interface CdnLogFetchData {
  beresp_response: string;
  beresp_protocol: string;
  beresp_backend_host: string;
  beresp_backend_name: string;
  beresp_cacheable: "true" | "false";
  beresp_sie: string;
  beresp_swr: string;
  beresp_status: string;
  beresp_ttl: string;
}

// Base states
export type FastlyBaseState =
  | "NONE"
  | "HIT"
  | "HITPASS"
  | "HIT-STALE"
  | "HIT-SYNTH"
  | "MISS"
  | "PASS"
  | "UPGRADE"
  | "ERROR"
  | "ERROR-LOSTHDR";
// Background error states
export type FastlyBgErrorState = "BG-ERROR-PASS" | "BG-ERROR-RECV" | "BG-ERROR-ERROR";
// Suffixes
export type FastlySuffix = "-CLUSTER" | "-REFRESH" | "-WAIT";
// Combined type: base state with optional suffix
export type FastlyStateWithSuffix =
  | FastlyBaseState
  | FastlyBgErrorState
  | `${FastlyBaseState}${FastlySuffix}`
  | `${FastlyBaseState}${FastlySuffix}${FastlySuffix}`;
export type FastlyInfoState = FastlyStateWithSuffix;

export interface CdnLogDeliverData {
  cdn_version: string;
  client_ip: string;
  req_host: string;
  req_url: string;
  req_method: string;
  req_protocol: string;
  req_user_agent: string;
  fastly_cache_state: FastlyInfoState;
  resp_status: number;
  resp_response: string | null;
  resp_body_size: number;
  fastly_server: string;
  fastly_is_edge: boolean;
  req_x_health_check: string | "null";
  req_x_graphql_query: string | "null";
  req_x_debug_cache_reason: string;
  req_body: string;
  time_to_first_byte: string;
  time_elapsed: string;
}

// Hash and Pass have empty data objects
export interface CdnLogHashData {}
export interface CdnLogPassData {}

// Complete log types by subroutine
export interface CdnLogRecv extends CdnLogBase {
  event: "recv";
  data: CdnLogRecvData;
}

export interface CdnLogHash extends CdnLogBase {
  event: "hash";
  data: CdnLogHashData;
}

export interface CdnLogMiss extends CdnLogBase {
  event: "miss";
  data: CdnLogMissData;
}

export interface CdnLogHit extends CdnLogBase {
  event: "hit";
  data: CdnLogHitData;
}

export interface CdnLogPass extends CdnLogBase {
  event: "pass";
  data: CdnLogPassData;
}

export interface CdnLogFetch extends CdnLogBase {
  event: "fetch";
  data: CdnLogFetchData;
}

export interface CdnLogDeliver extends CdnLogBase {
  event: "deliver";
  data: CdnLogDeliverData;
}

// Union type for all CDN logs
export type CdnLog =
  | CdnLogRecv
  | CdnLogHash
  | CdnLogMiss
  | CdnLogHit
  | CdnLogPass
  | CdnLogFetch
  | CdnLogDeliver;
