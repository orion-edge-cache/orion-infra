/**
 * @orion/infra - Infrastructure provisioning for Orion GraphQL Edge Cache
 * Public API exports
 */

// High-level API
export { deployInfrastructure } from "./deploy.js";
export { destroyInfrastructure } from "./destroy.js";
export { cleanupAfterDestroy, resetConfigToDefaults } from "./cleanup.js";

// Low-level Terraform API
export {
  initTerraform,
  applyTerraform,
  destroyTerraform,
  planDestroyTerraform,
  deleteTfState,
  getTerraformOutputs,
  checkTfStateExists,
  type DestroyPlanResult,
} from "./terraform/index.js";

// Low-level Compute API
export {
  processComputeTemplates,
  buildCompute,
  deployCompute,
} from "./compute/index.js";

// Types - CDN Logs
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
} from "./types/index.js";

// Types - Compute Logs
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
} from "./types/index.js";

// Types - Union
export type { FastlyLogEntry } from "./types/index.js";

// Types - IAC
export type {
  DeployConfig,
  DestroyConfig,
  TerraformOutput,
  ProgressEvent,
  ProgressCallback,
} from "./types/index.js";

// Config (for consumers who need paths)
export {
  INFRA_ROOT,
  IAC_DIR,
  EDGE_DIR,
  DEFAULT_CONFIG_PATH,
  ORION_CONFIG_DIR,
  TFSTATE_PATH,
  BACKEND_URL_PATH,
} from "./config.js";
