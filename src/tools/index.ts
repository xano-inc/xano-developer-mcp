/**
 * Xano Developer MCP Tools
 *
 * Exports all tools for both MCP server usage and standalone library usage.
 * Tool registration goes through `toolSpecs` and `handleTool` below — the
 * `toolSpecs` map is the single source of truth for which tools exist and
 * the dispatch table in `handleTool` is statically required to cover every
 * key, so a new tool cannot be registered without being routed. A host that
 * serves the unreleased policies feature takes both from
 * `developerTools({ policies: true })` instead (see src/policies.ts).
 */

import {
  validateXanoscript,
  validateXanoscriptTool,
  validateXanoscriptToolSpecFor,
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
  xanoscriptDocsToolSpecFor,
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
  metaApiDocsToolSpecFor,
  metaApiTopics,
  getMetaApiTopicNames,
  getMetaApiTopicDescriptions,
  type MetaApiDocsArgs,
  type MetaApiDocsResult,
} from "./meta_api_docs.js";

import {
  cliDocs,
  cliDocsTool,
  cliDocsToolSpecFor,
  cliTopics,
  getCliTopicNames,
  getCliTopicDescriptions,
  type CliDocsArgs,
  type CliDocsResult,
} from "./cli_docs.js";

import {
  xanoKnowledgeList,
  xanoKnowledgeListTool,
  xanoKnowledgeListToolSpec,
  xanoKnowledgeGet,
  xanoKnowledgeGetTool,
  xanoKnowledgeGetToolSpec,
  type XanoKnowledgeListArgs,
  type XanoKnowledgeListResult,
  type XanoKnowledgeGetArgs,
  type XanoKnowledgeGetResult,
} from "./xano_knowledge.js";

import { type ToolResult, toMcpResponse } from "./types.js";
import { perPolicies, type DeveloperToolsOptions } from "../policies.js";
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

  // Workspace Knowledge
  xanoKnowledgeList,
  xanoKnowledgeGet,
  type XanoKnowledgeListArgs,
  type XanoKnowledgeListResult,
  type XanoKnowledgeGetArgs,
  type XanoKnowledgeGetResult,

  // Utility types
  type ToolResult,
  toMcpResponse,
  type DeveloperToolsOptions,
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
  xanoKnowledgeListTool,
  xanoKnowledgeGetTool,
};

// =============================================================================
// Tool Registry — single source of truth
// =============================================================================

/**
 * Full tool specs (Zod shapes + derived JSON Schema) under the host's options.
 * Use these to register tools with `McpServer.registerTool` — descriptions
 * live in the shapes and the JSON Schema can never drift from the parser.
 */
function buildToolSpecs(options: DeveloperToolsOptions) {
  return {
    xano_validate_xanoscript: validateXanoscriptToolSpecFor(options),
    xano_xanoscript_docs: xanoscriptDocsToolSpecFor(options),
    xano_version: mcpVersionToolSpec,
    xano_meta_api_docs: metaApiDocsToolSpecFor(options),
    xano_cli_docs: cliDocsToolSpecFor(options),
    xano_knowledge_list: xanoKnowledgeListToolSpec,
    xano_knowledge_get: xanoKnowledgeGetToolSpec,
  } as const;
}

type ToolSpecs = ReturnType<typeof buildToolSpecs>;

export type ToolName = keyof ToolSpecs;

// =============================================================================
// Tool Handler (typed dispatch — adding to the specs without adding here is
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
 * Dispatch table — every key in the specs must have a handler here, or
 * TypeScript will fail to compile. Adding a tool means: add to
 * `buildToolSpecs`, then add a handler entry below.
 */
function buildDispatch(
  specs: ToolSpecs,
  options: DeveloperToolsOptions
): { [K in ToolName]: (args: Record<string, unknown>) => Promise<ToolResult> } {
  return {
    async xano_validate_xanoscript(args) {
      const parsed = parseWithSpec(specs.xano_validate_xanoscript, args);
      if (!parsed.ok) return parsed.error;
      return validateXanoscriptTool(parsed.data as ValidateXanoscriptArgs);
    },
    async xano_xanoscript_docs(args) {
      const parsed = parseWithSpec(specs.xano_xanoscript_docs, args);
      if (!parsed.ok) return parsed.error;
      return xanoscriptDocsTool(parsed.data as XanoscriptDocsArgs, options);
    },
    async xano_version() {
      return mcpVersionTool();
    },
    async xano_meta_api_docs(args) {
      const parsed = parseWithSpec(specs.xano_meta_api_docs, args);
      if (!parsed.ok) return parsed.error;
      return metaApiDocsTool(parsed.data as MetaApiDocsArgs, options);
    },
    async xano_cli_docs(args) {
      const parsed = parseWithSpec(specs.xano_cli_docs, args);
      if (!parsed.ok) return parsed.error;
      return cliDocsTool(parsed.data as CliDocsArgs, options);
    },
    async xano_knowledge_list(args) {
      const parsed = parseWithSpec(specs.xano_knowledge_list, args);
      if (!parsed.ok) return parsed.error;
      return xanoKnowledgeListTool(parsed.data as XanoKnowledgeListArgs);
    },
    async xano_knowledge_get(args) {
      const parsed = parseWithSpec(specs.xano_knowledge_get, args);
      if (!parsed.ok) return parsed.error;
      return xanoKnowledgeGetTool(parsed.data as XanoKnowledgeGetArgs);
    },
  };
}

export interface DeveloperTools {
  /** The tool specs, keyed by tool name. */
  readonly toolSpecs: ToolSpecs;
  /** The specs' definitions as a flat list, for callers that advertise one. */
  readonly toolDefinitions: ToolSpecs[ToolName]["definition"][];
  /**
   * Handle a tool call by name and return the result.
   * Async to allow future tools that perform I/O without breaking the signature.
   */
  handleTool(name: string, args: Record<string, unknown>): Promise<ToolResult>;
}

/**
 * The tools as a host serves them. `{ policies: true }` includes the
 * unreleased policies feature (its topics, docs and wording); anything else,
 * including no options, leaves it out.
 */
export const developerTools = perPolicies((options): DeveloperTools => {
  const toolSpecs = buildToolSpecs(options);
  const dispatch = buildDispatch(toolSpecs, options);
  const isToolName = (name: string): name is ToolName => name in dispatch;
  return {
    toolSpecs,
    toolDefinitions: Object.values(toolSpecs).map((spec) => spec.definition),
    async handleTool(name, args) {
      if (!isToolName(name)) {
        return { success: false, error: `Unknown tool: ${name}` };
      }
      return dispatch[name](args);
    },
  };
});

const defaults = developerTools();

/** The tool specs without the policies feature (see {@link developerTools}). */
export const toolSpecs = defaults.toolSpecs;

/**
 * Tool definitions array (derived from toolSpecs). Kept for callers that
 * want a flat list to advertise.
 */
export const toolDefinitions = defaults.toolDefinitions;

/** Handle a tool call without the policies feature (see {@link developerTools}). */
export const handleTool = defaults.handleTool;
