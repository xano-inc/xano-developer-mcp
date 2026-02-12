/**
 * MCP Version Tool
 *
 * Returns the current version of the Xano Developer MCP server.
 * Can be used standalone or within the MCP server.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { ToolResult } from "./types.js";

// =============================================================================
// Types
// =============================================================================

export interface McpVersionResult {
  version: string;
}

// =============================================================================
// Version Resolution
// =============================================================================

let _version: string | null = null;

/**
 * Get the MCP server version from package.json.
 */
export function getServerVersion(): string {
  if (_version !== null) return _version;

  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Try multiple paths for package.json
    const possiblePaths = [
      join(__dirname, "..", "..", "package.json"), // dist/tools -> root
      join(__dirname, "..", "..", "..", "package.json"), // src/tools -> root
    ];

    for (const p of possiblePaths) {
      try {
        const pkg = JSON.parse(readFileSync(p, "utf-8"));
        if (pkg.version) {
          const version: string = pkg.version;
          _version = version;
          return version;
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Fallback
  }

  _version = "unknown";
  return "unknown";
}

/**
 * Set a custom version (useful for testing)
 */
export function setServerVersion(version: string): void {
  _version = version;
}

// =============================================================================
// Standalone Tool Function
// =============================================================================

/**
 * Get the MCP server version.
 *
 * @returns Version information
 *
 * @example
 * ```ts
 * import { mcpVersion } from '@xano/developer-mcp';
 *
 * const { version } = mcpVersion();
 * console.log(`Running version ${version}`);
 * ```
 */
export function mcpVersion(): McpVersionResult {
  return { version: getServerVersion() };
}

/**
 * Get the MCP version and return a ToolResult.
 */
export function mcpVersionTool(): ToolResult {
  return {
    success: true,
    data: getServerVersion(),
  };
}

// =============================================================================
// MCP Tool Definition
// =============================================================================

export const mcpVersionToolDefinition = {
  name: "mcp_version",
  description:
    "Get the current version of the Xano Developer MCP server. " +
    "Returns the version string from package.json.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};
