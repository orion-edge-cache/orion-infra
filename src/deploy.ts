/**
 * High-level deployment orchestration
 */

import fs from "fs";
import { ORION_CONFIG_DIR, TFSTATE_PATH } from "./config.js";
import { initTerraform } from "./terraform/init.js";
import { applyTerraform } from "./terraform/apply.js";
import { getTerraformOutputs } from "./terraform/outputs.js";
import { processComputeTemplates } from "./compute/templates.js";
import { buildCompute } from "./compute/build.js";
import { deployCompute } from "./compute/deploy.js";
import { DeployConfig, ProgressCallback } from "./types/index.js";

export async function deployInfrastructure(
  config: DeployConfig,
  onProgress?: ProgressCallback,
): Promise<void> {
  onProgress?.({
    step: "start",
    message: "Starting deployment...",
    progress: 0,
  });

  // Ensure config directory exists
  if (!fs.existsSync(ORION_CONFIG_DIR)) {
    fs.mkdirSync(ORION_CONFIG_DIR, { recursive: true });
  }

  // Check if already deployed
  if (fs.existsSync(TFSTATE_PATH)) {
    throw new Error("Infrastructure already exists. Destroy it first.");
  }

  // Resolve Fastly token
  const fastlyToken = config.fastly.useEnv
    ? process.env.FASTLY_API_KEY || process.env.FASTLY_API_TOKEN || ""
    : config.fastly.apiToken || "";

  if (!fastlyToken) {
    throw new Error("Fastly API token is required");
  }

  // Execute deployment steps
  await initTerraform(onProgress);
  await applyTerraform(config, onProgress);

  const outputs = await getTerraformOutputs();
  await processComputeTemplates(outputs, onProgress);

  await buildCompute(onProgress);
  await deployCompute(fastlyToken, onProgress);

  onProgress?.({
    step: "complete",
    message: "Deployment complete!",
    progress: 100,
  });
}
