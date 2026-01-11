/**
 * Config directory cleanup utilities
 *
 * Single source of truth for cleaning up ~/.config/orion after infrastructure destroy.
 * Used by both orion-cli and orion-console.
 */

import { unlink } from "fs/promises";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { ORION_CONFIG_DIR, DEFAULT_CONFIG_PATH } from "./config.js";

/**
 * Files to delete on infrastructure destroy.
 * deployment-config.json is intentionally NOT included to preserve saved credentials.
 */
const FILES_TO_DELETE = [
  "terraform.tfstate",
  "terraform.tfstate.backup",
  "demo-app.tfstate",
  "demo-app.tfstate.backup",
  "backend-url",
  "operation.lock",
  "config.hash",
  "config.json",
  "observability.db",
];

/**
 * Clean up config directory after infrastructure destroy.
 * Deletes infrastructure-related files while preserving saved credentials.
 */
export async function cleanupAfterDestroy(): Promise<void> {
  for (const file of FILES_TO_DELETE) {
    await unlink(path.join(ORION_CONFIG_DIR, file)).catch(() => {});
  }
}

/**
 * Reset config.json to default values.
 * Called after fresh infrastructure deployment to ensure clean config state.
 */
export function resetConfigToDefaults(): void {
  mkdirSync(ORION_CONFIG_DIR, { recursive: true });
  const defaultConfig = readFileSync(DEFAULT_CONFIG_PATH, "utf-8");
  writeFileSync(path.join(ORION_CONFIG_DIR, "config.json"), defaultConfig);
}
