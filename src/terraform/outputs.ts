/**
 * Terraform outputs
 * Merged from CLI and server deployment code
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { IAC_DIR, TFSTATE_PATH, ORION_CONFIG_DIR } from '../config.js';
import { TerraformOutput } from '../types.js';

/**
 * Ensure terraform is initialized with the correct backend config.
 * This is needed because the .terraform directory may not exist or
 * may be configured with a different backend path.
 */
function ensureInitialized(): void {
  const terraformDir = path.join(IAC_DIR, '.terraform');

  // Check if terraform is initialized
  if (!fs.existsSync(terraformDir)) {
    // Ensure config directory exists
    if (!fs.existsSync(ORION_CONFIG_DIR)) {
      fs.mkdirSync(ORION_CONFIG_DIR, { recursive: true });
    }

    const backendConfigArg = `-backend-config="path=${TFSTATE_PATH}"`;
    execSync(`cd ${IAC_DIR} && terraform init -reconfigure ${backendConfigArg}`, {
      stdio: 'pipe',
      env: { ...process.env },
    });
  }
}

export function getTerraformOutputs(): TerraformOutput {
  try {
    ensureInitialized();
    const output = execSync(`cd ${IAC_DIR} && terraform output -json`, {
      stdio: 'pipe',
    });
    return JSON.parse(output.toString());
  } catch (error) {
    throw new Error(`Failed to get terraform outputs: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function checkTfStateExists(): boolean {
  return fs.existsSync(TFSTATE_PATH);
}
