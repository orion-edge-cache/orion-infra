/**
 * Terraform outputs
 * Merged from CLI and server deployment code
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { IAC_DIR, TFSTATE_PATH } from '../config.js';
import { TerraformOutput } from '../types.js';

export function getTerraformOutputs(): TerraformOutput {
  try {
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
