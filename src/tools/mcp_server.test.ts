import { describe, it, expect, beforeAll } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { toolSpecs, handleTool, toMcpResponse } from "./index.js";
import { setXanoscriptDocsPath } from "./xanoscript_docs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_PATH = join(__dirname, "..", "xanoscript_docs");

beforeAll(() => {
  setXanoscriptDocsPath(DOCS_PATH);
});

/**
 * Smoke test: register every tool with `McpServer.registerTool` (the real
 * registration path from src/index.ts) and verify a `Client.listTools()`
 * round-trip surfaces each tool with its derived schema. Catches:
 *  - registerTool throwing on a malformed inputShape/outputShape
 *  - SDK rejecting a JSON schema we emit
 *  - tool names drifting between toolSpecs and what's advertised
 */
async function buildLinkedClient() {
  const server = new McpServer({
    name: "xano-developer-mcp-test",
    version: "0.0.0-test",
  });

  for (const spec of Object.values(toolSpecs)) {
    server.registerTool(
      spec.name,
      {
        description: spec.description,
        annotations: spec.annotations,
        inputSchema: spec.inputShape,
        outputSchema: spec.outputShape,
      },
      async (args: Record<string, unknown> | undefined) => {
        const result = await handleTool(spec.name, args ?? {});
        return toMcpResponse(result);
      }
    );
  }

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return { server, client };
}

describe("McpServer registration", () => {
  it("advertises every tool in toolSpecs via listTools", async () => {
    const { client } = await buildLinkedClient();
    const { tools } = await client.listTools();
    const advertised = new Set(tools.map((t) => t.name));
    for (const expected of Object.keys(toolSpecs)) {
      expect(advertised.has(expected)).toBe(true);
    }
    await client.close();
  });

  it("advertised tools carry the derived inputSchema", async () => {
    const { client } = await buildLinkedClient();
    const { tools } = await client.listTools();
    const validate = tools.find((t) => t.name === "xano_validate_xanoscript");
    expect(validate).toBeDefined();
    expect(validate?.inputSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        code: expect.any(Object),
        file_path: expect.any(Object),
      }),
    });
    await client.close();
  });

  it("callTool round-trips successfully for xano_version", async () => {
    const { client } = await buildLinkedClient();
    const result = await client.callTool({ name: "xano_version", arguments: {} });
    expect(result.isError).toBeFalsy();
    expect(Array.isArray(result.content)).toBe(true);
    await client.close();
  });

  it("invalid enum produces an isError tool response, not a transport failure", async () => {
    const { client } = await buildLinkedClient();
    const result = (await client.callTool({
      name: "xano_xanoscript_docs",
      arguments: { mode: "not_a_real_mode" },
    })) as { isError?: boolean; content: Array<{ text: string }> };
    expect(result.isError).toBe(true);
    // The error text should at least reference the offending field
    expect(JSON.stringify(result.content)).toContain("mode");
    await client.close();
  });
});
