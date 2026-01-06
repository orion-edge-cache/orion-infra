/**
 * Terraform outputs
 * Merged from CLI and server deployment code
 */

import fs from 'fs';
import path from 'path';
import { IAC_DIR, TFSTATE_PATH, ORION_CONFIG_DIR } from '../config.js';
import { TerraformOutput } from '../types.js';
import { exec } from '../exec.js';

/**
 * Ensure terraform is initialized with the correct backend config.
 * This is needed because the .terraform directory may not exist or
 * may be configured with a different backend path.
 */
async function ensureInitialized(onInit?: () => void): Promise<void> {
  const terraformDir = path.join(IAC_DIR, '.terraform');

  // Check if terraform is initialized
  if (!fs.existsSync(terraformDir)) {
    // Signal that initialization is starting
    onInit?.();

    // Ensure config directory exists
    if (!fs.existsSync(ORION_CONFIG_DIR)) {
      fs.mkdirSync(ORION_CONFIG_DIR, { recursive: true });
    }

    await exec('terraform', [
      'init',
      '-reconfigure',
      `-backend-config=path=${TFSTATE_PATH}`,
    ], {
      cwd: IAC_DIR,
    });
  }
}

export async function getTerraformOutputs(onInit?: () => void): Promise<TerraformOutput> {
  try {
    await ensureInitialized(onInit);
    const result = await exec('terraform', ['output', '-json'], {
      cwd: IAC_DIR,
    });
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`Failed to get terraform outputs: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function checkTfStateExists(): boolean {
  return fs.existsSync(TFSTATE_PATH);
}
