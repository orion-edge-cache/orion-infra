/**
 * Terraform initialization
 * Merged from CLI and server deployment code
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { IAC_DIR, TFSTATE_PATH, ORION_CONFIG_DIR } from '../config.js';
import { ProgressCallback } from '../types.js';

export async function initTerraform(onProgress?: ProgressCallback): Promise<void> {
  onProgress?.({
    step: 'init',
    message: 'Initializing Terraform...',
    progress: 10,
  });

  // Ensure config directory exists
  if (!fs.existsSync(ORION_CONFIG_DIR)) {
    fs.mkdirSync(ORION_CONFIG_DIR, { recursive: true });
  }

  try {
    const backendConfigArg = `-backend-config="path=${TFSTATE_PATH}"`;
    execSync(`cd ${IAC_DIR} && terraform init -reconfigure ${backendConfigArg}`, {
      stdio: 'pipe',
      env: { ...process.env },
    });

    onProgress?.({
      step: 'init',
      message: 'Terraform initialized',
      progress: 20,
    });
  } catch (error) {
    throw new Error(`Terraform init failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
