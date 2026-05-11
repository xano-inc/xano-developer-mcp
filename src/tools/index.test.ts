import { describe, it, expect, beforeAll } from "vitest";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import {
  handleTool,
  toMcpResponse,
  toolDefinitions,
} from "./index.js";
import { setXanoscriptDocsPath } from "./xanoscript_docs.js";
import { XANOSCRIPT_DOCS_V2 } from "../xanoscript.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_PATH = join(__dirname, "..", "xanoscript_docs");

beforeAll(() => {
  setXanoscriptDocsPath(DOCS_PATH);
});

describe("handleTool", () => {
  it("should handle xanoscript_docs tool", async () => {
    const result = await handleTool("xano_xanoscript_docs", {});
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should handle xanoscript_docs with topic arg", async () => {
    const result = await handleTool("xano_xanoscript_docs", { topic: "syntax" });
    expect(result.success).toBe(true);
    expect(typeof result.data).toBe("string");
    expect(result.data).toContain("Documentation version:");
  });

  it("should handle xanoscript_docs with file_path and return multi-content", async () => {
    const result = await handleTool("xano_xanoscript_docs", { file_path: "api/users/create.xs" });
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    const data = result.data as string[];
    expect(data.length).toBeGreaterThan(1);
    expect(data[0]).toContain("Matched topics:");
  });

  it("should handle xanoscript_docs with tier (regression: was silently dropped)", async () => {
    const result = await handleTool("xano_xanoscript_docs", { tier: "survival" });
    expect(result.success).toBe(true);
    expect(result.structuredContent).toMatchObject({ tier: "survival" });
  });

  it("should handle validate_xanoscript tool and return a ToolResult", async () => {
    const result = await handleTool("xano_validate_xanoscript", { code: "var $x:int = 1" });
    expect(result).toHaveProperty("success");
    expect(typeof result.success).toBe("boolean");
    expect(result.data ?? result.error).toBeDefined();
  });

  it("should handle validate_xanoscript with missing input", async () => {
    const result = await handleTool("xano_validate_xanoscript", {});
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle mcp_version tool", async () => {
    const result = await handleTool("xano_version", {});
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should handle meta_api_docs tool with topic", async () => {
    const result = await handleTool("xano_meta_api_docs", { topic: "start" });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should handle meta_api_docs tool without topic", async () => {
    const result = await handleTool("xano_meta_api_docs", {});
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle cli_docs tool with topic", async () => {
    const result = await handleTool("xano_cli_docs", { topic: "start" });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should handle cli_docs tool without topic", async () => {
    const result = await handleTool("xano_cli_docs", {});
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should return error for unknown tool", async () => {
    const result = await handleTool("nonexistent_tool", {});
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown tool: nonexistent_tool");
  });

  it("should return validation error for wrong argument types", async () => {
    const result = await handleTool("xano_xanoscript_docs", { mode: 123 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid arguments");
    // Field name should appear so users can see what's wrong
    expect(result.error).toContain("mode");
  });

  it("should return validation error for invalid enum value", async () => {
    const result = await handleTool("xano_xanoscript_docs", { mode: "invalid_mode" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid arguments");
    expect(result.error).toContain("mode");
  });

  it("should return validation error when meta_api_docs topic is wrong type", async () => {
    const result = await handleTool("xano_meta_api_docs", { topic: 123 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid arguments");
    expect(result.error).toContain("topic");
  });
});

describe("validate_xanoscript warnings count", () => {
  it("structuredContent.warnings is included on success", async () => {
    // We don't bake a specific snippet's warning count into the test — the
    // language server's warning rules change. The contract we *do* care about
    // is that `warnings` is present on a successful validation result and is
    // a number >= 0.
    const result = await handleTool("xano_validate_xanoscript", {
      code: "return 1",
    });
    if (result.success) {
      expect(result.structuredContent).toBeDefined();
      const sc = result.structuredContent as { warnings?: number; valid?: boolean };
      expect(sc.valid).toBe(true);
      expect(typeof sc.warnings).toBe("number");
      expect(sc.warnings).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("toMcpResponse", () => {
  it("should convert success result to MCP response", async () => {
    const response = toMcpResponse({ success: true, data: "test data" });
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe("text");
    expect(response.content[0].text).toBe("test data");
    expect(response.isError).toBeUndefined();
  });

  it("should convert error result to MCP response with isError", async () => {
    const response = toMcpResponse({ success: false, error: "test error" });
    expect(response.content).toHaveLength(1);
    expect(response.content[0].text).toBe("test error");
    expect(response.isError).toBe(true);
  });

  it("should convert string array data to multiple content blocks", async () => {
    const response = toMcpResponse({
      success: true,
      data: ["block one", "block two", "block three"],
    });
    expect(response.content).toHaveLength(3);
    expect(response.content[0]).toEqual({ type: "text", text: "block one" });
    expect(response.content[1]).toEqual({ type: "text", text: "block two" });
    expect(response.content[2]).toEqual({ type: "text", text: "block three" });
    expect(response.isError).toBeUndefined();
  });

  it("should handle single-element array data", async () => {
    const response = toMcpResponse({ success: true, data: ["only block"] });
    expect(response.content).toHaveLength(1);
    expect(response.content[0].text).toBe("only block");
  });

  it("should include structuredContent when provided", async () => {
    const response = toMcpResponse({
      success: true,
      data: "test",
      structuredContent: { version: "1.0.0" },
    });
    expect(response.structuredContent).toEqual({ version: "1.0.0" });
    expect(response.isError).toBeUndefined();
  });

  it("should omit structuredContent when not provided", async () => {
    const response = toMcpResponse({ success: true, data: "test" });
    expect(response.structuredContent).toBeUndefined();
  });

  it("should not include structuredContent on error", async () => {
    const response = toMcpResponse({ success: false, error: "fail" });
    expect(response.structuredContent).toBeUndefined();
    expect(response.isError).toBe(true);
  });
});

describe("toolDefinitions", () => {
  it("should contain all 5 tools", async () => {
    expect(toolDefinitions).toHaveLength(5);
  });

  it("should have unique tool names", async () => {
    const names = toolDefinitions.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("should include expected tool names", async () => {
    const names = toolDefinitions.map((t) => t.name);
    expect(names).toContain("xano_validate_xanoscript");
    expect(names).toContain("xano_xanoscript_docs");
    expect(names).toContain("xano_version");
    expect(names).toContain("xano_meta_api_docs");
    expect(names).toContain("xano_cli_docs");
  });

  it("should have annotations on all tools", async () => {
    for (const tool of toolDefinitions) {
      expect(tool).toHaveProperty("annotations");
      expect(tool.annotations).toHaveProperty("readOnlyHint");
      expect(tool.annotations).toHaveProperty("destructiveHint", false);
    }
  });

  it("should have outputSchema on all tools", async () => {
    for (const tool of toolDefinitions) {
      expect(tool).toHaveProperty("outputSchema");
      expect(tool.outputSchema).toHaveProperty("type", "object");
      expect(tool.outputSchema).toHaveProperty("properties");
    }
  });
});

describe("integration: all topic files exist on disk", () => {
  for (const [topic, config] of Object.entries(XANOSCRIPT_DOCS_V2)) {
    it(`topic "${topic}" -> file "${config.file}" should exist`, () => {
      const filePath = join(DOCS_PATH, config.file);
      expect(existsSync(filePath)).toBe(true);
    });
  }
});
