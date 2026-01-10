/**
 * Terraform initialization
 * Merged from CLI and server deployment code
 */

import fs from 'fs';
import { IAC_DIR, TFSTATE_PATH, ORION_CONFIG_DIR } from '../config.js';
import { ProgressCallback } from '../types.js';
import { exec } from '../exec.js';

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
    await exec('terraform', [
      'init',
      '-reconfigure',
      '-no-color',
      `-backend-config=path=${TFSTATE_PATH}`,
    ], {
      cwd: IAC_DIR,
      onProgress,
      progressStep: 'init',
      progressPercent: 15,
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
