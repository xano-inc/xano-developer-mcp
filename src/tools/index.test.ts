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
  it("should handle xanoscript_docs tool", () => {
    const result = handleTool("xanoscript_docs", {});
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should handle xanoscript_docs with topic arg", () => {
    const result = handleTool("xanoscript_docs", { topic: "syntax" });
    expect(result.success).toBe(true);
    expect(typeof result.data).toBe("string");
    expect(result.data).toContain("Documentation version:");
  });

  it("should handle xanoscript_docs with file_path and return multi-content", () => {
    const result = handleTool("xanoscript_docs", { file_path: "apis/users/create.xs" });
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    const data = result.data as string[];
    expect(data.length).toBeGreaterThan(1);
    expect(data[0]).toContain("Matched topics:");
  });

  it("should handle validate_xanoscript tool and return a ToolResult", () => {
    const result = handleTool("validate_xanoscript", { code: "var $x:int = 1" });
    expect(result).toHaveProperty("success");
    expect(typeof result.success).toBe("boolean");
    // Either data or error should be present
    expect(result.data ?? result.error).toBeDefined();
  });

  it("should handle validate_xanoscript with missing input", () => {
    const result = handleTool("validate_xanoscript", {});
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle mcp_version tool", () => {
    const result = handleTool("mcp_version", {});
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should handle meta_api_docs tool with topic", () => {
    const result = handleTool("meta_api_docs", { topic: "start" });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should handle meta_api_docs tool without topic", () => {
    const result = handleTool("meta_api_docs", {});
    expect(result.success).toBe(false);
    expect(result.error).toContain("topic");
  });

  it("should handle cli_docs tool with topic", () => {
    const result = handleTool("cli_docs", { topic: "start" });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should handle cli_docs tool without topic", () => {
    const result = handleTool("cli_docs", {});
    expect(result.success).toBe(false);
    expect(result.error).toContain("topic");
  });

  it("should return error for unknown tool", () => {
    const result = handleTool("nonexistent_tool", {});
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown tool: nonexistent_tool");
  });

  it("should return validation error for wrong argument types", () => {
    const result = handleTool("xanoscript_docs", { mode: 123 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid arguments");
  });

  it("should return validation error for invalid enum value", () => {
    const result = handleTool("xanoscript_docs", { mode: "invalid_mode" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid arguments");
  });

  it("should return validation error when meta_api_docs topic is wrong type", () => {
    const result = handleTool("meta_api_docs", { topic: 123 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid arguments");
  });
});

describe("toMcpResponse", () => {
  it("should convert success result to MCP response", () => {
    const response = toMcpResponse({ success: true, data: "test data" });
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe("text");
    expect(response.content[0].text).toBe("test data");
    expect(response.isError).toBeUndefined();
  });

  it("should convert error result to MCP response with isError", () => {
    const response = toMcpResponse({ success: false, error: "test error" });
    expect(response.content).toHaveLength(1);
    expect(response.content[0].text).toBe("test error");
    expect(response.isError).toBe(true);
  });

  it("should convert string array data to multiple content blocks", () => {
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

  it("should handle single-element array data", () => {
    const response = toMcpResponse({ success: true, data: ["only block"] });
    expect(response.content).toHaveLength(1);
    expect(response.content[0].text).toBe("only block");
  });

  it("should include structuredContent when provided", () => {
    const response = toMcpResponse({
      success: true,
      data: "test",
      structuredContent: { version: "1.0.0" },
    });
    expect(response.structuredContent).toEqual({ version: "1.0.0" });
    expect(response.isError).toBeUndefined();
  });

  it("should omit structuredContent when not provided", () => {
    const response = toMcpResponse({ success: true, data: "test" });
    expect(response.structuredContent).toBeUndefined();
  });

  it("should not include structuredContent on error", () => {
    const response = toMcpResponse({ success: false, error: "fail" });
    expect(response.structuredContent).toBeUndefined();
    expect(response.isError).toBe(true);
  });
});

describe("toolDefinitions", () => {
  it("should contain all 5 tools", () => {
    expect(toolDefinitions).toHaveLength(5);
  });

  it("should have unique tool names", () => {
    const names = toolDefinitions.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("should include expected tool names", () => {
    const names = toolDefinitions.map((t) => t.name);
    expect(names).toContain("validate_xanoscript");
    expect(names).toContain("xanoscript_docs");
    expect(names).toContain("mcp_version");
    expect(names).toContain("meta_api_docs");
    expect(names).toContain("cli_docs");
  });

  it("should have annotations on all tools", () => {
    for (const tool of toolDefinitions) {
      expect(tool).toHaveProperty("annotations");
      expect(tool.annotations).toHaveProperty("readOnlyHint");
      expect(tool.annotations).toHaveProperty("destructiveHint", false);
    }
  });

  it("should have outputSchema on all tools", () => {
    for (const tool of toolDefinitions) {
      expect(tool).toHaveProperty("outputSchema");
      expect((tool as Record<string, unknown>).outputSchema).toHaveProperty("type", "object");
      expect((tool as Record<string, unknown>).outputSchema).toHaveProperty("properties");
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
