/**
 * Terraform destroy
 * Merged from CLI and server deployment code
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { IAC_DIR, TFSTATE_PATH } from '../config.js';
import { DestroyConfig, ProgressCallback } from '../types.js';

export async function destroyTerraform(
  config: DestroyConfig,
  onProgress?: ProgressCallback
): Promise<void> {
  onProgress?.({
    step: 'destroy',
    message: 'Destroying infrastructure...',
    progress: 30,
  });

  const env = {
    ...process.env,
    AWS_ACCESS_KEY_ID: config.awsAccessKeyId,
    AWS_SECRET_ACCESS_KEY: config.awsSecretAccessKey,
    AWS_DEFAULT_REGION: config.awsRegion,
    FASTLY_API_KEY: config.fastlyApiToken,
    FASTLY_API_TOKEN: config.fastlyApiToken,
  };

  execSync(
    `cd ${IAC_DIR} && terraform destroy -auto-approve \
      -var="compute_backend_domain=destroy.local" \
      -var="compute_backend_protocol=https" \
      -var="compute_backend_port=443" \
      -var="compute_backend_host_override=destroy.local" \
      -var="fastly_api_key=${config.fastlyApiToken}"`,
    { stdio: 'pipe', env, timeout: 300000 }
  );

  onProgress?.({
    step: 'destroy',
    message: 'Infrastructure destroyed',
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
    console.warn('Failed to delete tfstate files:', error);
  }
}
