/**
 * Terraform apply
 * Merged from CLI and server deployment code
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { IAC_DIR, DEFAULT_CONFIG_PATH } from '../config.js';
import { DeployConfig, ProgressCallback } from '../types.js';

export async function applyTerraform(
  config: DeployConfig,
  onProgress?: ProgressCallback
): Promise<void> {
  onProgress?.({
    step: 'terraform',
    message: 'Creating AWS and Fastly infrastructure...',
    progress: 30,
  });

  try {
    const { hostname, protocol, port } = parseBackendUrl(config.backend.graphqlUrl);
    const hostOverride = config.backend.hostOverride || hostname;

    const defaultConfigContent = fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf-8');
    const cacheConfigStore = JSON.stringify(JSON.parse(defaultConfigContent));
    const escapedConfig = cacheConfigStore.replace(/"/g, '\\"');

    const fastlyToken = config.fastly.useEnv
      ? (process.env.FASTLY_API_KEY || process.env.FASTLY_API_TOKEN || '')
      : (config.fastly.apiToken || '');

    const env = {
      ...process.env,
      AWS_ACCESS_KEY_ID: config.aws.useEnv ? process.env.AWS_ACCESS_KEY_ID : config.aws.accessKeyId,
      AWS_SECRET_ACCESS_KEY: config.aws.useEnv ? process.env.AWS_SECRET_ACCESS_KEY : config.aws.secretAccessKey,
      AWS_DEFAULT_REGION: config.aws.region,
      FASTLY_API_KEY: fastlyToken,
      FASTLY_API_TOKEN: fastlyToken,
    };

    execSync(
      `cd ${IAC_DIR} && terraform apply -auto-approve \
        -var="compute_backend_domain=${hostname}" \
        -var="compute_backend_port=${port}" \
        -var="compute_backend_protocol=${protocol}" \
        -var="compute_backend_host_override=${hostOverride}" \
        -var="cache_config_store=${escapedConfig}" \
        -var="fastly_api_key=${fastlyToken}"`,
      { stdio: 'pipe', env }
    );

    onProgress?.({
      step: 'terraform',
      message: 'Infrastructure created successfully',
      progress: 60,
    });
  } catch (error) {
    throw new Error(`Terraform apply failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function parseBackendUrl(url: string): { hostname: string; protocol: string; port: number } {
  let urlToParse = url;
  if (!url.includes('://')) {
    urlToParse = `http://${url}`;
  }

  const parsed = new URL(urlToParse);
  const protocol = parsed.protocol.replace(':', '');
  const hostname = parsed.hostname;
  const port = parsed.port
    ? parseInt(parsed.port, 10)
    : protocol === 'https' ? 443 : 80;

  return { hostname, protocol, port };
}
