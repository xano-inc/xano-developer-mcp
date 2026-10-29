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
import {
  gatePolicies,
  perPolicies,
  policiesIncluded,
  policiesOnly,
  type DeveloperToolsOptions,
} from "./policies.js";

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
  /**
   * The topic alone documents the files its `applyTo` matches: file_path mode
   * returns it without `syntax` or any other matching topic.
   */
  exclusive?: boolean;
}

export interface XanoscriptDocsArgs {
  topic?: string;
  file_path?: string;
  filter?: string;
  mode?: "full" | "quick_reference" | "index";
  tier?: "survival" | "working";
  max_tokens?: number;
  exclude_topics?: string[];
}

// =============================================================================
// Documentation Configuration (loaded from docs_index.json)
// =============================================================================

/** Every topic, a topic of the policies feature (`"feature": "policies"`) marked as such. */
function buildDocsConfig(): Record<string, DocConfig> {
  const config: Record<string, DocConfig> = {};
  for (const [key, topic] of Object.entries(docsIndex.topics)) {
    const doc: DocConfig = {
      file: topic.file,
      applyTo: topic.applyTo,
      description: topic.description,
      priority: (topic as Record<string, unknown>).priority as number | undefined,
      exclusive: (topic as Record<string, unknown>).exclusive === true,
    };
    config[key] = (topic as Record<string, unknown>).feature === "policies" ? policiesOnly(doc) : doc;
  }
  return config;
}

const ALL_DOCS = buildDocsConfig();

/** The topics served under the host's options. */
export const docsConfigFor = perPolicies((options) => gatePolicies(ALL_DOCS, options));

/** The topics served by default (without the policies feature). */
export const XANOSCRIPT_DOCS_V2: Record<string, DocConfig> = docsConfigFor();

/**
 * Map of alias -> canonical topic name, built from the `aliases` arrays in
 * docs_index.json. Lets callers pass a natural synonym (e.g. "upload",
 * "storage", "attachment") and have it resolve to the canonical topic
 * ("file-uploads"). An alias that shadows a real topic name is skipped, and
 * cross-topic collisions are resolved first-writer-wins. Only the served
 * topics' aliases resolve.
 */
const aliasesFor = perPolicies((options) => {
  const docs = docsConfigFor(options);
  const map: Record<string, string> = {};
  for (const [key, topic] of Object.entries(docsIndex.topics)) {
    if (!(key in docs)) continue;
    const aliases = (topic as { aliases?: string[] }).aliases;
    if (!aliases) continue;
    for (const alias of aliases) {
      if (alias in docs) continue; // never shadow a canonical topic name
      if (alias in map) continue; // first-writer-wins on cross-topic collisions
      map[alias] = key;
    }
  }
  return map;
});

/**
 * Resolve a topic name or alias to a canonical topic name. Returns the input
 * unchanged when it is already canonical or unknown, so callers can still
 * surface the existing "Unknown topic" error for genuinely bad input.
 */
export function resolveTopic(input?: string, options?: DeveloperToolsOptions): string | undefined {
  if (!input) return input;
  if (input in docsConfigFor(options)) return input;
  return aliasesFor(options)[input] ?? input;
}

/** Get all alias names (keys of the alias -> canonical topic map). */
export function getAliasNames(options?: DeveloperToolsOptions): string[] {
  return Object.keys(aliasesFor(options));
}

// =============================================================================
// Content Cache
// =============================================================================

/** Keyed by gate state and path: a doc is cached as the host's options serve it. */
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

function cachedReadFile(filePath: string, options?: DeveloperToolsOptions): string {
  const key = `${policiesIncluded(options)}:${filePath}`;
  const cached = _fileCache.get(key);
  if (cached !== undefined) return cached;
  const content = gatePolicies(readFileSync(filePath, "utf-8"), options);
  _fileCache.set(key, content);
  return content;
}

/** One documentation file as the host's options serve it. */
export function readDocFile(docsPath: string, file: string, options?: DeveloperToolsOptions): string {
  return cachedReadFile(join(docsPath, file), options);
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
export function getTierFacts(docsPath: string, options?: DeveloperToolsOptions): {
  survival: TierFact;
  working: TierFact;
} {
  const fact = (file: string): TierFact => {
    let size = 0;
    try {
      size = cachedReadFile(join(docsPath, file), options).length;
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
export function getDocsForFilePath(filePath: string, options?: DeveloperToolsOptions): string[] {
  const matches: string[] = [];

  for (const [topic, config] of Object.entries(docsConfigFor(options))) {
    if (topic === "readme") continue; // Don't auto-include readme

    for (const pattern of config.applyTo) {
      if (minimatch(filePath, pattern)) {
        if (config.exclusive) return [topic];
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
 * Extract individual filter entries from the expression filter reference
 * (expressions/filters.md) by name. Accepts display names and canonical
 * aliases, case-insensitive, comma-separated for multiple filters. A name that
 * maps to more than one entry (e.g. "min" is both the canonical alias of
 * array_min and the display name of num_min) returns all matching entries,
 * since the engine picks by input type.
 */
export function extractFilterDocs(
  docsPath: string,
  filterQuery: string,
  options?: DeveloperToolsOptions
): string {
  const content = cachedReadFile(join(docsPath, "expressions/filters.md"), options);
  const lines = content.split("\n");

  interface FilterSection {
    names: string[];
    start: number;
    end: number;
  }
  const headingRe = /^### `([^`]+)`(?: \(alias `([^`]+)`\))?/;
  const sections: FilterSection[] = [];

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(headingRe);
    if (!m) continue;
    let end = lines.findIndex(
      (l, j) => j > i && (l.startsWith("### ") || l.startsWith("## "))
    );
    if (end === -1) end = lines.length;
    const names = [m[1].toLowerCase()];
    if (m[2]) names.push(m[2].toLowerCase());
    sections.push({ names, start: i, end });
  }

  const requested = filterQuery
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (requested.length === 0) {
    throw new Error(
      "filter must name at least one filter, e.g. filter='round' or filter='to_upper,split'"
    );
  }

  const picked: FilterSection[] = [];
  const notFound: string[] = [];
  for (const name of requested) {
    const lower = name.toLowerCase();
    const matches = sections.filter((s) => s.names.includes(lower));
    if (matches.length === 0) {
      notFound.push(name);
      continue;
    }
    for (const s of matches) {
      if (!picked.includes(s)) picked.push(s);
    }
  }

  if (notFound.length > 0) {
    const allNames = [...new Set(sections.flatMap((s) => s.names))];
    const suggestions = [
      ...new Set(
        notFound.flatMap((n) => {
          const q = n.toLowerCase();
          return allNames.filter(
            (a) => a.includes(q) || (a.length >= 3 && q.includes(a))
          );
        })
      ),
    ];
    throw new Error(
      `Unknown filter${notFound.length > 1 ? "s" : ""}: ${notFound.join(", ")}.` +
        (suggestions.length > 0 ? ` Did you mean: ${suggestions.join(", ")}?` : "") +
        ` Use topic='expressions/filters' with mode='quick_reference' for the full name list.`
    );
  }

  picked.sort((a, b) => a.start - b.start);
  const body = picked
    .map((s) => lines.slice(s.start, s.end).join("\n").trim())
    .join("\n\n---\n\n");
  return `# Expression Filter Documentation: ${requested.join(", ")}\n\n${body}`;
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
  mode: string,
  options?: DeveloperToolsOptions
): string[] {
  const docs = docsConfigFor(options);
  let topics = getDocsForFilePath(args.file_path, options);

  // Filter out excluded topics
  if (args.exclude_topics && args.exclude_topics.length > 0) {
    topics = topics.filter((t) => !args.exclude_topics!.includes(t));
  }

  // Budget-aware loading: sort by priority and stop when budget is exceeded
  if (args.max_tokens) {
    let tokenBudget = args.max_tokens;
    const sortedTopics = [...topics].sort((a, b) => {
      const pa = docs[a]?.priority ?? 99;
      const pb = docs[b]?.priority ?? 99;
      return pa - pb;
    });
    const filteredTopics: string[] = [];
    for (const t of sortedTopics) {
      const config = docs[t];
      const content = cachedReadFile(join(docsPath, config.file), options);
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
      `No documentation found for file pattern: ${args.file_path}\n\nAvailable topics: ${Object.keys(docs).join(", ")}`
    );
  }

  return topics;
}

/**
 * Read XanoScript documentation with v2 structure
 */
export function readXanoscriptDocsV2(
  docsPath: string,
  args?: XanoscriptDocsArgs,
  options?: DeveloperToolsOptions
): string {
  const version = getXanoscriptDocsVersion(docsPath);
  const docs = docsConfigFor(options);

  // Tier mode: return pre-built documentation tier
  if (args?.tier) {
    const tierFile = args.tier === "survival" ? "survival.md" : "working.md";
    const content = cachedReadFile(join(docsPath, tierFile), options);
    return `${content}\n\n---\nDocumentation version: ${version}`;
  }

  // Index mode — also the default when no topic/file_path is given.
  // Returns a compact topic listing with byte sizes and token estimates plus
  // orientation pointers, so a bare discovery call costs ~4KB instead of the
  // full README. The README is still reachable via topic='readme'.
  if (
    args?.mode === "index" ||
    (!args?.topic && !args?.file_path && !args?.filter)
  ) {
    // survival/working are whole-corpus digests reached via tier=, not granular
    // topic= targets — listing them as table rows invites topic='survival' calls
    // (a different, non-tier code path). They are surfaced in Next steps instead.
    const rows = Object.entries(docs)
      .filter(([name]) => name !== "survival" && name !== "working")
      .map(([name, config]) => {
        let size: number;
        try {
          size = cachedReadFile(join(docsPath, config.file), options).length;
        } catch {
          size = 0;
        }
        const sizeKb = (size / 1024).toFixed(1);
        const estTokens = Math.ceil(size / 4);
        return `| ${name} | ${config.description} | ${sizeKb} KB | ~${estTokens} |`;
      });
    const tiers = getTierFacts(docsPath, options);
    return gatePolicies([
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
      `- filter='round' — one expression filter's signature and example (comma-separate for several, e.g. filter='to_upper,split')`,
      `- tier='survival' (~${tiers.survival.tokens}) or tier='working' (~${tiers.working.tokens}) for context-limited models`,
      `<!-- policies -->- topic='policies' — when the workspace has a policies/ folder: keep to its Block policies while changing code, and evaluate after<!-- /policies -->`,
      `- mode='quick_reference' — compact output when you only need a reminder`,
      `- max_tokens=4000 with file_path= — stop loading once the budget is reached`,
      `- exclude_topics=['syntax'] with file_path= — skip topics you've already loaded`,
      ``,
      `---`,
      `Documentation version: ${version}`,
    ], options).join("\n");
  }

  // Filter lookup: return individual entries from the expression filter
  // reference instead of a whole topic
  if (args?.filter) {
    const doc = extractFilterDocs(docsPath, args.filter, options);
    return `${doc}\n\n---\nDocumentation version: ${version}`;
  }

  // Default to quick_reference for file_path mode (loads many topics),
  // full for topic mode (loads single topic)
  const mode = args?.mode || (args?.file_path ? "quick_reference" : "full");

  // Context-aware: return docs matching file pattern
  if (args?.file_path) {
    const topics = selectTopicsForFilePath(
      docsPath,
      args as XanoscriptDocsArgs & { file_path: string },
      mode,
      options
    );

    const contents = topics.map((t) => {
      const config = docs[t];
      const content = cachedReadFile(join(docsPath, config.file), options);
      return mode === "quick_reference"
        ? extractQuickReference(content, t)
        : content;
    });

    const header = `# XanoScript Documentation for: ${args.file_path}\n\nMatched topics: ${topics.join(", ")}\nMode: ${mode}\nVersion: ${version}\n\n---\n\n`;
    return header + contents.join("\n\n---\n\n");
  }

  // Topic-based: return specific doc (resolve aliases to canonical names first)
  const canonicalTopic = resolveTopic(args!.topic!, options)!;
  const config = docs[canonicalTopic];

  if (!config) {
    const availableTopics = Object.keys(docs).join(", ");
    throw new Error(
      `Unknown topic "${args!.topic}".\n\nAvailable topics: ${availableTopics}`
    );
  }

  const content = cachedReadFile(join(docsPath, config.file), options);
  const doc = mode === "quick_reference"
    ? extractQuickReference(content, canonicalTopic)
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
  args: XanoscriptDocsArgs & { file_path: string },
  options?: DeveloperToolsOptions
): TopicDoc[] {
  const mode = args.mode || "quick_reference";
  const docs = docsConfigFor(options);

  const topics = selectTopicsForFilePath(docsPath, args, mode, options);

  return topics.map((t) => {
    const config = docs[t];
    const content = cachedReadFile(join(docsPath, config.file), options);
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
export function getTopicNames(options?: DeveloperToolsOptions): string[] {
  return Object.keys(docsConfigFor(options));
}

/**
 * Get topic descriptions for documentation
 */
export function getTopicDescriptions(options?: DeveloperToolsOptions): string {
  return Object.entries(docsConfigFor(options))
    .map(([k, v]) => `${k} (${v.description.split(".")[0]})`)
    .join(", ");
}
