/**
 * Terraform plan for destruction preview
 *
 * NOTE: This function is currently not used. The CLI uses a simpler approach
 * consistent with orion-console: reading Terraform outputs via getTerraformOutputs()
 * and displaying a resource list. This function is kept available for future use
 * if detailed Terraform plan output is needed.
 */

import { IAC_DIR } from '../config.js';
import { DestroyConfig, ProgressCallback } from '../types.js';
import { exec } from '../exec.js';

export interface DestroyPlanResult {
  planOutput: string;
  hasChanges: boolean;
}

export async function planDestroyTerraform(
  config: DestroyConfig,
  onProgress?: ProgressCallback
): Promise<DestroyPlanResult> {
  onProgress?.({
    step: 'plan',
    message: 'Generating destroy plan...',
    progress: 20,
  });

  const env: Record<string, string> = {
    AWS_ACCESS_KEY_ID: config.awsAccessKeyId,
    AWS_SECRET_ACCESS_KEY: config.awsSecretAccessKey,
    AWS_DEFAULT_REGION: config.awsRegion,
    FASTLY_API_KEY: config.fastlyApiToken,
    FASTLY_API_TOKEN: config.fastlyApiToken,
  };

  const result = await exec('terraform', [
    'plan',
    '-destroy',
    '-no-color',
    '-var=compute_backend_domain=destroy.local',
    '-var=compute_backend_protocol=https',
    '-var=compute_backend_port=443',
    '-var=compute_backend_host_override=destroy.local',
    `-var=fastly_api_key=${config.fastlyApiToken}`,
  ], {
    cwd: IAC_DIR,
    env,
    onProgress,
    progressStep: 'plan',
    progressPercent: 25,
  });

  onProgress?.({
    step: 'plan',
    message: 'Destroy plan generated',
    progress: 30,
  });

  const hasChanges = !result.stdout.includes('No changes');

  return {
    planOutput: result.stdout,
    hasChanges,
  };
}
