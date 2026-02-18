/**
 * XanoScript Documentation Module
 *
 * This module contains the core logic for XanoScript documentation
 * handling, separated from the MCP server for testability.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { minimatch } from "minimatch";

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
  mode?: "full" | "quick_reference";
}

// =============================================================================
// Documentation Configuration
// =============================================================================

export const XANOSCRIPT_DOCS_V2: Record<string, DocConfig> = {
  readme: {
    file: "README.md",
    applyTo: [],
    description: "XanoScript overview, workspace structure, and quick reference",
  },
  cheatsheet: {
    file: "cheatsheet.md",
    applyTo: ["**/*.xs"],
    description: "Quick reference for 20 most common XanoScript patterns",
  },
  syntax: {
    file: "syntax.md",
    applyTo: ["**/*.xs"],
    description: "Expressions, operators, and filters for all XanoScript code",
  },
  quickstart: {
    file: "quickstart.md",
    applyTo: ["**/*.xs"],
    description: "Common patterns, quick reference, and common mistakes to avoid",
  },
  types: {
    file: "types.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs", "tools/**/*.xs", "agents/**/*.xs"],
    description: "Data types, input blocks, and validation",
  },
  tables: {
    file: "tables.md",
    applyTo: ["tables/*.xs"],
    description: "Database schema definitions with indexes and relationships",
  },
  functions: {
    file: "functions.md",
    applyTo: ["functions/**/*.xs"],
    description: "Reusable function stacks with inputs and responses",
  },
  apis: {
    file: "apis.md",
    applyTo: ["apis/**/*.xs"],
    description: "HTTP endpoint definitions with authentication and CRUD patterns",
  },
  tasks: {
    file: "tasks.md",
    applyTo: ["tasks/*.xs"],
    description: "Scheduled and cron jobs",
  },
  triggers: {
    file: "triggers.md",
    applyTo: ["triggers/**/*.xs"],
    description: "Event-driven handlers (table, realtime, workspace, agent, MCP)",
  },
  database: {
    file: "database.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs", "tasks/*.xs", "tools/**/*.xs"],
    description: "All db.* operations: query, get, add, edit, patch, delete",
  },
  agents: {
    file: "agents.md",
    applyTo: ["agents/**/*.xs"],
    description: "AI agent configuration with LLM providers and tools",
  },
  tools: {
    file: "tools.md",
    applyTo: ["tools/**/*.xs"],
    description: "AI tools for agents and MCP servers",
  },
  "mcp-servers": {
    file: "mcp-servers.md",
    applyTo: ["mcp_servers/**/*.xs"],
    description: "MCP server definitions exposing tools",
  },
  "unit-testing": {
    file: "unit-testing.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs", "middleware/**/*.xs"],
    description: "Unit tests, mocks, and assertions within functions, APIs, and middleware",
  },
  "workflow-tests": {
    file: "workflow-tests.md",
    applyTo: ["workflow_test/**/*.xs"],
    description: "End-to-end workflow tests with data source selection and tags",
  },
  integrations: {
    file: "integrations.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs", "tasks/*.xs"],
    description: "External service integrations index - see sub-topics for details",
  },
  "integrations/cloud-storage": {
    file: "integrations/cloud-storage.md",
    applyTo: [],
    description: "AWS S3, Azure Blob, and GCP Storage operations",
  },
  "integrations/search": {
    file: "integrations/search.md",
    applyTo: [],
    description: "Elasticsearch, OpenSearch, and Algolia search operations",
  },
  "integrations/redis": {
    file: "integrations/redis.md",
    applyTo: [],
    description: "Redis caching, rate limiting, and queue operations",
  },
  "integrations/external-apis": {
    file: "integrations/external-apis.md",
    applyTo: [],
    description: "HTTP requests with api.request patterns",
  },
  "integrations/utilities": {
    file: "integrations/utilities.md",
    applyTo: [],
    description: "Local storage, email, zip, and Lambda utilities",
  },
  frontend: {
    file: "frontend.md",
    applyTo: ["static/**/*"],
    description: "Static frontend development and deployment",
  },
  run: {
    file: "run.md",
    applyTo: ["run/**/*.xs"],
    description: "Run job and service configurations for the Xano Job Runner",
  },
  addons: {
    file: "addons.md",
    applyTo: ["addons/*.xs", "functions/**/*.xs", "apis/**/*.xs"],
    description: "Reusable subqueries for fetching related data",
  },
  debugging: {
    file: "debugging.md",
    applyTo: ["**/*.xs"],
    description: "Logging, inspecting, and debugging XanoScript execution",
  },
  performance: {
    file: "performance.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs"],
    description: "Performance optimization best practices",
  },
  realtime: {
    file: "realtime.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs", "triggers/**/*.xs"],
    description: "Real-time channels and events for push updates",
  },
  schema: {
    file: "schema.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs"],
    description: "Runtime schema parsing and validation",
  },
  security: {
    file: "security.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs"],
    description: "Security best practices for authentication and authorization",
  },
  streaming: {
    file: "streaming.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs"],
    description: "Streaming data from files, requests, and responses",
  },
  middleware: {
    file: "middleware.md",
    applyTo: ["middleware/**/*.xs"],
    description: "Request/response interceptors for functions, queries, tasks, and tools",
  },
  branch: {
    file: "branch.md",
    applyTo: ["branch.xs"],
    description: "Branch-level settings: middleware, history retention, visual styling",
  },
  workspace: {
    file: "workspace.md",
    applyTo: ["workspace.xs"],
    description: "Workspace-level settings: environment variables, preferences, realtime",
  },
};

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
  try {
    const versionFile = readFileSync(join(docsPath, "version.json"), "utf-8");
    return JSON.parse(versionFile).version || "unknown";
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
  const mode = args?.mode || "full";
  const version = getXanoscriptDocsVersion(docsPath);

  try {
    // Default: return README
    if (!args?.topic && !args?.file_path) {
      const readme = readFileSync(join(docsPath, "README.md"), "utf-8");
      return `${readme}\n\n---\nDocumentation version: ${version}`;
    }

    // Context-aware: return docs matching file pattern
    if (args?.file_path) {
      const topics = getDocsForFilePath(args.file_path);

      if (topics.length === 0) {
        return `No documentation found for file pattern: ${args.file_path}\n\nAvailable topics: ${Object.keys(XANOSCRIPT_DOCS_V2).join(", ")}`;
      }

      const docs = topics.map((t) => {
        const config = XANOSCRIPT_DOCS_V2[t];
        const content = readFileSync(join(docsPath, config.file), "utf-8");
        return mode === "quick_reference"
          ? extractQuickReference(content, t)
          : content;
      });

      const header = `# XanoScript Documentation for: ${args.file_path}\n\nMatched topics: ${topics.join(", ")}\nMode: ${mode}\nVersion: ${version}\n\n---\n\n`;
      return header + docs.join("\n\n---\n\n");
    }

    // Topic-based: return specific doc
    if (args?.topic) {
      const config = XANOSCRIPT_DOCS_V2[args.topic];

      if (!config) {
        const availableTopics = Object.keys(XANOSCRIPT_DOCS_V2).join(", ");
        return `Error: Unknown topic "${args.topic}".\n\nAvailable topics: ${availableTopics}`;
      }

      const content = readFileSync(join(docsPath, config.file), "utf-8");
      const doc = mode === "quick_reference"
        ? extractQuickReference(content, args.topic)
        : content;

      return `${doc}\n\n---\nDocumentation version: ${version}`;
    }

    return "Error: Invalid parameters";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error reading XanoScript documentation: ${errorMessage}`;
  }
}

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
