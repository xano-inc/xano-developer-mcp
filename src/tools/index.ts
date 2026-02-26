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
  type TopicDoc,
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
import { z } from "zod";

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
  type TopicDoc,

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
  cliDocsToolDefinition,
];

// =============================================================================
// Argument Schemas (Zod validation)
// =============================================================================

const validateXanoscriptSchema = z.object({
  code: z.string().optional(),
  file_path: z.string().optional(),
  file_paths: z.array(z.string()).optional(),
  directory: z.string().optional(),
  pattern: z.string().optional(),
});

const xanoscriptDocsSchema = z.object({
  topic: z.string().optional(),
  file_path: z.string().optional(),
  mode: z.enum(["full", "quick_reference", "index"]).optional(),
  exclude_topics: z.array(z.string()).optional(),
});

const metaApiDocsSchema = z.object({
  topic: z.string(),
  detail_level: z.enum(["overview", "detailed", "examples"]).optional(),
  include_schemas: z.boolean().optional(),
});

const cliDocsSchema = z.object({
  topic: z.string(),
  detail_level: z.enum(["overview", "detailed", "examples"]).optional(),
});

function parseArgs<T>(
  schema: z.ZodType<T>,
  args: Record<string, unknown>
): { ok: true; data: T } | { ok: false; error: ToolResult } {
  const result = schema.safeParse(args);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return { ok: false, error: { success: false, error: `Invalid arguments: ${issues}` } };
  }
  return { ok: true, data: result.data };
}

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
    case "validate_xanoscript": {
      const parsed = parseArgs(validateXanoscriptSchema, args);
      if (!parsed.ok) return parsed.error;
      return validateXanoscriptTool(parsed.data);
    }

    case "xanoscript_docs": {
      const parsed = parseArgs(xanoscriptDocsSchema, args);
      if (!parsed.ok) return parsed.error;
      return xanoscriptDocsTool(parsed.data);
    }

    case "mcp_version":
      return mcpVersionTool();

    case "meta_api_docs": {
      const parsed = parseArgs(metaApiDocsSchema, args);
      if (!parsed.ok) return parsed.error;
      return metaApiDocsTool(parsed.data);
    }

    case "cli_docs": {
      const parsed = parseArgs(cliDocsSchema, args);
      if (!parsed.ok) return parsed.error;
      return cliDocsTool(parsed.data);
    }

    default:
      return {
        success: false,
        error: `Unknown tool: ${name}`,
      };
  }
}
