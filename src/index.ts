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
    // The SDK validates args against `inputShape` before invoking; handleTool
    // re-parses defensively so it's also safe to call from library code.
    // Any thrown error is converted into a structured ToolResult so the client
    // sees a useful message instead of a transport-level failure.
    async (args: Record<string, unknown> | undefined) => {
      try {
        const result = await handleTool(spec.name, args ?? {});
        return toMcpResponse(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[${spec.name}] handler threw:`, error);
        return toMcpResponse({
          success: false,
          error: `Internal error in ${spec.name}: ${message}`,
        });
      }
    }
  );
}

// =============================================================================
// Resource Registration (XanoScript docs as MCP resources)
// =============================================================================

for (const [key, config] of Object.entries(XANOSCRIPT_DOCS_V2)) {
  const resourceUri = `xanoscript://docs/${key}`;
  server.registerResource(
    key,
    resourceUri,
    {
      description: config.description,
      mimeType: "text/markdown",
    },
    async (uri) => {
      try {
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
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `[resource ${key}] Failed to read ${config.file} from ${XANOSCRIPT_DOCS_PATH}:`,
          error
        );
        throw new Error(
          `Failed to read XanoScript docs resource "${key}" (${uri.href}) ` +
            `from ${join(XANOSCRIPT_DOCS_PATH, config.file)}: ${message}`
        );
      }
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
