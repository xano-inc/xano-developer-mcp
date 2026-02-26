/**
 * XanoScript Documentation Module
 *
 * This module contains the core logic for XanoScript documentation
 * handling, separated from the MCP server for testability.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { minimatch } from "minimatch";
import docsIndex from "./xanoscript_docs/docs_index.json" with { type: "json" };

// =============================================================================
// Types
// =============================================================================

export interface DocConfig {
  file: string;
  applyTo: string[];
  description: string;
}

export interface XanoscriptDocsArgs {
  topic?: string;
  file_path?: string;
  mode?: "full" | "quick_reference" | "index";
  exclude_topics?: string[];
}

// =============================================================================
// Documentation Configuration (loaded from docs_index.json)
// =============================================================================

function buildDocsConfig(): Record<string, DocConfig> {
  const config: Record<string, DocConfig> = {};
  for (const [key, topic] of Object.entries(docsIndex.topics)) {
    config[key] = {
      file: topic.file,
      applyTo: topic.applyTo,
      description: topic.description,
    };
  }
  return config;
}

export const XANOSCRIPT_DOCS_V2: Record<string, DocConfig> = buildDocsConfig();

// =============================================================================
// Content Cache
// =============================================================================

const _fileCache = new Map<string, string>();
let _versionCache: { path: string; version: string } | null = null;

/**
 * Clear all cached documentation content and version data.
 * Useful for testing or when docs files change at runtime.
 */
export function clearDocsCache(): void {
  _fileCache.clear();
  _versionCache = null;
}

function cachedReadFile(filePath: string): string {
  const cached = _fileCache.get(filePath);
  if (cached !== undefined) return cached;
  const content = readFileSync(filePath, "utf-8");
  _fileCache.set(filePath, content);
  return content;
}

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Get list of topics that apply to a given file path based on applyTo patterns
 */
export function getDocsForFilePath(filePath: string): string[] {
  const matches: string[] = [];

  for (const [topic, config] of Object.entries(XANOSCRIPT_DOCS_V2)) {
    if (topic === "readme") continue; // Don't auto-include readme

    for (const pattern of config.applyTo) {
      if (minimatch(filePath, pattern)) {
        matches.push(topic);
        break;
      }
    }
  }

  // Always include syntax as foundation (if not already matched)
  if (!matches.includes("syntax")) {
    matches.unshift("syntax");
  }

  return matches;
}

/**
 * Extract just the Quick Reference section from a doc
 */
export function extractQuickReference(content: string, topic: string): string {
  const lines = content.split("\n");
  const startIdx = lines.findIndex((l) => l.startsWith("## Quick Reference"));

  if (startIdx === -1) {
    // Fallback: return first 50 lines or up to first ## section
    const firstSection = lines.findIndex((l, i) => i > 0 && l.startsWith("## "));
    return lines.slice(0, firstSection > 0 ? firstSection : 50).join("\n");
  }

  // Find the next ## section after Quick Reference
  let endIdx = lines.findIndex((l, i) => i > startIdx && l.startsWith("## "));
  if (endIdx === -1) endIdx = lines.length;

  // Include topic header for context
  const header = `# ${topic}\n\n`;
  return header + lines.slice(startIdx, endIdx).join("\n");
}

/**
 * Get the documentation version from the version.json file
 */
export function getXanoscriptDocsVersion(docsPath: string): string {
  if (_versionCache && _versionCache.path === docsPath) {
    return _versionCache.version;
  }
  try {
    const versionFile = cachedReadFile(join(docsPath, "version.json"));
    const version = JSON.parse(versionFile).version || "unknown";
    _versionCache = { path: docsPath, version };
    return version;
  } catch {
    return "unknown";
  }
}

/**
 * Read XanoScript documentation with v2 structure
 */
export function readXanoscriptDocsV2(
  docsPath: string,
  args?: XanoscriptDocsArgs
): string {
  const version = getXanoscriptDocsVersion(docsPath);

  // Index mode: return compact topic listing with byte sizes
  if (args?.mode === "index") {
    const rows = Object.entries(XANOSCRIPT_DOCS_V2).map(([name, config]) => {
      let size: number;
      try {
        size = cachedReadFile(join(docsPath, config.file)).length;
      } catch {
        size = 0;
      }
      const sizeKb = (size / 1024).toFixed(1);
      return `| ${name} | ${config.description} | ${sizeKb} KB |`;
    });
    return [
      `# XanoScript Documentation Index`,
      ``,
      `Version: ${version}`,
      `Topics: ${rows.length}`,
      ``,
      `| Topic | Description | Size |`,
      `|-------|-------------|------|`,
      ...rows,
      ``,
      `Use topic='<name>' to load a specific topic. Use mode='quick_reference' for compact output.`,
    ].join("\n");
  }

  // Default to quick_reference for file_path mode (loads many topics),
  // full for topic mode (loads single topic)
  const mode = args?.mode || (args?.file_path ? "quick_reference" : "full");

  // Default: return README
  if (!args?.topic && !args?.file_path) {
    const readme = cachedReadFile(join(docsPath, "README.md"));
    return `${readme}\n\n---\nDocumentation version: ${version}`;
  }

  // Context-aware: return docs matching file pattern
  if (args?.file_path) {
    let topics = getDocsForFilePath(args.file_path);

    // Filter out excluded topics
    if (args.exclude_topics && args.exclude_topics.length > 0) {
      topics = topics.filter((t) => !args.exclude_topics!.includes(t));
    }

    if (topics.length === 0) {
      throw new Error(
        `No documentation found for file pattern: ${args.file_path}\n\nAvailable topics: ${Object.keys(XANOSCRIPT_DOCS_V2).join(", ")}`
      );
    }

    const docs = topics.map((t) => {
      const config = XANOSCRIPT_DOCS_V2[t];
      const content = cachedReadFile(join(docsPath, config.file));
      return mode === "quick_reference"
        ? extractQuickReference(content, t)
        : content;
    });

    const header = `# XanoScript Documentation for: ${args.file_path}\n\nMatched topics: ${topics.join(", ")}\nMode: ${mode}\nVersion: ${version}\n\n---\n\n`;
    return header + docs.join("\n\n---\n\n");
  }

  // Topic-based: return specific doc
  const config = XANOSCRIPT_DOCS_V2[args!.topic!];

  if (!config) {
    const availableTopics = Object.keys(XANOSCRIPT_DOCS_V2).join(", ");
    throw new Error(
      `Unknown topic "${args!.topic}".\n\nAvailable topics: ${availableTopics}`
    );
  }

  const content = cachedReadFile(join(docsPath, config.file));
  const doc = mode === "quick_reference"
    ? extractQuickReference(content, args!.topic!)
    : content;

  return `${doc}\n\n---\nDocumentation version: ${version}`;
}

// =============================================================================
// Structured Documentation Access
// =============================================================================

export interface TopicDoc {
  topic: string;
  content: string;
}

/**
 * Read documentation as structured per-topic entries for file_path mode.
 * Returns each matched topic as a separate object for multi-content MCP responses.
 */
export function readXanoscriptDocsStructured(
  docsPath: string,
  args: XanoscriptDocsArgs & { file_path: string }
): TopicDoc[] {
  const mode = args.mode || "quick_reference";

  let topics = getDocsForFilePath(args.file_path);

  if (args.exclude_topics && args.exclude_topics.length > 0) {
    topics = topics.filter((t) => !args.exclude_topics!.includes(t));
  }

  if (topics.length === 0) {
    throw new Error(
      `No documentation found for file pattern: ${args.file_path}\n\nAvailable topics: ${Object.keys(XANOSCRIPT_DOCS_V2).join(", ")}`
    );
  }

  return topics.map((t) => {
    const config = XANOSCRIPT_DOCS_V2[t];
    const content = cachedReadFile(join(docsPath, config.file));
    return {
      topic: t,
      content:
        mode === "quick_reference"
          ? extractQuickReference(content, t)
          : content,
    };
  });
}

// =============================================================================
// Topic Metadata
// =============================================================================

/**
 * Get available topic names
 */
export function getTopicNames(): string[] {
  return Object.keys(XANOSCRIPT_DOCS_V2);
}

/**
 * Get topic descriptions for documentation
 */
export function getTopicDescriptions(): string {
  return Object.entries(XANOSCRIPT_DOCS_V2)
    .map(([k, v]) => `${k} (${v.description.split(".")[0]})`)
    .join(", ");
}
