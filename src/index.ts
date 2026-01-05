/**
 * @orion/infra - Infrastructure provisioning for Orion GraphQL Edge Cache
 * Public API exports
 */

// High-level API
export { deployInfrastructure } from './deploy.js';
export { destroyInfrastructure } from './destroy.js';

// Low-level Terraform API
export {
  initTerraform,
  applyTerraform,
  destroyTerraform,
  deleteTfState,
  getTerraformOutputs,
  checkTfStateExists,
} from './terraform/index.js';

// Low-level Compute API
export {
  processComputeTemplates,
  buildCompute,
  deployCompute,
} from './compute/index.js';

// Types
export type {
  DeployConfig,
  DestroyConfig,
  TerraformOutput,
  ProgressEvent,
  ProgressCallback,
} from './types.js';

// Config (for consumers who need paths)
export {
  INFRA_ROOT,
  IAC_DIR,
  EDGE_DIR,
  ORION_CONFIG_DIR,
  TFSTATE_PATH,
  BACKEND_URL_PATH,
} from './config.js';
