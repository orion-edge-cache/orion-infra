/**
 * High-level destroy orchestration
 */

import { destroyTerraform, deleteTfState } from './terraform/destroy.js';
import { DestroyConfig, ProgressCallback } from './types.js';

export async function destroyInfrastructure(
  config: DestroyConfig,
  onProgress?: ProgressCallback
): Promise<void> {
  onProgress?.({
    step: 'start',
    message: 'Starting infrastructure destruction...',
    progress: 0,
  });

  await destroyTerraform(config, onProgress);
  await deleteTfState();

  onProgress?.({
    step: 'complete',
    message: 'Infrastructure destroyed!',
    progress: 100,
  });
}
