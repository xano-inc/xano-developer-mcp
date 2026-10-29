/**
 * CLI Documentation Tool
 *
 * Retrieves documentation for the Xano CLI.
 * Re-exports from the cli_docs module with ToolResult support.
 */

import {
  handleCliDocs as _handleCliDocs,
  cliDocsToolSpec,
  cliDocsToolSpecFor,
  topics,
  getTopicNames,
  getTopicDescriptions,
} from "../cli_docs/index.js";
import type { CliDocsArgs, DetailLevel, TopicDoc } from "../cli_docs/types.js";
import type { ToolResult } from "./types.js";
import type { DeveloperToolsOptions } from "../policies.js";

// =============================================================================
// Re-exports
// =============================================================================

export {
  cliDocsToolSpec,
  cliDocsToolSpecFor,
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
 * @param options - The host's options (`policies: true` includes the policies feature)
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
export function cliDocs(args: CliDocsArgs, options?: DeveloperToolsOptions): CliDocsResult {
  if (!args?.topic) {
    throw new Error("'topic' parameter is required. Use topic='start' for overview.");
  }
  const documentation = _handleCliDocs(args, options);
  return { documentation };
}

/**
 * Get CLI documentation and return a ToolResult.
 */
export function cliDocsTool(args: CliDocsArgs, options?: DeveloperToolsOptions): ToolResult {
  if (!args?.topic) {
    return {
      success: false,
      error: "Error: 'topic' parameter is required. Use xano_cli_docs with topic='start' for overview.",
    };
  }

  try {
    const result = cliDocs(args, options);
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

