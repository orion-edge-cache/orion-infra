/**
 * Async command execution helper with output streaming
 * Replaces execSync to allow event loop to run (for spinners/progress)
 */

import { execa, Options } from "execa";
import { ProgressCallback } from "./types/index.js";

export interface CommandExecutionOptions {
  cwd?: string;
  env?: Record<string, string>;
  onProgress?: ProgressCallback;
  progressStep?: string;
  progressPercent?: number;
  /** Set to true for shell commands with pipes, redirects, or complex syntax */
  shell?: boolean;
}

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
}

// Backwards compatibility type aliases
export type ExecOptions = CommandExecutionOptions;
export type ExecResult = CommandExecutionResult;

/**
 * Attach progress streaming to subprocess stdout and stderr
 */
function attachProgressStreamers(
  subprocess: ReturnType<typeof execa>,
  options: CommandExecutionOptions,
): void {
  const { onProgress, progressStep, progressPercent } = options;

  const handleData = (data: Buffer) => {
    const line = data.toString().trim();
    if (
      line &&
      onProgress &&
      progressStep !== undefined &&
      progressPercent !== undefined
    ) {
      onProgress({
        step: progressStep,
        message: line,
        progress: progressPercent,
      });
    }
  };

  subprocess.stdout?.on("data", handleData);
  subprocess.stderr?.on("data", handleData);
}

/**
 * Execute a command asynchronously with output streaming to progress callback
 *
 * @param command - The command to execute
 * @param args - Command arguments (pass empty array for shell commands)
 * @param options - Execution options including progress callbacks
 */
export async function executeCommand(
  command: string,
  args: string[],
  options: CommandExecutionOptions = {},
): Promise<CommandExecutionResult> {
  const { cwd, env, shell } = options;

  const execaOptions: Options = {
    cwd,
    env: env ? { ...process.env, ...env } : undefined,
    reject: false,
    ...(shell && { shell: true }),
  };

  const subprocess = execa(command, args, execaOptions);

  attachProgressStreamers(subprocess, options);

  const result = await subprocess;

  if (result.exitCode !== 0) {
    const stdout = typeof result.stdout === "string" ? result.stdout : "";
    const stderr = typeof result.stderr === "string" ? result.stderr : "";
    const errorMessage =
      stderr || stdout || `Command failed with exit code ${result.exitCode}`;
    throw new Error(errorMessage);
  }

  return {
    stdout: typeof result.stdout === "string" ? result.stdout : "",
    stderr: typeof result.stderr === "string" ? result.stderr : "",
  };
}

/**
 * Execute a command asynchronously with output streaming to progress callback
 * @deprecated Use executeCommand instead
 */
export async function exec(
  command: string,
  args: string[],
  options: CommandExecutionOptions = {},
): Promise<CommandExecutionResult> {
  return executeCommand(command, args, options);
}

/**
 * Execute a shell command string asynchronously
 * Use this for commands with pipes, redirects, or complex shell syntax
 * @deprecated Use executeCommand with shell: true instead
 */
export async function execShell(
  command: string,
  options: CommandExecutionOptions = {},
): Promise<CommandExecutionResult> {
  return executeCommand(command, [], { ...options, shell: true });
}
