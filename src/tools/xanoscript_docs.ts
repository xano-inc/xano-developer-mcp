/**
 * XanoScript Documentation Tool
 *
 * Retrieves XanoScript programming language documentation.
 * Can be used standalone or within the MCP server.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import {
  readXanoscriptDocsV2,
  readXanoscriptDocsStructured,
  getXanoscriptDocsVersion,
  getTopicNames,
  getTopicDescriptions,
  getTierFacts,
  type XanoscriptDocsArgs,
  type TopicDoc,
} from "../xanoscript.js";
import { defineTool } from "./define_tool.js";
import type { ToolResult } from "./types.js";

// =============================================================================
// Types
// =============================================================================

export type { XanoscriptDocsArgs };

export type { TopicDoc };

export interface XanoscriptDocsResult {
  documentation: string;
  topics?: TopicDoc[];
}

// =============================================================================
// Path Resolution
// =============================================================================

let _docsPath: string | null = null;

/**
 * Get the path to XanoScript documentation files.
 * Searches common locations for production and development.
 */
export function getXanoscriptDocsPath(): string {
  if (_docsPath) return _docsPath;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const possiblePaths = [
    join(__dirname, "..", "xanoscript_docs"), // dist/xanoscript_docs (production)
    join(__dirname, "..", "..", "src", "xanoscript_docs"), // src/xanoscript_docs (dev)
    join(__dirname, "..", "..", "xanoscript_docs"), // fallback
  ];

  const errors: Array<{ path: string; code: string; message: string }> = [];

  for (const p of possiblePaths) {
    try {
      readFileSync(join(p, "version.json"));
      _docsPath = p;
      return p;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException)?.code ?? "UNKNOWN";
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ path: p, code, message });
      // ENOENT means "not this candidate, try next." Anything else is unusual
      // (EACCES, malformed version.json) and worth surfacing.
      if (code !== "ENOENT") {
        console.error(
          `[xanoscript_docs] Unexpected error reading ${p}/version.json: ${code} — ${message}`
        );
      }
    }
  }

  console.error(
    "[xanoscript_docs] Could not locate version.json in any candidate path. " +
      "Falling back to dist/xanoscript_docs. Candidates tried:\n" +
      errors.map((e) => `  - ${e.path} (${e.code})`).join("\n")
  );
  _docsPath = join(__dirname, "..", "xanoscript_docs");
  return _docsPath;
}

/**
 * Set a custom docs path (useful for testing or custom installations)
 */
export function setXanoscriptDocsPath(path: string): void {
  _docsPath = path;
}

// =============================================================================
// Standalone Tool Function
// =============================================================================

/**
 * Get XanoScript documentation.
 *
 * @param args - Optional documentation arguments
 * @returns Documentation content
 *
 * @example
 * ```ts
 * import { xanoscriptDocs } from '@xano/developer-mcp';
 *
 * // Get compact topic index (use topic: 'readme' for the full prose overview)
 * const index = xanoscriptDocs();
 *
 * // Get specific topic
 * const syntaxDocs = xanoscriptDocs({ topic: 'syntax' });
 *
 * // Get context-aware docs for a file
 * const fileDocs = xanoscriptDocs({ file_path: 'api/users/create.xs' });
 *
 * // Get quick reference only
 * const quickRef = xanoscriptDocs({ topic: 'syntax', mode: 'quick_reference' });
 * ```
 */
export function xanoscriptDocs(args?: XanoscriptDocsArgs): XanoscriptDocsResult {
  const docsPath = getXanoscriptDocsPath();
  const documentation = readXanoscriptDocsV2(docsPath, args);

  // For file_path mode, also provide structured per-topic access
  if (args?.file_path) {
    const topics = readXanoscriptDocsStructured(docsPath, {
      ...args,
      file_path: args.file_path,
    });
    return { documentation, topics };
  }

  return { documentation };
}

/**
 * Get XanoScript documentation and return a ToolResult.
 * For file_path mode, returns each topic as a separate content block.
 */
export function xanoscriptDocsTool(args?: XanoscriptDocsArgs): ToolResult {
  try {
    const docsPath = getXanoscriptDocsPath();

    // Tier mode: return single content block for pre-built tiers
    if (args?.tier) {
      const result = xanoscriptDocs(args);
      return {
        success: true,
        data: result.documentation,
        structuredContent: { tier: args.tier, documentation: result.documentation },
      };
    }

    // file_path mode: return structured multi-content (one block per topic)
    if (args?.file_path) {
      const version = getXanoscriptDocsVersion(docsPath);
      const topicDocs = readXanoscriptDocsStructured(docsPath, {
        ...args,
        file_path: args.file_path,
      });
      const mode = args.mode || "quick_reference";
      const topics = topicDocs.map((d) => d.topic);
      const header =
        `XanoScript Documentation for: ${args.file_path}\n` +
        `Matched topics: ${topics.join(", ")}\n` +
        `Mode: ${mode}\n` +
        `Version: ${version}`;

      return {
        success: true,
        data: [header, ...topicDocs.map((d) => d.content)],
        structuredContent: {
          file_path: args.file_path,
          mode,
          version,
          topics,
        },
      };
    }

    // All other modes: return single content block
    const result = xanoscriptDocs(args);
    return {
      success: true,
      data: result.documentation,
      structuredContent: { documentation: result.documentation },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error retrieving XanoScript documentation: ${errorMessage}`,
    };
  }
}

// =============================================================================
// MCP Tool Definition
// =============================================================================

const topicEnumValues = getTopicNames() as [string, ...string[]];

// Derive tier size facts from the actual files so the advertised numbers can
// never drift stale (see getTierFacts). Computed once at module load.
const tierFacts = getTierFacts(getXanoscriptDocsPath());

export const xanoscriptDocsToolSpec = defineTool({
  name: "xano_xanoscript_docs",
  description:
    "Get XanoScript programming language documentation for AI code generation. " +
    "Call without parameters for a compact index of all topics (~4KB, ~1K tokens); then drill in with topic= or file_path=. Use topic='readme' for the full prose overview. " +
    `For context-limited models: use tier='survival' (~${tierFacts.survival.tokens}) or tier='working' (~${tierFacts.working.tokens}). ` +
    "Use 'topic' for specific documentation, or 'file_path' for context-aware docs based on the file you're editing. " +
    "Use mode='quick_reference' for compact syntax reference (recommended for context efficiency). " +
    "Use max_tokens to limit documentation size to fit your context budget. " +
    "file_path mode defaults to 'quick_reference' to reduce context size; use mode='full' to get complete docs.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputShape: {
    topic: z
      .enum(topicEnumValues)
      .optional()
      .describe(
        "Documentation topic to retrieve. Call without any parameters to get the compact topic index; use topic='readme' for the full prose overview. " +
          "Example: topic='syntax' for language syntax, topic='database' for database operations, topic='types' for type system.\n\n" +
          "Available topics:\n" +
          getTopicDescriptions()
      ),
    file_path: z
      .string()
      .optional()
      .describe(
        "File path being edited. Returns all relevant docs automatically based on the file type and location. " +
          "Uses applyTo pattern matching to select applicable topics. " +
          "Example: 'api/users/create.xs' returns API, database, and syntax docs. " +
          "'function/format.xs' returns function and syntax docs."
      ),
    mode: z
      .enum(["full", "quick_reference", "index"])
      .optional()
      .describe(
        "'full' = complete documentation with explanations and examples. " +
          "'quick_reference' = compact reference with just syntax patterns and signatures. " +
          "'index' = compact topic listing with descriptions and byte sizes (~4KB, ~1K tokens). " +
          "Use 'index' to discover available topics before loading them. " +
          "Use 'quick_reference' to save context window space when you just need a reminder. " +
          "Default: 'full' for topic mode, 'quick_reference' for file_path mode."
      ),
    tier: z
      .enum(["survival", "working"])
      .optional()
      .describe(
        "Pre-packaged documentation tier for context-limited models. " +
          `'survival' (~${tierFacts.survival.kb}, ~${tierFacts.survival.tokens}): minimum syntax to write valid XanoScript. ` +
          `'working' (~${tierFacts.working.kb}, ~${tierFacts.working.tokens}): complete reference for common tasks. ` +
          "Overrides topic/file_path/mode when set. " +
          "Use 'survival' for models with <16K context, 'working' for 16-64K context."
      ),
    max_tokens: z
      .number()
      .optional()
      .describe(
        "Maximum estimated token budget for documentation. " +
          "When used with file_path, loads topics in priority order until budget is reached. " +
          "Helps prevent context overflow for small-window models. " +
          "Estimate: 1KB of docs ≈ 250 tokens."
      ),
    exclude_topics: z
      .array(z.string())
      .optional()
      .describe(
        "List of topic names to exclude from file_path results. " +
          "Use this to skip topics you've already loaded (e.g., exclude_topics: ['syntax', 'essentials']). " +
          "Only applies when using file_path parameter."
      ),
  },
  outputShape: {
    documentation: z
      .string()
      .optional()
      .describe("The documentation content (index, topic, tier, or file_path mode)."),
    file_path: z
      .string()
      .optional()
      .describe("The file path that was matched (file_path mode only)."),
    mode: z.string().optional().describe("The documentation mode used."),
    tier: z
      .string()
      .optional()
      .describe("The pre-packaged tier used, if any."),
    version: z
      .string()
      .optional()
      .describe("The XanoScript documentation version."),
    topics: z
      .array(z.string())
      .optional()
      .describe("List of matched topic names (file_path mode only)."),
  },
});

