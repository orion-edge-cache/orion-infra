// Re-export all CDN log types
export type {
  CdnLog,
  CdnLogBase,
  CdnLogRecvData,
  CdnLogMissData,
  CdnLogHitData,
  CdnLogFetchData,
  CdnLogDeliverData,
  CdnLogHashData,
  CdnLogPassData,
  CdnLogRecv,
  CdnLogHash,
  CdnLogMiss,
  CdnLogHit,
  CdnLogPass,
  CdnLogFetch,
  CdnLogDeliver,
  FastlyBaseState,
  FastlyBgErrorState,
  FastlySuffix,
  FastlyStateWithSuffix,
  FastlyInfoState,
} from "./cdnLogTypes.js";

// Re-export all Compute log types
export type {
  ComputeLog,
  ComputeLogBase,
  ComputeHealthCheckPassed,
  ComputeHealthCheckFailed,
  ComputeDebugIncomingRequest,
  ComputeDebugForwarding,
  ComputeDebugOriginResponse,
  ComputeError,
  ComputePurge,
  ComputeCache,
} from "./computeLogTypes.js";

// Union type for all Fastly logs
export type FastlyLogEntry = import("./cdnLogTypes.js").CdnLog | import("./computeLogTypes.js").ComputeLog;

// Re-export IAC types
export type {
  DeployConfig,
  DestroyConfig,
  TerraformOutput,
  ProgressEvent,
  ProgressCallback,
} from "./iac.js";
