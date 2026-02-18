/**
 * Fastly Compute deploy
 * Merged from CLI and server deployment code
 */

import { EDGE_DIR } from "../config.js";
import { ProgressCallback } from "../types/index.js";
import { exec } from "../exec.js";

export async function deployCompute(
  fastlyToken: string,
  onProgress?: ProgressCallback,
): Promise<void> {
  onProgress?.({
    step: "deploy",
    message: "Deploying Fastly Compute service...",
    progress: 90,
  });

  try {
    await exec("fastly", ["compute", "publish", "--token", fastlyToken], {
      cwd: EDGE_DIR,
      env: { FASTLY_API_KEY: fastlyToken },
      onProgress,
      progressStep: "deploy",
      progressPercent: 92,
    });

    onProgress?.({
      step: "deploy",
      message: "Compute service deployed",
      progress: 95,
    });
  } catch (error) {
    throw new Error(
      `Fastly deploy failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
