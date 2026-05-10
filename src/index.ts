#!/usr/bin/env node

/**
 * Xano Developer MCP Server
 *
 * This is the MCP server entry point. For library usage, import from the package root:
 * ```ts
 * import { validateXanoscript, xanoscriptDocs } from '@xano/developer-mcp';
 * ```
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { XANOSCRIPT_DOCS_V2, getXanoscriptDocsVersion } from "./xanoscript.js";
import {
  toolSpecs,
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

const XANOSCRIPT_DOCS_PATH = getXanoscriptDocsPath();

// =============================================================================
// MCP Server Setup
// =============================================================================

const server = new McpServer({
  name: "xano-developer-mcp",
  version: SERVER_VERSION,
});

// =============================================================================
// Tool Registration
// =============================================================================

for (const spec of Object.values(toolSpecs)) {
  server.registerTool(
    spec.name,
    {
      description: spec.description,
      annotations: spec.annotations,
      inputSchema: spec.inputShape,
      outputSchema: spec.outputShape,
    },
    // The SDK has already parsed/validated args against inputShape, but handleTool
    // re-parses defensively so it can be used directly from library code too.
    async (args: Record<string, unknown> | undefined) => {
      const result = await handleTool(spec.name, args ?? {});
      return toMcpResponse(result);
    }
  );
}

// =============================================================================
// Resource Registration (XanoScript docs as MCP resources)
// =============================================================================

for (const [key, config] of Object.entries(XANOSCRIPT_DOCS_V2)) {
  server.registerResource(
    key,
    `xanoscript://docs/${key}`,
    {
      description: config.description,
      mimeType: "text/markdown",
    },
    async (uri) => {
      const content = readFileSync(join(XANOSCRIPT_DOCS_PATH, config.file), "utf-8");
      const version = getXanoscriptDocsVersion(XANOSCRIPT_DOCS_PATH);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: `${content}\n\n---\nDocumentation version: ${version}`,
          },
        ],
      };
    }
  );
}

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
