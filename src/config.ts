/**
 * Path configuration for @orion/infra
 */

import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Package root (where iac/ and edge/ are located)
export const INFRA_ROOT = path.join(__dirname, '..');

// Infrastructure paths
export const IAC_DIR = path.join(INFRA_ROOT, 'iac');
export const EDGE_DIR = path.join(INFRA_ROOT, 'edge');
export const DEFAULT_CONFIG_PATH = path.join(EDGE_DIR, 'src/defaultConfig.json');

// User config paths
export const ORION_CONFIG_DIR = path.join(os.homedir(), '.config/orion');
export const TFSTATE_PATH = path.join(ORION_CONFIG_DIR, 'terraform.tfstate');
export const CREDENTIALS_PATH = path.join(ORION_CONFIG_DIR, 'credentials.json');
export const BACKEND_URL_PATH = path.join(ORION_CONFIG_DIR, 'backend-url');
