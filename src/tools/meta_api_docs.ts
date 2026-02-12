/**
 * Meta API Documentation Tool
 *
 * Retrieves documentation for Xano's Meta API.
 * Re-exports from the meta_api_docs module with ToolResult support.
 */

import {
  handleMetaApiDocs as _handleMetaApiDocs,
  metaApiDocsToolDefinition,
  topics,
  getTopicNames,
  getTopicDescriptions,
} from "../meta_api_docs/index.js";
import type { MetaApiDocsArgs, DetailLevel, TopicDoc } from "../meta_api_docs/types.js";
import type { ToolResult } from "./types.js";

// =============================================================================
// Re-exports
// =============================================================================

export {
  metaApiDocsToolDefinition,
  topics as metaApiTopics,
  getTopicNames as getMetaApiTopicNames,
  getTopicDescriptions as getMetaApiTopicDescriptions,
};
export type { MetaApiDocsArgs, DetailLevel, TopicDoc };

// =============================================================================
// Types
// =============================================================================

export interface MetaApiDocsResult {
  documentation: string;
}

// =============================================================================
// Standalone Tool Function
// =============================================================================

/**
 * Get Xano Meta API documentation.
 *
 * @param args - Documentation arguments
 * @returns Documentation content
 *
 * @example
 * ```ts
 * import { metaApiDocs } from '@xano/developer-mcp';
 *
 * // Get overview
 * const overview = metaApiDocs({ topic: 'start' });
 *
 * // Get workspace documentation with examples
 * const workspaceDocs = metaApiDocs({
 *   topic: 'workspace',
 *   detail_level: 'examples',
 *   include_schemas: true
 * });
 * ```
 */
export function metaApiDocs(args: MetaApiDocsArgs): MetaApiDocsResult {
  if (!args?.topic) {
    throw new Error("'topic' parameter is required. Use topic='start' for overview.");
  }
  const documentation = _handleMetaApiDocs(args);
  return { documentation };
}

/**
 * Get Meta API documentation and return a ToolResult.
 */
export function metaApiDocsTool(args: MetaApiDocsArgs): ToolResult {
  if (!args?.topic) {
    return {
      success: false,
      error: "Error: 'topic' parameter is required. Use meta_api_docs with topic='start' for overview.",
    };
  }

  try {
    const result = metaApiDocs(args);
    return {
      success: true,
      data: result.documentation,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error retrieving API documentation: ${errorMessage}`,
    };
  }
}

// Re-export tool definition for MCP
export { metaApiDocsToolDefinition as toolDefinition };
