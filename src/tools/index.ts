/**
 * Xano Developer MCP Tools
 *
 * Exports all tools for both MCP server usage and standalone library usage.
 * Tool registration goes through `toolSpecs` and `handleTool` below — the
 * `toolSpecs` map is the single source of truth for which tools exist and
 * the dispatch table in `handleTool` is statically required to cover every
 * key, so a new tool cannot be registered without being routed.
 */

import {
  validateXanoscript,
  validateXanoscriptTool,
  validateXanoscriptToolSpec,
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
  xanoscriptDocsToolSpec,
  getXanoscriptDocsPath,
  setXanoscriptDocsPath,
  type XanoscriptDocsArgs,
  type XanoscriptDocsResult,
  type TopicDoc,
} from "./xanoscript_docs.js";

import {
  mcpVersion,
  mcpVersionTool,
  mcpVersionToolSpec,
  getServerVersion,
  setServerVersion,
  type McpVersionResult,
} from "./mcp_version.js";

import {
  metaApiDocs,
  metaApiDocsTool,
  metaApiDocsToolSpec,
  metaApiTopics,
  getMetaApiTopicNames,
  getMetaApiTopicDescriptions,
  type MetaApiDocsArgs,
  type MetaApiDocsResult,
} from "./meta_api_docs.js";

import {
  cliDocs,
  cliDocsTool,
  cliDocsToolSpec,
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
// Tool Registry — single source of truth
// =============================================================================

/**
 * Full tool specs (Zod shapes + derived JSON Schema). Use these to register
 * tools with `McpServer.registerTool` — descriptions live in the shapes and
 * the JSON Schema can never drift from the parser.
 */
export const toolSpecs = {
  xano_validate_xanoscript: validateXanoscriptToolSpec,
  xano_xanoscript_docs: xanoscriptDocsToolSpec,
  xano_version: mcpVersionToolSpec,
  xano_meta_api_docs: metaApiDocsToolSpec,
  xano_cli_docs: cliDocsToolSpec,
} as const;

export type ToolName = keyof typeof toolSpecs;

/**
 * Tool definitions array (derived from toolSpecs). Kept for callers that
 * want a flat list to advertise.
 */
export const toolDefinitions = Object.values(toolSpecs).map(
  (spec) => spec.definition
);

// =============================================================================
// Tool Handler (typed dispatch — adding to toolSpecs without adding here is
// a compile error)
// =============================================================================

function parseWithSpec<I extends ZodRawShape, O extends ZodRawShape>(
  spec: BuiltTool<I, O>,
  args: Record<string, unknown>
): { ok: true; data: z.infer<z.ZodObject<I>> } | { ok: false; error: ToolResult } {
  const result = spec.inputParser.safeParse(args);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => {
        const path = i.path.join(".") || "(root)";
        return `${path} [${i.code}]: ${i.message}`;
      })
      .join("; ");
    return {
      ok: false,
      error: { success: false, error: `Invalid arguments: ${issues}` },
    };
  }
  return { ok: true, data: result.data as z.infer<z.ZodObject<I>> };
}

/**
 * Dispatch table — every key in `toolSpecs` must have a handler here, or
 * TypeScript will fail to compile. Adding a tool means: add to `toolSpecs`,
 * then add a handler entry below.
 */
const dispatch: { [K in ToolName]: (args: Record<string, unknown>) => Promise<ToolResult> } = {
  async xano_validate_xanoscript(args) {
    const parsed = parseWithSpec(validateXanoscriptToolSpec, args);
    if (!parsed.ok) return parsed.error;
    return validateXanoscriptTool(parsed.data as ValidateXanoscriptArgs);
  },
  async xano_xanoscript_docs(args) {
    const parsed = parseWithSpec(xanoscriptDocsToolSpec, args);
    if (!parsed.ok) return parsed.error;
    return xanoscriptDocsTool(parsed.data as XanoscriptDocsArgs);
  },
  async xano_version() {
    return mcpVersionTool();
  },
  async xano_meta_api_docs(args) {
    const parsed = parseWithSpec(metaApiDocsToolSpec, args);
    if (!parsed.ok) return parsed.error;
    return metaApiDocsTool(parsed.data as MetaApiDocsArgs);
  },
  async xano_cli_docs(args) {
    const parsed = parseWithSpec(cliDocsToolSpec, args);
    if (!parsed.ok) return parsed.error;
    return cliDocsTool(parsed.data as CliDocsArgs);
  },
};

function isToolName(name: string): name is ToolName {
  return name in dispatch;
}

/**
 * Handle a tool call by name and return the result.
 * Async to allow future tools that perform I/O without breaking the signature.
 */
export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  if (!isToolName(name)) {
    return { success: false, error: `Unknown tool: ${name}` };
  }
  return dispatch[name](args);
}
