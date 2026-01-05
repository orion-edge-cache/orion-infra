/**
 * Fastly Compute deploy
 * Merged from CLI and server deployment code
 */

import { execSync } from 'child_process';
import { EDGE_DIR } from '../config.js';
import { ProgressCallback } from '../types.js';

export async function deployCompute(
  fastlyToken: string,
  onProgress?: ProgressCallback
): Promise<void> {
  onProgress?.({
    step: 'deploy',
    message: 'Deploying Fastly Compute service...',
    progress: 90,
  });

  try {
    execSync(`fastly compute publish --token ${fastlyToken}`, {
      cwd: EDGE_DIR,
      stdio: 'pipe',
      env: { ...process.env, FASTLY_API_KEY: fastlyToken },
    });

    onProgress?.({
      step: 'deploy',
      message: 'Compute service deployed',
      progress: 95,
    });
  } catch (error) {
    throw new Error(`Fastly deploy failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
