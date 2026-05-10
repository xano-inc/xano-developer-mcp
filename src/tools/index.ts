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
  validateXanoscriptTool_spec,
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
  xanoscriptDocsTool_spec,
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
  mcpVersionTool_spec,
  getServerVersion,
  setServerVersion,
  type McpVersionResult,
} from "./mcp_version.js";

import {
  metaApiDocs,
  metaApiDocsTool,
  metaApiDocsToolDefinition,
  metaApiDocsTool_spec,
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
  cliDocsTool_spec,
  cliTopics,
  getCliTopicNames,
  getCliTopicDescriptions,
  type CliDocsArgs,
  type CliDocsResult,
} from "./cli_docs.js";

import { type ToolResult, toMcpResponse } from "./types.js";
import { z } from "zod";
import type { BuiltTool, ZodRawShape } from "./define_tool.js";

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

/**
 * Full tool specs (Zod shapes + derived JSON Schema). Use these to register
 * tools with `McpServer.registerTool` — descriptions live in the shapes and
 * the JSON Schema can never drift from the parser.
 */
export const toolSpecs = {
  validate_xanoscript: validateXanoscriptTool_spec,
  xanoscript_docs: xanoscriptDocsTool_spec,
  mcp_version: mcpVersionTool_spec,
  meta_api_docs: metaApiDocsTool_spec,
  cli_docs: cliDocsTool_spec,
} as const;

// =============================================================================
// Tool Handler (for MCP server / library)
// =============================================================================

function parseWithSpec<I extends ZodRawShape, O extends ZodRawShape>(
  spec: BuiltTool<I, O>,
  args: Record<string, unknown>
): { ok: true; data: z.infer<z.ZodObject<I>> } | { ok: false; error: ToolResult } {
  const result = spec.inputParser.safeParse(args);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return {
      ok: false,
      error: { success: false, error: `Invalid arguments: ${issues}` },
    };
  }
  return { ok: true, data: result.data as z.infer<z.ZodObject<I>> };
}

/**
 * Handle a tool call by name and return the result.
 * Async to allow future tools that perform I/O without breaking the signature.
 */
export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  switch (name) {
    case "validate_xanoscript": {
      const parsed = parseWithSpec(validateXanoscriptTool_spec, args);
      if (!parsed.ok) return parsed.error;
      return validateXanoscriptTool(parsed.data as ValidateXanoscriptArgs);
    }

    case "xanoscript_docs": {
      const parsed = parseWithSpec(xanoscriptDocsTool_spec, args);
      if (!parsed.ok) return parsed.error;
      return xanoscriptDocsTool(parsed.data as XanoscriptDocsArgs);
    }

    case "mcp_version":
      return mcpVersionTool();

    case "meta_api_docs": {
      const parsed = parseWithSpec(metaApiDocsTool_spec, args);
      if (!parsed.ok) return parsed.error;
      return metaApiDocsTool(parsed.data as MetaApiDocsArgs);
    }

    case "cli_docs": {
      const parsed = parseWithSpec(cliDocsTool_spec, args);
      if (!parsed.ok) return parsed.error;
      return cliDocsTool(parsed.data as CliDocsArgs);
    }

    default:
      return {
        success: false,
        error: `Unknown tool: ${name}`,
      };
  }
}
