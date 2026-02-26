#!/usr/bin/env node

/**
 * Xano Developer MCP Server
 *
 * This is the MCP server entry point. For library usage, import from the package root:
 * ```ts
 * import { validateXanoscript, xanoscriptDocs } from '@xano/developer-mcp';
 * ```
 */

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

import { XANOSCRIPT_DOCS_V2, getXanoscriptDocsVersion } from "./xanoscript.js";
import {
  toolDefinitions,
  handleTool,
  toMcpResponse,
  getXanoscriptDocsPath,
} from "./tools/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
const SERVER_VERSION: string = pkg.version;

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(SERVER_VERSION);
  process.exit(0);
}

// =============================================================================
// Path Resolution (uses shared path from tools/xanoscript_docs.ts)
// =============================================================================

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
  return { tools: toolDefinitions };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = handleTool(name, (args as Record<string, unknown>) || {});
  return toMcpResponse(result);
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
