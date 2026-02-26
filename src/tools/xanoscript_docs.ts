/**
 * XanoScript Documentation Tool
 *
 * Retrieves XanoScript programming language documentation.
 * Can be used standalone or within the MCP server.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  readXanoscriptDocsV2,
  readXanoscriptDocsStructured,
  getXanoscriptDocsVersion,
  getTopicNames,
  getTopicDescriptions,
  type XanoscriptDocsArgs,
  type TopicDoc,
} from "../xanoscript.js";
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

  for (const p of possiblePaths) {
    try {
      readFileSync(join(p, "version.json"));
      _docsPath = p;
      return p;
    } catch {
      continue;
    }
  }

  // Default fallback
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
 * // Get overview
 * const overview = xanoscriptDocs();
 *
 * // Get specific topic
 * const syntaxDocs = xanoscriptDocs({ topic: 'syntax' });
 *
 * // Get context-aware docs for a file
 * const fileDocs = xanoscriptDocs({ file_path: 'apis/users/create.xs' });
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

export const xanoscriptDocsToolDefinition = {
  name: "xanoscript_docs",
  description:
    "Get XanoScript programming language documentation for AI code generation. " +
    "Call without parameters for overview (README). " +
    "Use 'topic' for specific documentation, or 'file_path' for context-aware docs based on the file you're editing. " +
    "Use mode='quick_reference' for compact syntax reference (recommended for context efficiency). " +
    "file_path mode defaults to 'quick_reference' to reduce context size; use mode='full' to get complete docs.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        enum: getTopicNames(),
        description:
          "Documentation topic to retrieve. Call without any parameters to get the README overview. " +
          "Example: topic='syntax' for language syntax, topic='database' for database operations, topic='types' for type system.\n\n" +
          "Available topics:\n" + getTopicDescriptions(),
      },
      file_path: {
        type: "string",
        description:
          "File path being edited. Returns all relevant docs automatically based on the file type and location. " +
          "Uses applyTo pattern matching to select applicable topics. " +
          "Example: 'apis/users/create.xs' returns API, database, and syntax docs. " +
          "'functions/utils/format.xs' returns function and syntax docs.",
      },
      mode: {
        type: "string",
        enum: ["full", "quick_reference", "index"],
        description:
          "'full' = complete documentation with explanations and examples. " +
          "'quick_reference' = compact reference with just syntax patterns and signatures. " +
          "'index' = compact topic listing with descriptions and byte sizes (~1KB). " +
          "Use 'index' to discover available topics before loading them. " +
          "Use 'quick_reference' to save context window space when you just need a reminder. " +
          "Default: 'full' for topic mode, 'quick_reference' for file_path mode.",
      },
      exclude_topics: {
        type: "array",
        items: { type: "string" },
        description:
          "List of topic names to exclude from file_path results. " +
          "Use this to skip topics you've already loaded (e.g., exclude_topics: ['syntax', 'essentials']). " +
          "Only applies when using file_path parameter.",
      },
    },
    required: [],
  },
  outputSchema: {
    type: "object",
    properties: {
      documentation: {
        type: "string",
        description: "The documentation content (topic or README mode).",
      },
      file_path: {
        type: "string",
        description: "The file path that was matched (file_path mode only).",
      },
      mode: {
        type: "string",
        description: "The documentation mode used.",
      },
      version: {
        type: "string",
        description: "The XanoScript documentation version.",
      },
      topics: {
        type: "array",
        items: { type: "string" },
        description: "List of matched topic names (file_path mode only).",
      },
    },
  },
};
