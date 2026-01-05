/**
 * Fastly Compute build
 * Merged from CLI and server deployment code
 */

import { execSync } from 'child_process';
import { EDGE_DIR } from '../config.js';
import { ProgressCallback } from '../types.js';

export async function buildCompute(onProgress?: ProgressCallback): Promise<void> {
  onProgress?.({
    step: 'build',
    message: 'Building Fastly Compute service...',
    progress: 75,
  });

  try {
    execSync('npm run build', {
      cwd: EDGE_DIR,
      stdio: 'pipe',
    });

    onProgress?.({
      step: 'build',
      message: 'Compute service built',
      progress: 85,
    });
  } catch (error) {
    throw new Error(`Fastly build failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
