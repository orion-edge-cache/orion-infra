import type { CdnLog } from "./cdnLogTypes.js";
import type { ComputeLog } from "./computeLogTypes.js";

export type FastlyLogEntry = CdnLog | ComputeLog;

export type {
  DeployConfig,
  DestroyConfig,
  TerraformOutput,
  ProgressEvent,
  ProgressCallback,
} from "./iac.js";
