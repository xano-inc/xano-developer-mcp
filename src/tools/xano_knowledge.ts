/**
 * Xano Workspace Knowledge Tools
 *
 * This MCP server has no shell access, so these tools don't run the CLI
 * themselves — they return the exact `xano knowledge list` / `xano knowledge
 * get` command to run, along with a short pointer on what it does.
 */

import { z } from "zod";
import { defineTool } from "./define_tool.js";
import type { ToolResult } from "./types.js";

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
  command: string;
}

export interface XanoKnowledgeGetResult {
  command: string;
}

// =============================================================================
// Command building
// =============================================================================

/** Quote an argv entry for display in a copy-pasteable shell command. */
function shellQuote(value: string): string {
  return /[^\w./-]/.test(value) ? `"${value.replace(/(["\\$`])/g, "\\$1")}"` : value;
}

function formatCommand(args: string[]): string {
  return args.map(shellQuote).join(" ");
}

export function xanoKnowledgeList(args: XanoKnowledgeListArgs): XanoKnowledgeListResult {
  const cliArgs = ["xano", "knowledge", "list"];
  if (args.workspace) cliArgs.push("-w", args.workspace);
  if (args.branch) cliArgs.push("-b", args.branch);
  if (args.type) cliArgs.push("-t", args.type);
  if (args.enabled_only === false) cliArgs.push("--no-enabled-only");
  cliArgs.push("-o", args.output ?? "markdown");
  if (args.profile) cliArgs.push("-p", args.profile);

  return { command: formatCommand(cliArgs) };
}

export function xanoKnowledgeGet(args: XanoKnowledgeGetArgs): XanoKnowledgeGetResult {
  const cliArgs = ["xano", "knowledge", "get", args.name];
  if (args.workspace) cliArgs.push("-w", args.workspace);
  if (args.branch) cliArgs.push("-b", args.branch);
  if (args.file) cliArgs.push("-f", args.file);
  cliArgs.push("-o", args.output ?? "text");
  if (args.profile) cliArgs.push("-p", args.profile);

  return { command: formatCommand(cliArgs) };
}

// =============================================================================
// Tool Result Functions (for internal MCP usage)
// =============================================================================

export function xanoKnowledgeListTool(args: XanoKnowledgeListArgs): ToolResult {
  const { command } = xanoKnowledgeList(args);
  return {
    success: true,
    data: `Run this command to list the workspace's knowledge base (skills, docs, agents.md):\n\n${command}`,
    structuredContent: { command },
  };
}

export function xanoKnowledgeGetTool(args: XanoKnowledgeGetArgs): ToolResult {
  if (!args?.name) {
    return {
      success: false,
      error: "Error: 'name' parameter is required.",
    };
  }

  const { command } = xanoKnowledgeGet(args);
  return {
    success: true,
    data: `Run this command to fetch the knowledge item's content:\n\n${command}`,
    structuredContent: { command },
  };
}

// =============================================================================
// Tool Definitions (Zod shapes -> JSON Schema)
// =============================================================================

export const xanoKnowledgeListToolSpec = defineTool({
  name: "xano_knowledge_list",
  description: `Get the CLI command to list a Xano workspace's knowledge base: skills, docs, and the agents.md file. This tool does not run the command itself — it returns the exact \`xano knowledge list\` command to run in a shell, so you can invoke it and read its output.

Use this to get an overview of what knowledge/skills exist before answering questions about workspace conventions, or before deciding whether a new skill/doc needs to be created (to avoid duplicating existing ones).

Always-on items (mode=always) are returned by the command with full content; on-demand items are returned with just name+description — use xano_knowledge_get to get the command for fetching an on-demand item's full content when it becomes relevant.`,
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
    command: z.string().describe("The `xano knowledge list` command to run to get the workspace's knowledge base."),
  },
});

export const xanoKnowledgeGetToolSpec = defineTool({
  name: "xano_knowledge_get",
  description: `Get the CLI command to fetch the full content of one named knowledge item (a skill, doc, or agents.md), or one of a skill's attached reference files. This tool does not run the command itself — it returns the exact \`xano knowledge get\` command to run in a shell, so you can invoke it and read its output.

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
    command: z.string().describe("The `xano knowledge get` command to run to fetch the knowledge item's content."),
  },
});
