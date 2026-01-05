/**
 * Fastly Compute template processing
 * Merged from CLI and server deployment code
 */

import fs from 'fs';
import path from 'path';
import { EDGE_DIR } from '../config.js';
import { TerraformOutput, ProgressCallback } from '../types.js';

export async function processComputeTemplates(
  outputs: TerraformOutput,
  onProgress?: ProgressCallback
): Promise<void> {
  onProgress?.({
    step: 'templates',
    message: 'Processing Fastly Compute templates...',
    progress: 65,
  });

  const instanceId = outputs.instance_id?.value;
  const computeService = outputs.compute_service?.value;

  if (!instanceId || !computeService) {
    throw new Error('Missing required Terraform outputs');
  }

  const configstoreName = `orion_configstore_${instanceId}`;
  const secretstoreName = `orion_secretstore_${instanceId}`;

  // Process index.template.ts → index.ts
  const templateIndexPath = path.join(EDGE_DIR, 'src/index.template.ts');
  const outputIndexPath = path.join(EDGE_DIR, 'src/index.ts');

  let indexContent = fs.readFileSync(templateIndexPath, 'utf-8');
  indexContent = indexContent
    .replace(/{{configstore_name}}/g, configstoreName)
    .replace(/{{secretstore_name}}/g, secretstoreName)
    .replace(/{{backend_domain}}/g, computeService.backend_domain)
    .replace(/{{backend_protocol}}/g, computeService.backend_protocol);
  fs.writeFileSync(outputIndexPath, indexContent, 'utf-8');

  // Process fastly.template.toml → fastly.toml
  const templateTomlPath = path.join(EDGE_DIR, 'fastly.template.toml');
  const outputTomlPath = path.join(EDGE_DIR, 'fastly.toml');

  let tomlContent = fs.readFileSync(templateTomlPath, 'utf-8');
  tomlContent = tomlContent
    .replace(/{{backend_domain}}/g, computeService.backend_domain)
    .replace(/{{backend_port}}/g, String(computeService.backend_port))
    .replace(/{{compute_service_id}}/g, computeService.id);
  fs.writeFileSync(outputTomlPath, tomlContent, 'utf-8');

  // Process config.template.ts → config.ts (if exists)
  const templateConfigPath = path.join(EDGE_DIR, 'src/config.template.ts');
  const outputConfigPath = path.join(EDGE_DIR, 'src/config.ts');

  if (fs.existsSync(templateConfigPath)) {
    let configContent = fs.readFileSync(templateConfigPath, 'utf-8');
    configContent = configContent.replace(/{{configstore_name}}/g, configstoreName);
    fs.writeFileSync(outputConfigPath, configContent, 'utf-8');
  }

  // Write .env file for edge compute
  const envContent = `
FASTLY_LOGGING_ENDPOINT=${outputs.logging_endpoint?.value || ''}
KINESIS_STREAM_NAME=${outputs.kinesis_stream?.value?.name || ''}
AWS_REGION=${outputs.aws_region?.value || process.env.AWS_DEFAULT_REGION || 'us-east-1'}
`.trim();
  fs.writeFileSync(path.join(EDGE_DIR, '.env'), envContent, 'utf-8');

  onProgress?.({
    step: 'templates',
    message: `Templates processed (instance: ${instanceId})`,
    progress: 70,
  });
}
