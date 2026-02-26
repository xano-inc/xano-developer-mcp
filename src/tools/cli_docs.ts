/**
 * CLI Documentation Tool
 *
 * Retrieves documentation for the Xano CLI.
 * Re-exports from the cli_docs module with ToolResult support.
 */

import {
  handleCliDocs as _handleCliDocs,
  cliDocsToolDefinition,
  topics,
  getTopicNames,
  getTopicDescriptions,
} from "../cli_docs/index.js";
import type { CliDocsArgs, DetailLevel, TopicDoc } from "../cli_docs/types.js";
import type { ToolResult } from "./types.js";

// =============================================================================
// Re-exports
// =============================================================================

export {
  cliDocsToolDefinition,
  topics as cliTopics,
  getTopicNames as getCliTopicNames,
  getTopicDescriptions as getCliTopicDescriptions,
};
export type { CliDocsArgs, DetailLevel, TopicDoc };

// =============================================================================
// Types
// =============================================================================

export interface CliDocsResult {
  documentation: string;
}

// =============================================================================
// Standalone Tool Function
// =============================================================================

/**
 * Get Xano CLI documentation.
 *
 * @param args - Documentation arguments
 * @returns Documentation content
 *
 * @example
 * ```ts
 * import { cliDocs } from '@xano/developer-mcp';
 *
 * // Get overview
 * const overview = cliDocs({ topic: 'start' });
 *
 * // Get function documentation with examples
 * const functionDocs = cliDocs({
 *   topic: 'function',
 *   detail_level: 'examples'
 * });
 * ```
 */
export function cliDocs(args: CliDocsArgs): CliDocsResult {
  if (!args?.topic) {
    throw new Error("'topic' parameter is required. Use topic='start' for overview.");
  }
  const documentation = _handleCliDocs(args);
  return { documentation };
}

/**
 * Get CLI documentation and return a ToolResult.
 */
export function cliDocsTool(args: CliDocsArgs): ToolResult {
  if (!args?.topic) {
    return {
      success: false,
      error: "Error: 'topic' parameter is required. Use cli_docs with topic='start' for overview.",
    };
  }

  try {
    const result = cliDocs(args);
    return {
      success: true,
      data: result.documentation,
      structuredContent: { documentation: result.documentation },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error retrieving CLI documentation: ${errorMessage}`,
    };
  }
}

// Re-export tool definition for MCP
export { cliDocsToolDefinition as toolDefinition };
