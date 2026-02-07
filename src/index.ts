#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { minimatch } from "minimatch";
import { xanoscriptParser } from "@xano/xanoscript-language-server/parser/parser.js";
import { getSchemeFromContent } from "@xano/xanoscript-language-server/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
const SERVER_VERSION: string = pkg.version;

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(SERVER_VERSION);
  process.exit(0);
}

// =============================================================================
// XanoScript Documentation v2 Configuration
// =============================================================================

interface DocConfig {
  file: string;
  applyTo: string[];
  description: string;
}

const XANOSCRIPT_DOCS_V2: Record<string, DocConfig> = {
  readme: {
    file: "README.md",
    applyTo: [],
    description: "XanoScript overview, workspace structure, and quick reference",
  },
  syntax: {
    file: "syntax.md",
    applyTo: ["**/*.xs"],
    description: "Expressions, operators, and filters for all XanoScript code",
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
  testing: {
    file: "testing.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs"],
    description: "Unit tests, mocks, and assertions",
  },
  integrations: {
    file: "integrations.md",
    applyTo: ["functions/**/*.xs", "apis/**/*.xs", "tasks/*.xs"],
    description: "Cloud storage, Redis, security, and external APIs",
  },
  frontend: {
    file: "frontend.md",
    applyTo: ["static/**/*"],
    description: "Static frontend development and deployment",
  },
  ephemeral: {
    file: "ephemeral.md",
    applyTo: ["ephemeral/**/*.xs"],
    description: "Temporary test environments",
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
};

// =============================================================================
// API Documentation Configuration
// =============================================================================

const DOCS_MAP: Record<string, string> = {
  workspace: "workspace.md",
  table: "table.md",
  api_group: "api_group.md",
  function: "function.md",
  task: "task.md",
  middleware: "middleware.md",
  addon: "addon.md",
  agent: "agent.md",
  tool: "tool.md",
  mcp_server: "mcp_server.md",
  realtime: "realtime.md",
  triggers: "triggers.md",
  file: "file.md",
  history: "history.md",
  authentication: "authentication.md",
};

// =============================================================================
// Path Resolution
// =============================================================================

function getDocsPath(): string {
  const possiblePaths = [
    join(__dirname, "..", "api_docs"),
    join(__dirname, "..", "..", "api_docs"),
  ];

  for (const p of possiblePaths) {
    try {
      readFileSync(join(p, "index.md"));
      return p;
    } catch {
      continue;
    }
  }

  return join(__dirname, "..", "api_docs");
}

function getXanoscriptDocsPath(): string {
  const possiblePaths = [
    join(__dirname, "..", "xanoscript_docs"),
    join(__dirname, "..", "..", "xanoscript_docs"),
  ];

  for (const p of possiblePaths) {
    try {
      readFileSync(join(p, "version.json"));
      return p;
    } catch {
      continue;
    }
  }

  return join(__dirname, "..", "xanoscript_docs");
}

const DOCS_PATH = getDocsPath();
const XANOSCRIPT_DOCS_PATH = getXanoscriptDocsPath();

// =============================================================================
// Documentation Helpers
// =============================================================================

function getXanoscriptDocsVersion(): string {
  try {
    const versionFile = readFileSync(
      join(XANOSCRIPT_DOCS_PATH, "version.json"),
      "utf-8"
    );
    return JSON.parse(versionFile).version || "unknown";
  } catch {
    return "unknown";
  }
}

function readDocumentation(object?: string): string {
  try {
    if (!object) {
      return readFileSync(join(DOCS_PATH, "index.md"), "utf-8");
    }

    const normalizedObject = object.toLowerCase().trim();

    if (normalizedObject in DOCS_MAP) {
      const filePath = join(DOCS_PATH, DOCS_MAP[normalizedObject]);
      return readFileSync(filePath, "utf-8");
    }

    const matchingKey = Object.keys(DOCS_MAP).find(
      (key) =>
        key.includes(normalizedObject) || normalizedObject.includes(key)
    );

    if (matchingKey) {
      const filePath = join(DOCS_PATH, DOCS_MAP[matchingKey]);
      return readFileSync(filePath, "utf-8");
    }

    const availableObjects = Object.keys(DOCS_MAP).join(", ");
    return `Error: Unknown object "${object}". Available objects: ${availableObjects}

Use api_docs() without parameters to see the full documentation index.`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error reading documentation: ${errorMessage}`;
  }
}

// =============================================================================
// XanoScript Documentation v2 Functions
// =============================================================================

/**
 * Get list of topics that apply to a given file path based on applyTo patterns
 */
function getDocsForFilePath(filePath: string): string[] {
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
function extractQuickReference(content: string, topic: string): string {
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
 * Read XanoScript documentation with new v2 structure
 */
function readXanoscriptDocsV2(args?: {
  topic?: string;
  file_path?: string;
  mode?: "full" | "quick_reference";
}): string {
  const mode = args?.mode || "full";
  const version = getXanoscriptDocsVersion();

  try {
    // Default: return README
    if (!args?.topic && !args?.file_path) {
      const readme = readFileSync(join(XANOSCRIPT_DOCS_PATH, "README.md"), "utf-8");
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
        const content = readFileSync(join(XANOSCRIPT_DOCS_PATH, config.file), "utf-8");
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

      const content = readFileSync(join(XANOSCRIPT_DOCS_PATH, config.file), "utf-8");
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

// =============================================================================
// MCP Server Setup
// =============================================================================

const server = new Server(
  {
    name: "xano-developer-mcp",
    version: SERVER_VERSION,
    description:
      "MCP server for Xano Headless API documentation and XanoScript code validation",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// =============================================================================
// Resource Handlers (MCP Resources)
// =============================================================================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = Object.entries(XANOSCRIPT_DOCS_V2).map(([key, config]) => ({
    uri: `xanoscript://docs/${key}`,
    name: key,
    description: config.description,
    mimeType: "text/markdown",
  }));

  return { resources };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const match = uri.match(/^xanoscript:\/\/docs\/(.+)$/);

  if (!match) {
    throw new Error(`Unknown resource URI: ${uri}`);
  }

  const topic = match[1];
  const config = XANOSCRIPT_DOCS_V2[topic];

  if (!config) {
    throw new Error(
      `Unknown topic: ${topic}. Available: ${Object.keys(XANOSCRIPT_DOCS_V2).join(", ")}`
    );
  }

  const content = readFileSync(join(XANOSCRIPT_DOCS_PATH, config.file), "utf-8");
  const version = getXanoscriptDocsVersion();

  return {
    contents: [
      {
        uri,
        mimeType: "text/markdown",
        text: `${content}\n\n---\nDocumentation version: ${version}`,
      },
    ],
  };
});

// =============================================================================
// Tool Handlers
// =============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "api_docs",
        description:
          "Get Xano Headless API documentation. Returns documentation for interacting with the Xano Headless API using XanoScript. Use without parameters for an overview, or specify an object for detailed documentation.",
        inputSchema: {
          type: "object",
          properties: {
            object: {
              type: "string",
              description: `Optional: The specific API object to get documentation for. Available values: ${Object.keys(DOCS_MAP).join(", ")}`,
            },
          },
          required: [],
        },
      },
      {
        name: "validate_xanoscript",
        description:
          "Validate XanoScript code for syntax errors. Returns a list of errors with line/column positions, or confirms the code is valid. The language server auto-detects the object type from the code syntax.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "The XanoScript code to validate",
            },
          },
          required: ["code"],
        },
      },
      {
        name: "xanoscript_docs",
        description:
          "Get XanoScript programming language documentation for AI code generation. " +
          "Call without parameters for overview (README). " +
          "Use 'topic' for specific documentation, or 'file_path' for context-aware docs based on the file you're editing. " +
          "Use mode='quick_reference' for compact syntax cheatsheet (recommended for context efficiency).",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description:
                "Documentation topic. Available: " +
                Object.entries(XANOSCRIPT_DOCS_V2)
                  .map(([k, v]) => `${k} (${v.description.split(".")[0]})`)
                  .join(", "),
            },
            file_path: {
              type: "string",
              description:
                "File path being edited (e.g., 'apis/users/create.xs', 'functions/utils/format.xs'). " +
                "Returns all relevant docs based on file type using applyTo pattern matching.",
            },
            mode: {
              type: "string",
              enum: ["full", "quick_reference"],
              description:
                "full = complete documentation, quick_reference = compact Quick Reference sections only. " +
                "Use quick_reference for smaller context window usage.",
            },
          },
          required: [],
        },
      },
      {
        name: "mcp_version",
        description:
          "Get the current version of the Xano Developer MCP server. " +
          "Returns the version string from package.json.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "api_docs") {
    const args = request.params.arguments as { object?: string } | undefined;
    const object = args?.object;
    const documentation = readDocumentation(object);

    return {
      content: [
        {
          type: "text",
          text: documentation,
        },
      ],
    };
  }

  if (request.params.name === "validate_xanoscript") {
    const args = request.params.arguments as {
      code: string;
    };

    if (!args?.code) {
      return {
        content: [
          {
            type: "text",
            text: "Error: 'code' parameter is required",
          },
        ],
        isError: true,
      };
    }

    try {
      const text = args.code;
      const scheme = getSchemeFromContent(text);
      const parser = xanoscriptParser(text, scheme);

      if (parser.errors.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "XanoScript is valid. No syntax errors found.",
            },
          ],
        };
      }

      const diagnostics = parser.errors.map((error) => {
        const startOffset = error.token?.startOffset ?? 0;
        const endOffset = error.token?.endOffset ?? 5;

        const lines = text.substring(0, startOffset).split("\n");
        const line = lines.length - 1;
        const character = lines[lines.length - 1].length;

        const endLines = text.substring(0, endOffset + 1).split("\n");
        const endLine = endLines.length - 1;
        const endCharacter = endLines[endLines.length - 1].length;

        return {
          range: {
            start: { line, character },
            end: { line: endLine, character: endCharacter },
          },
          message: error.message,
          source: error.name || "XanoScript Parser",
        };
      });

      const errorMessages = diagnostics.map((d, i) => {
        const location = `Line ${d.range.start.line + 1}, Column ${d.range.start.character + 1}`;
        return `${i + 1}. [${location}] ${d.message}`;
      });

      return {
        content: [
          {
            type: "text",
            text: `Found ${diagnostics.length} error(s):\n\n${errorMessages.join("\n")}`,
          },
        ],
        isError: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Validation error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === "xanoscript_docs") {
    const args = request.params.arguments as
      | {
          topic?: string;
          file_path?: string;
          mode?: "full" | "quick_reference";
        }
      | undefined;

    const documentation = readXanoscriptDocsV2(args);

    return {
      content: [
        {
          type: "text",
          text: documentation,
        },
      ],
    };
  }

  if (request.params.name === "mcp_version") {
    return {
      content: [
        {
          type: "text",
          text: SERVER_VERSION,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${request.params.name}`,
      },
    ],
    isError: true,
  };
});

// =============================================================================
// Start Server
// =============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Xano Developer MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
