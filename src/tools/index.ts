/**
 * Xano Developer MCP Tools
 *
 * This module exports all tools for both MCP server usage and standalone library usage.
 *
 * @example MCP Server Usage (internal)
 * ```ts
 * import { toolDefinitions, handleTool } from './tools/index.js';
 *
 * // Register tools with MCP server
 * server.setRequestHandler(ListToolsRequestSchema, () => ({
 *   tools: toolDefinitions
 * }));
 * ```
 *
 * @example Library Usage (external)
 * ```ts
 * import {
 *   validateXanoscript,
 *   xanoscriptDocs,
 *   metaApiDocs,
 *   runApiDocs,
 *   cliDocs,
 *   mcpVersion
 * } from '@xano/developer-mcp';
 *
 * // Use tools directly
 * const result = validateXanoscript({ code: 'return 1 + 1' });
 * const docs = xanoscriptDocs({ topic: 'syntax' });
 * ```
 */

// =============================================================================
// Tool Imports
// =============================================================================

import {
  validateXanoscript,
  validateXanoscriptTool,
  validateXanoscriptToolDefinition,
  TYPE_ALIASES,
  RESERVED_VARIABLES,
  type ValidateXanoscriptArgs,
  type ValidationResult,
  type BatchValidationResult,
  type SingleFileValidationResult,
  type ParserDiagnostic,
} from "./validate_xanoscript.js";

import {
  xanoscriptDocs,
  xanoscriptDocsTool,
  xanoscriptDocsToolDefinition,
  getXanoscriptDocsPath,
  setXanoscriptDocsPath,
  type XanoscriptDocsArgs,
  type XanoscriptDocsResult,
} from "./xanoscript_docs.js";

import {
  mcpVersion,
  mcpVersionTool,
  mcpVersionToolDefinition,
  getServerVersion,
  setServerVersion,
  type McpVersionResult,
} from "./mcp_version.js";

import {
  metaApiDocs,
  metaApiDocsTool,
  metaApiDocsToolDefinition,
  metaApiTopics,
  getMetaApiTopicNames,
  getMetaApiTopicDescriptions,
  type MetaApiDocsArgs,
  type MetaApiDocsResult,
} from "./meta_api_docs.js";

import {
  runApiDocs,
  runApiDocsTool,
  runApiDocsToolDefinition,
  runApiTopics,
  getRunApiTopicNames,
  getRunApiTopicDescriptions,
  type RunApiDocsArgs,
  type RunApiDocsResult,
} from "./run_api_docs.js";

import {
  cliDocs,
  cliDocsTool,
  cliDocsToolDefinition,
  cliTopics,
  getCliTopicNames,
  getCliTopicDescriptions,
  type CliDocsArgs,
  type CliDocsResult,
} from "./cli_docs.js";

import { type ToolResult, toMcpResponse } from "./types.js";

// =============================================================================
// Standalone Tool Functions (for library usage)
// =============================================================================

export {
  // Validation
  validateXanoscript,
  TYPE_ALIASES,
  RESERVED_VARIABLES,
  type ValidateXanoscriptArgs,
  type ValidationResult,
  type BatchValidationResult,
  type SingleFileValidationResult,
  type ParserDiagnostic,

  // XanoScript Documentation
  xanoscriptDocs,
  getXanoscriptDocsPath,
  setXanoscriptDocsPath,
  type XanoscriptDocsArgs,
  type XanoscriptDocsResult,

  // MCP Version
  mcpVersion,
  getServerVersion,
  setServerVersion,
  type McpVersionResult,

  // Meta API Documentation
  metaApiDocs,
  metaApiTopics,
  getMetaApiTopicNames,
  getMetaApiTopicDescriptions,
  type MetaApiDocsArgs,
  type MetaApiDocsResult,

  // Run API Documentation
  runApiDocs,
  runApiTopics,
  getRunApiTopicNames,
  getRunApiTopicDescriptions,
  type RunApiDocsArgs,
  type RunApiDocsResult,

  // CLI Documentation
  cliDocs,
  cliTopics,
  getCliTopicNames,
  getCliTopicDescriptions,
  type CliDocsArgs,
  type CliDocsResult,

  // Utility types
  type ToolResult,
  toMcpResponse,
};

// =============================================================================
// Tool Result Functions (for internal MCP usage)
// =============================================================================

export {
  validateXanoscriptTool,
  xanoscriptDocsTool,
  mcpVersionTool,
  metaApiDocsTool,
  runApiDocsTool,
  cliDocsTool,
};

// =============================================================================
// MCP Tool Definitions
// =============================================================================

export {
  validateXanoscriptToolDefinition,
  xanoscriptDocsToolDefinition,
  mcpVersionToolDefinition,
  metaApiDocsToolDefinition,
  runApiDocsToolDefinition,
  cliDocsToolDefinition,
};

/**
 * All tool definitions for MCP server registration
 */
export const toolDefinitions = [
  validateXanoscriptToolDefinition,
  xanoscriptDocsToolDefinition,
  mcpVersionToolDefinition,
  metaApiDocsToolDefinition,
  runApiDocsToolDefinition,
  cliDocsToolDefinition,
];

// =============================================================================
// Tool Handler (for MCP server)
// =============================================================================

/**
 * Handle a tool call by name and return the result.
 * This is used by the MCP server to dispatch tool calls.
 */
export function handleTool(
  name: string,
  args: Record<string, unknown>
): ToolResult {
  switch (name) {
    case "validate_xanoscript":
      return validateXanoscriptTool(args as unknown as ValidateXanoscriptArgs);

    case "xanoscript_docs":
      return xanoscriptDocsTool(args as unknown as XanoscriptDocsArgs);

    case "mcp_version":
      return mcpVersionTool();

    case "meta_api_docs":
      return metaApiDocsTool(args as unknown as MetaApiDocsArgs);

    case "run_api_docs":
      return runApiDocsTool(args as unknown as RunApiDocsArgs);

    case "cli_docs":
      return cliDocsTool(args as unknown as CliDocsArgs);

    default:
      return {
        success: false,
        error: `Unknown tool: ${name}`,
      };
  }
}
