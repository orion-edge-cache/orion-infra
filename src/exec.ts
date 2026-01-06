/**
 * Async command execution helper with output streaming
 * Replaces execSync to allow event loop to run (for spinners/progress)
 */

import { execa, Options } from 'execa';
import { ProgressCallback } from './types.js';

export interface ExecOptions {
  cwd?: string;
  env?: Record<string, string>;
  onProgress?: ProgressCallback;
  progressStep?: string;
  progressPercent?: number;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
}

/**
 * Execute a command asynchronously with output streaming to progress callback
 */
export async function exec(
  command: string,
  args: string[],
  options: ExecOptions = {}
): Promise<ExecResult> {
  const { cwd, env, onProgress, progressStep, progressPercent } = options;

  const execaOptions: Options = {
    cwd,
    env: env ? { ...process.env, ...env } : undefined,
    reject: false,
  };

  const subprocess = execa(command, args, execaOptions);

  // Stream stdout
  subprocess.stdout?.on('data', (data: Buffer) => {
    const line = data.toString().trim();
    if (line && onProgress && progressStep !== undefined && progressPercent !== undefined) {
      onProgress({
        step: progressStep,
        message: line,
        progress: progressPercent,
      });
    }
  });

  // Stream stderr
  subprocess.stderr?.on('data', (data: Buffer) => {
    const line = data.toString().trim();
    if (line && onProgress && progressStep !== undefined && progressPercent !== undefined) {
      onProgress({
        step: progressStep,
        message: line,
        progress: progressPercent,
      });
    }
  });

  const result = await subprocess;

  if (result.exitCode !== 0) {
    const stdout = typeof result.stdout === 'string' ? result.stdout : '';
    const stderr = typeof result.stderr === 'string' ? result.stderr : '';
    const errorMessage = stderr || stdout || `Command failed with exit code ${result.exitCode}`;
    throw new Error(errorMessage);
  }

  return {
    stdout: typeof result.stdout === 'string' ? result.stdout : '',
    stderr: typeof result.stderr === 'string' ? result.stderr : '',
  };
}

/**
 * Execute a shell command string asynchronously
 * Use this for commands with pipes, redirects, or complex shell syntax
 */
export async function execShell(
  command: string,
  options: ExecOptions = {}
): Promise<ExecResult> {
  const { cwd, env, onProgress, progressStep, progressPercent } = options;

  const execaOptions: Options = {
    cwd,
    env: env ? { ...process.env, ...env } : undefined,
    shell: true,
    reject: false,
  };

  const subprocess = execa(command, [], execaOptions);

  // Stream stdout
  subprocess.stdout?.on('data', (data: Buffer) => {
    const line = data.toString().trim();
    if (line && onProgress && progressStep !== undefined && progressPercent !== undefined) {
      onProgress({
        step: progressStep,
        message: line,
        progress: progressPercent,
      });
    }
  });

  // Stream stderr
  subprocess.stderr?.on('data', (data: Buffer) => {
    const line = data.toString().trim();
    if (line && onProgress && progressStep !== undefined && progressPercent !== undefined) {
      onProgress({
        step: progressStep,
        message: line,
        progress: progressPercent,
      });
    }
  });

  const result = await subprocess;

  if (result.exitCode !== 0) {
    const stdout = typeof result.stdout === 'string' ? result.stdout : '';
    const stderr = typeof result.stderr === 'string' ? result.stderr : '';
    const errorMessage = stderr || stdout || `Command failed with exit code ${result.exitCode}`;
    throw new Error(errorMessage);
  }

  return {
    stdout: typeof result.stdout === 'string' ? result.stdout : '',
    stderr: typeof result.stderr === 'string' ? result.stderr : '',
  };
}
