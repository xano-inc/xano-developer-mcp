/**
 * XanoScript Documentation Tool
 *
 * Retrieves XanoScript programming language documentation.
 * Can be used standalone or within the MCP server.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  readXanoscriptDocsV2,
  getTopicDescriptions,
  type XanoscriptDocsArgs,
} from "../xanoscript.js";
import type { ToolResult } from "./types.js";

// =============================================================================
// Types
// =============================================================================

export type { XanoscriptDocsArgs };

export interface XanoscriptDocsResult {
  documentation: string;
}

// =============================================================================
// Path Resolution
// =============================================================================

let _docsPath: string | null = null;

/**
 * Get the path to XanoScript documentation files.
 * Searches common locations for production and development.
 */
export function getXanoscriptDocsPath(): string {
  if (_docsPath) return _docsPath;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const possiblePaths = [
    join(__dirname, "..", "xanoscript_docs"), // dist/xanoscript_docs (production)
    join(__dirname, "..", "..", "src", "xanoscript_docs"), // src/xanoscript_docs (dev)
    join(__dirname, "..", "..", "xanoscript_docs"), // fallback
  ];

  for (const p of possiblePaths) {
    try {
      readFileSync(join(p, "version.json"));
      _docsPath = p;
      return p;
    } catch {
      continue;
    }
  }

  // Default fallback
  _docsPath = join(__dirname, "..", "xanoscript_docs");
  return _docsPath;
}

/**
 * Set a custom docs path (useful for testing or custom installations)
 */
export function setXanoscriptDocsPath(path: string): void {
  _docsPath = path;
}

// =============================================================================
// Standalone Tool Function
// =============================================================================

/**
 * Get XanoScript documentation.
 *
 * @param args - Optional documentation arguments
 * @returns Documentation content
 *
 * @example
 * ```ts
 * import { xanoscriptDocs } from '@xano/developer-mcp';
 *
 * // Get overview
 * const overview = xanoscriptDocs();
 *
 * // Get specific topic
 * const syntaxDocs = xanoscriptDocs({ topic: 'syntax' });
 *
 * // Get context-aware docs for a file
 * const fileDocs = xanoscriptDocs({ file_path: 'apis/users/create.xs' });
 *
 * // Get quick reference only
 * const quickRef = xanoscriptDocs({ topic: 'syntax', mode: 'quick_reference' });
 * ```
 */
export function xanoscriptDocs(args?: XanoscriptDocsArgs): XanoscriptDocsResult {
  const docsPath = getXanoscriptDocsPath();
  const documentation = readXanoscriptDocsV2(docsPath, args);
  return { documentation };
}

/**
 * Get XanoScript documentation and return a ToolResult.
 */
export function xanoscriptDocsTool(args?: XanoscriptDocsArgs): ToolResult {
  try {
    const result = xanoscriptDocs(args);
    return {
      success: true,
      data: result.documentation,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error retrieving XanoScript documentation: ${errorMessage}`,
    };
  }
}

// =============================================================================
// MCP Tool Definition
// =============================================================================

export const xanoscriptDocsToolDefinition = {
  name: "xanoscript_docs",
  description:
    "Get XanoScript programming language documentation for AI code generation. " +
    "Call without parameters for overview (README). " +
    "Use 'topic' for specific documentation, or 'file_path' for context-aware docs based on the file you're editing. " +
    "Use mode='quick_reference' for compact syntax cheatsheet (recommended for context efficiency).",
  inputSchema: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "Documentation topic. Available: " + getTopicDescriptions(),
      },
      file_path: {
        type: "string",
        description:
          "File path being edited (e.g., 'apis/users/create.xs', 'functions/utils/format.xs'). " +
          "Returns all relevant docs based on file type using applyTo pattern matching.",
      },
      mode: {
        type: "string",
        enum: ["full", "quick_reference"],
        description:
          "full = complete documentation, quick_reference = compact Quick Reference sections only. " +
          "Use quick_reference for smaller context window usage.",
      },
    },
    required: [],
  },
};
