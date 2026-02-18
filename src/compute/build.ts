/**
 * Fastly Compute build
 * Merged from CLI and server deployment code
 */

import { EDGE_DIR } from "../config.js";
import { ProgressCallback } from "../types/index.js";
import { exec } from "../exec.js";

export async function buildCompute(
  onProgress?: ProgressCallback,
): Promise<void> {
  onProgress?.({
    step: "build",
    message: "Installing edge compute dependencies...",
    progress: 72,
  });

  try {
    await exec("npm", ["ci"], {
      cwd: EDGE_DIR,
      onProgress,
      progressStep: "build",
      progressPercent: 74,
    });
  } catch (error) {
    throw new Error(
      `Fastly dependency install failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  onProgress?.({
    step: "build",
    message: "Building Fastly Compute service...",
    progress: 78,
  });

  try {
    await exec("npm", ["run", "build"], {
      cwd: EDGE_DIR,
      onProgress,
      progressStep: "build",
      progressPercent: 82,
    });

    onProgress?.({
      step: "build",
      message: "Compute service built",
      progress: 85,
    });
  } catch (error) {
    throw new Error(
      `Fastly build failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
