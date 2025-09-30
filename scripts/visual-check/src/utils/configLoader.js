/**
 * Config Loader - Loads and validates configuration
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadConfig(configPath) {
  try {
    // Resolve config path relative to project root
    const resolvedPath = path.isAbsolute(configPath)
      ? configPath
      : path.join(process.cwd(), configPath);

    const configContent = await fs.readFile(resolvedPath, 'utf-8');
    const config = JSON.parse(configContent);

    // Validate required fields
    validateConfig(config);

    // Resolve relative paths
    config.paths = resolvePaths(config.paths, path.dirname(resolvedPath));

    return config;

  } catch (error) {
    throw new Error(`Failed to load config from ${configPath}: ${error.message}`);
  }
}

function validateConfig(config) {
  const required = ['url', 'viewports', 'paths'];

  for (const field of required) {
    if (!config[field]) {
      throw new Error(`Missing required config field: ${field}`);
    }
  }

  if (!Array.isArray(config.viewports) || config.viewports.length === 0) {
    throw new Error('Config must include at least one viewport');
  }

  for (const viewport of config.viewports) {
    if (!viewport.name || !viewport.width || !viewport.height) {
      throw new Error('Each viewport must have name, width, and height');
    }
  }
}

function resolvePaths(paths, configDir) {
  const resolved = {};

  for (const [key, value] of Object.entries(paths)) {
    if (path.isAbsolute(value)) {
      resolved[key] = value;
    } else {
      resolved[key] = path.join(configDir, value);
    }
  }

  return resolved;
}
