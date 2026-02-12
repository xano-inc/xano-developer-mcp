/**
 * Run API Documentation Tool
 *
 * Retrieves documentation for Xano's Run API.
 * Re-exports from the run_api_docs module with ToolResult support.
 */

import {
  handleRunApiDocs as _handleRunApiDocs,
  runApiDocsToolDefinition,
  topics,
  getTopicNames,
  getTopicDescriptions,
} from "../run_api_docs/index.js";
import type { TopicDoc, DetailLevel } from "../meta_api_docs/types.js";
import type { ToolResult } from "./types.js";

// =============================================================================
// Re-exports
// =============================================================================

export {
  runApiDocsToolDefinition,
  topics as runApiTopics,
  getTopicNames as getRunApiTopicNames,
  getTopicDescriptions as getRunApiTopicDescriptions,
};
export type { TopicDoc, DetailLevel };

// =============================================================================
// Types
// =============================================================================

export interface RunApiDocsArgs {
  topic: string;
  detail_level?: DetailLevel;
  include_schemas?: boolean;
}

export interface RunApiDocsResult {
  documentation: string;
}

// =============================================================================
// Standalone Tool Function
// =============================================================================

/**
 * Get Xano Run API documentation.
 *
 * @param args - Documentation arguments
 * @returns Documentation content
 *
 * @example
 * ```ts
 * import { runApiDocs } from '@xano/developer-mcp';
 *
 * // Get overview
 * const overview = runApiDocs({ topic: 'start' });
 *
 * // Get session documentation with examples
 * const sessionDocs = runApiDocs({
 *   topic: 'session',
 *   detail_level: 'examples',
 *   include_schemas: true
 * });
 * ```
 */
export function runApiDocs(args: RunApiDocsArgs): RunApiDocsResult {
  if (!args?.topic) {
    throw new Error("'topic' parameter is required. Use topic='start' for overview.");
  }
  const documentation = _handleRunApiDocs(
    args.topic,
    args.detail_level,
    args.include_schemas
  );
  return { documentation };
}

/**
 * Get Run API documentation and return a ToolResult.
 */
export function runApiDocsTool(args: RunApiDocsArgs): ToolResult {
  if (!args?.topic) {
    return {
      success: false,
      error: "Error: 'topic' parameter is required. Use run_api_docs with topic='start' for overview.",
    };
  }

  try {
    const result = runApiDocs(args);
    return {
      success: true,
      data: result.documentation,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error retrieving Run API documentation: ${errorMessage}`,
    };
  }
}

// Re-export tool definition for MCP
export { runApiDocsToolDefinition as toolDefinition };
