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
  /**
   * Load order under a `max_tokens` budget for file_path mode: LOWER loads
   * first (and so survives truncation). Topics sharing a value fall back to
   * docs_index.json declaration order. Omitted (undefined) sorts last (99).
   */
  priority?: number;
}

export interface XanoscriptDocsArgs {
  topic?: string;
  file_path?: string;
  mode?: "full" | "quick_reference" | "index";
  tier?: "survival" | "working";
  max_tokens?: number;
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
      priority: (topic as Record<string, unknown>).priority as number | undefined,
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

export interface TierFact {
  /** Human-readable size, e.g. "5KB". */
  kb: string;
  /** Human-readable token estimate, e.g. "1.2K tokens" or "320 tokens". */
  tokens: string;
}

/**
 * Single source of truth for the survival/working tier size facts.
 *
 * These numbers are advertised in the tool spec, the index output, and the
 * README. Deriving them from the actual files (instead of hand-syncing literals
 * in four places) is what stops them drifting stale — the recurring bug this
 * helper exists to kill. Estimate ratio matches the tool spec: ~250 tokens/KB.
 */
export function getTierFacts(docsPath: string): {
  survival: TierFact;
  working: TierFact;
} {
  const fact = (file: string): TierFact => {
    let size = 0;
    try {
      size = cachedReadFile(join(docsPath, file)).length;
    } catch {
      size = 0;
    }
    const estTokens = size / 4;
    const tokens =
      estTokens >= 1000
        ? `${(estTokens / 1000).toFixed(1)}K tokens`
        : `${Math.ceil(estTokens)} tokens`;
    return { kb: `${Math.round(size / 1024)}KB`, tokens };
  };
  return { survival: fact("survival.md"), working: fact("working.md") };
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
 * Extract the Quick Reference section plus critical sections
 * (Common Mistakes, Decision/Choosing trees) from a doc.
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

  const sections: string[] = [lines.slice(startIdx, endIdx).join("\n")];

  // Also extract Common Mistakes and Decision/Choosing sections if present
  const bonusSections = ["## Common Mistakes", "## Choosing", "## Decision"];
  for (const sectionName of bonusSections) {
    const sIdx = lines.findIndex((l) => l.startsWith(sectionName));
    if (sIdx !== -1 && sIdx !== startIdx) {
      let eIdx = lines.findIndex((l, i) => i > sIdx && l.startsWith("## "));
      if (eIdx === -1) eIdx = lines.length;
      sections.push(lines.slice(sIdx, eIdx).join("\n"));
    }
  }

  // Include topic header for context
  const header = `# ${topic}\n\n`;
  return header + sections.join("\n\n---\n\n");
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
 * Resolve the ordered, budget-bounded topic list for a file_path query.
 *
 * Shared by readXanoscriptDocsV2 and readXanoscriptDocsStructured so the
 * exclude -> priority-sort -> token-budget -> empty-check logic stays identical
 * across the string and structured response paths. It previously lived as two
 * byte-for-byte copies that could silently diverge.
 */
function selectTopicsForFilePath(
  docsPath: string,
  args: XanoscriptDocsArgs & { file_path: string },
  mode: string
): string[] {
  let topics = getDocsForFilePath(args.file_path);

  // Filter out excluded topics
  if (args.exclude_topics && args.exclude_topics.length > 0) {
    topics = topics.filter((t) => !args.exclude_topics!.includes(t));
  }

  // Budget-aware loading: sort by priority and stop when budget is exceeded
  if (args.max_tokens) {
    let tokenBudget = args.max_tokens;
    const sortedTopics = [...topics].sort((a, b) => {
      const pa = XANOSCRIPT_DOCS_V2[a]?.priority ?? 99;
      const pb = XANOSCRIPT_DOCS_V2[b]?.priority ?? 99;
      return pa - pb;
    });
    const filteredTopics: string[] = [];
    for (const t of sortedTopics) {
      const config = XANOSCRIPT_DOCS_V2[t];
      const content = cachedReadFile(join(docsPath, config.file));
      const topicContent =
        mode === "quick_reference" ? extractQuickReference(content, t) : content;
      const estimatedTokens = Math.ceil(topicContent.length / 4);
      if (tokenBudget - estimatedTokens < 0 && filteredTopics.length > 0) break;
      filteredTopics.push(t);
      tokenBudget -= estimatedTokens;
    }
    topics = filteredTopics;
  }

  if (topics.length === 0) {
    throw new Error(
      `No documentation found for file pattern: ${args.file_path}\n\nAvailable topics: ${Object.keys(XANOSCRIPT_DOCS_V2).join(", ")}`
    );
  }

  return topics;
}

/**
 * Read XanoScript documentation with v2 structure
 */
export function readXanoscriptDocsV2(
  docsPath: string,
  args?: XanoscriptDocsArgs
): string {
  const version = getXanoscriptDocsVersion(docsPath);

  // Tier mode: return pre-built documentation tier
  if (args?.tier) {
    const tierFile = args.tier === "survival" ? "survival.md" : "working.md";
    const content = cachedReadFile(join(docsPath, tierFile));
    return `${content}\n\n---\nDocumentation version: ${version}`;
  }

  // Index mode — also the default when no topic/file_path is given.
  // Returns a compact topic listing with byte sizes and token estimates plus
  // orientation pointers, so a bare discovery call costs ~4KB instead of the
  // full README. The README is still reachable via topic='readme'.
  if (args?.mode === "index" || (!args?.topic && !args?.file_path)) {
    // survival/working are whole-corpus digests reached via tier=, not granular
    // topic= targets — listing them as table rows invites topic='survival' calls
    // (a different, non-tier code path). They are surfaced in Next steps instead.
    const rows = Object.entries(XANOSCRIPT_DOCS_V2)
      .filter(([name]) => name !== "survival" && name !== "working")
      .map(([name, config]) => {
        let size: number;
        try {
          size = cachedReadFile(join(docsPath, config.file)).length;
        } catch {
          size = 0;
        }
        const sizeKb = (size / 1024).toFixed(1);
        const estTokens = Math.ceil(size / 4);
        return `| ${name} | ${config.description} | ${sizeKb} KB | ~${estTokens} |`;
      });
    const tiers = getTierFacts(docsPath);
    return [
      `# XanoScript Documentation Index`,
      ``,
      `XanoScript is the declarative language for Xano backends (tables, APIs, functions, tasks, AI agents).`,
      ``,
      `Topics: ${rows.length}`,
      ``,
      `| Topic | Description | Size | Est. Tokens |`,
      `|-------|-------------|------|-------------|`,
      ...rows,
      ``,
      `Next steps:`,
      `- topic='readme' — full overview (workspace structure, core syntax patterns, type names)`,
      `- topic='<name>' — load one topic (e.g. 'syntax', 'database', 'apis')`,
      `- file_path='api/users/create.xs' — auto-select the docs for the file you're editing`,
      `- tier='survival' (~${tiers.survival.tokens}) or tier='working' (~${tiers.working.tokens}) for context-limited models`,
      `- mode='quick_reference' — compact output when you only need a reminder`,
      `- max_tokens=4000 with file_path= — stop loading once the budget is reached`,
      `- exclude_topics=['syntax'] with file_path= — skip topics you've already loaded`,
      ``,
      `---`,
      `Documentation version: ${version}`,
    ].join("\n");
  }

  // Default to quick_reference for file_path mode (loads many topics),
  // full for topic mode (loads single topic)
  const mode = args?.mode || (args?.file_path ? "quick_reference" : "full");

  // Context-aware: return docs matching file pattern
  if (args?.file_path) {
    const topics = selectTopicsForFilePath(
      docsPath,
      args as XanoscriptDocsArgs & { file_path: string },
      mode
    );

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

  const topics = selectTopicsForFilePath(docsPath, args, mode);

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
