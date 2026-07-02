/**
 * Xano Workspace Knowledge Tools
 *
 * Wraps the `xano knowledge list` and `xano knowledge get` CLI subcommands,
 * which read a Xano workspace's knowledge base (skills, docs, agents.md).
 */

import { z } from "zod";
import { defineTool } from "./define_tool.js";
import type { ToolResult } from "./types.js";
import { runXanoCli } from "../lib/run_xano_cli.js";

// =============================================================================
// Types
// =============================================================================

export interface XanoKnowledgeListArgs {
  workspace?: string;
  branch?: string;
  type?: "skill" | "doc" | "agents.md";
  enabled_only?: boolean;
  output?: "markdown" | "json";
  profile?: string;
}

export interface XanoKnowledgeGetArgs {
  name: string;
  workspace?: string;
  branch?: string;
  file?: string;
  output?: "text" | "json";
  profile?: string;
}

export interface XanoKnowledgeListResult {
  result: string;
}

export interface XanoKnowledgeGetResult {
  result: string;
}

// =============================================================================
// Standalone Tool Functions (for library usage)
// =============================================================================

export async function xanoKnowledgeList(
  args: XanoKnowledgeListArgs
): Promise<XanoKnowledgeListResult> {
  const cliArgs = ["knowledge", "list"];
  if (args.workspace) cliArgs.push("-w", args.workspace);
  if (args.branch) cliArgs.push("-b", args.branch);
  if (args.type) cliArgs.push("-t", args.type);
  if (args.enabled_only === false) cliArgs.push("--no-enabled-only");
  cliArgs.push("-o", args.output ?? "markdown");
  if (args.profile) cliArgs.push("-p", args.profile);

  const result = await runXanoCli(cliArgs);
  return { result };
}

export async function xanoKnowledgeGet(
  args: XanoKnowledgeGetArgs
): Promise<XanoKnowledgeGetResult> {
  const cliArgs = ["knowledge", "get", args.name];
  if (args.workspace) cliArgs.push("-w", args.workspace);
  if (args.branch) cliArgs.push("-b", args.branch);
  if (args.file) cliArgs.push("-f", args.file);
  cliArgs.push("-o", args.output ?? "text");
  if (args.profile) cliArgs.push("-p", args.profile);

  const result = await runXanoCli(cliArgs);
  return { result };
}

// =============================================================================
// Tool Result Functions (for internal MCP usage)
// =============================================================================

function parseJsonStructuredContent(text: string): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(text);
    return { parsed };
  } catch {
    return undefined;
  }
}

export async function xanoKnowledgeListTool(args: XanoKnowledgeListArgs): Promise<ToolResult> {
  try {
    const { result } = await xanoKnowledgeList(args);
    const structuredContent =
      args.output === "json" ? parseJsonStructuredContent(result) : undefined;
    return { success: true, data: result, structuredContent };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Error listing workspace knowledge: ${errorMessage}` };
  }
}

export async function xanoKnowledgeGetTool(args: XanoKnowledgeGetArgs): Promise<ToolResult> {
  if (!args?.name) {
    return {
      success: false,
      error: "Error: 'name' parameter is required.",
    };
  }

  try {
    const { result } = await xanoKnowledgeGet(args);
    const structuredContent =
      args.output === "json" ? parseJsonStructuredContent(result) : undefined;
    return { success: true, data: result, structuredContent };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Error getting knowledge item: ${errorMessage}` };
  }
}

// =============================================================================
// Tool Definitions (Zod shapes -> JSON Schema)
// =============================================================================

export const xanoKnowledgeListToolSpec = defineTool({
  name: "xano_knowledge_list",
  description: `List a Xano workspace's knowledge base: skills, docs, and the agents.md file.

Use this to get an overview of what knowledge/skills exist before answering questions about workspace conventions, or before deciding whether a new skill/doc needs to be created (to avoid duplicating existing ones).

Always-on items (mode=always) are returned with full content; on-demand items are returned with just name+description — use xano_knowledge_get to fetch an on-demand item's full content when it becomes relevant.`,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputShape: {
    workspace: z
      .string()
      .optional()
      .describe("Workspace ID. Optional if the active profile has a default workspace configured."),
    branch: z
      .string()
      .optional()
      .describe("Branch ID to read knowledge from. Optional; defaults to the workspace's live branch."),
    type: z
      .enum(["skill", "doc", "agents.md"])
      .optional()
      .describe("Filter to a single knowledge type. Omit to list all types."),
    enabled_only: z
      .boolean()
      .optional()
      .describe(
        "When true (default), only enabled items are returned. Set to false to include disabled items too."
      ),
    output: z
      .enum(["markdown", "json"])
      .optional()
      .describe(
        "markdown is human-readable (always-on items inline, on-demand items as a name+description index). " +
          "json returns the full raw item array — prefer json when you need structured fields " +
          "(id, guid, mode, references, etc.) for further processing. Default: markdown."
      ),
    profile: z
      .string()
      .optional()
      .describe("CLI credential profile to use. Optional; falls back to XANO_PROFILE env var or the credentials file default."),
  },
  outputShape: {
    result: z.string().describe("The knowledge list output (markdown or JSON text, per the requested output format)."),
  },
});

export const xanoKnowledgeGetToolSpec = defineTool({
  name: "xano_knowledge_get",
  description: `Fetch the full content of one named knowledge item (a skill, doc, or agents.md), or one of a skill's attached reference files.

Use this after xano_knowledge_list has identified an on-demand item whose full content is now needed, or when a skill's step tells you to consult a specific reference file (via @filename syntax in the skill content).`,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputShape: {
    name: z
      .string()
      .describe("The knowledge item's name (case-insensitive exact match). Required."),
    workspace: z
      .string()
      .optional()
      .describe("Workspace ID. Optional if the active profile has a default workspace configured."),
    branch: z
      .string()
      .optional()
      .describe("Branch ID. Optional; defaults to the workspace's live branch."),
    file: z
      .string()
      .optional()
      .describe(
        "Path of a reference file attached to the item (as listed in that item's `references` array from " +
          "xano_knowledge_list), fetched instead of the item's own content."
      ),
    output: z
      .enum(["text", "json"])
      .optional()
      .describe(
        "text returns the raw markdown content. json wraps it with metadata (item: full object; " +
          "file: {content, name, path}). Default: text."
      ),
    profile: z
      .string()
      .optional()
      .describe("CLI credential profile to use."),
  },
  outputShape: {
    result: z.string().describe("The knowledge item's content (text or JSON text, per the requested output format)."),
  },
});
