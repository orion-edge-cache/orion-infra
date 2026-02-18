/**
 * Terraform destroy
 * Merged from CLI and server deployment code
 */

import fs from "fs";
import { IAC_DIR, TFSTATE_PATH } from "../config.js";
import type { DestroyConfig, ProgressCallback } from "../types/index.js";
import { exec } from "../exec.js";

export async function destroyTerraform(
  config: DestroyConfig,
  onProgress?: ProgressCallback,
): Promise<void> {
  onProgress?.({
    step: "destroy",
    message: "Destroying infrastructure...",
    progress: 30,
  });

  const env: Record<string, string> = {
    AWS_ACCESS_KEY_ID: config.awsAccessKeyId,
    AWS_SECRET_ACCESS_KEY: config.awsSecretAccessKey,
    AWS_DEFAULT_REGION: config.awsRegion,
    FASTLY_API_KEY: config.fastlyApiToken,
    FASTLY_API_TOKEN: config.fastlyApiToken,
  };

  await exec(
    "terraform",
    [
      "destroy",
      "-auto-approve",
      "-no-color",
      "-var=compute_backend_domain=destroy.local",
      "-var=compute_backend_protocol=https",
      "-var=compute_backend_port=443",
      "-var=compute_backend_host_override=destroy.local",
      `-var=fastly_api_key=${config.fastlyApiToken}`,
    ],
    {
      cwd: IAC_DIR,
      env,
      onProgress,
      progressStep: "destroy",
      progressPercent: 55,
    },
  );

  onProgress?.({
    step: "destroy",
    message: "Infrastructure destroyed",
    progress: 80,
  });
}

export async function deleteTfState(): Promise<void> {
  try {
    if (fs.existsSync(TFSTATE_PATH)) {
      fs.unlinkSync(TFSTATE_PATH);
    }
    const backupPath = `${TFSTATE_PATH}.backup`;
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  } catch (error) {
    console.warn("Failed to delete tfstate files:", error);
  }
}
