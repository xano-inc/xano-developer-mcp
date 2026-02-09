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
import { xanoscriptParser } from "@xano/xanoscript-language-server/parser/parser.js";
import { getSchemeFromContent } from "@xano/xanoscript-language-server/utils.js";
import { metaApiDocsToolDefinition, handleMetaApiDocs } from "./meta_api_docs/index.js";
import { runApiDocsToolDefinition, handleRunApiDocs } from "./run_api_docs/index.js";
import { cliDocsToolDefinition, handleCliDocs } from "./cli_docs/index.js";
import type { MetaApiDocsArgs } from "./meta_api_docs/types.js";
import type { CliDocsArgs } from "./cli_docs/types.js";
import {
  XANOSCRIPT_DOCS_V2,
  readXanoscriptDocsV2,
  getXanoscriptDocsVersion,
  getTopicDescriptions,
} from "./xanoscript.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
const SERVER_VERSION: string = pkg.version;

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(SERVER_VERSION);
  process.exit(0);
}

// =============================================================================
// Path Resolution
// =============================================================================

function getXanoscriptDocsPath(): string {
  const possiblePaths = [
    join(__dirname, "xanoscript_docs"),           // dist/xanoscript_docs (production)
    join(__dirname, "..", "src", "xanoscript_docs"), // src/xanoscript_docs (dev before build)
  ];

  for (const p of possiblePaths) {
    try {
      readFileSync(join(p, "version.json"));
      return p;
    } catch {
      continue;
    }
  }

  return join(__dirname, "xanoscript_docs");
}

const XANOSCRIPT_DOCS_PATH = getXanoscriptDocsPath();

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
  const version = getXanoscriptDocsVersion(XANOSCRIPT_DOCS_PATH);

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
              description: "Documentation topic. Available: " + getTopicDescriptions(),
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
      metaApiDocsToolDefinition,
      runApiDocsToolDefinition,
      cliDocsToolDefinition,
    ],
  };
});

interface ParserDiagnostic {
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  message: string;
  source: string;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
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

      const diagnostics: ParserDiagnostic[] = parser.errors.map((error: { token?: { startOffset: number; endOffset: number }; message: string; name?: string }) => {
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

      const errorMessages = diagnostics.map((d: ParserDiagnostic, i: number) => {
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
    } catch (error: unknown) {
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

    const documentation = readXanoscriptDocsV2(XANOSCRIPT_DOCS_PATH, args);

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

  if (request.params.name === "meta_api_docs") {
    const args = request.params.arguments as {
      topic?: string;
      detail_level?: string;
      include_schemas?: boolean;
    } | undefined;

    if (!args?.topic) {
      return {
        content: [
          {
            type: "text",
            text: "Error: 'topic' parameter is required. Use meta_api_docs with topic='start' for overview.",
          },
        ],
        isError: true,
      };
    }

    try {
      const documentation = handleMetaApiDocs({
        topic: args.topic,
        detail_level: args.detail_level as MetaApiDocsArgs["detail_level"],
        include_schemas: args.include_schemas,
      });
      return {
        content: [
          {
            type: "text",
            text: documentation,
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving API documentation: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === "run_api_docs") {
    const args = request.params.arguments as {
      topic?: string;
      detail_level?: string;
      include_schemas?: boolean;
    } | undefined;

    if (!args?.topic) {
      return {
        content: [
          {
            type: "text",
            text: "Error: 'topic' parameter is required. Use run_api_docs with topic='start' for overview.",
          },
        ],
        isError: true,
      };
    }

    try {
      const documentation = handleRunApiDocs(
        args.topic,
        args.detail_level,
        args.include_schemas
      );
      return {
        content: [
          {
            type: "text",
            text: documentation,
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving Run API documentation: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === "cli_docs") {
    const args = request.params.arguments as {
      topic?: string;
      detail_level?: string;
    } | undefined;

    if (!args?.topic) {
      return {
        content: [
          {
            type: "text",
            text: "Error: 'topic' parameter is required. Use cli_docs with topic='start' for overview.",
          },
        ],
        isError: true,
      };
    }

    try {
      const documentation = handleCliDocs({
        topic: args.topic,
        detail_level: args.detail_level as CliDocsArgs["detail_level"],
      });
      return {
        content: [
          {
            type: "text",
            text: documentation,
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving CLI documentation: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
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
