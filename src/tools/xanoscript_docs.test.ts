import { describe, it, expect, afterEach } from "vitest";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  getXanoscriptDocsPath,
  setXanoscriptDocsPath,
  xanoscriptDocs,
  xanoscriptDocsTool,
} from "./xanoscript_docs.js";
import { validateXanoscript } from "./validate_xanoscript.js";
import { toMcpResponse } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_PATH = join(__dirname, "..", "xanoscript_docs");

afterEach(() => {
  // Reset to default so tests don't interfere with each other
  setXanoscriptDocsPath(DOCS_PATH);
});

describe("getXanoscriptDocsPath", () => {
  it("should return a string path", () => {
    const path = getXanoscriptDocsPath();
    expect(typeof path).toBe("string");
    expect(path.length).toBeGreaterThan(0);
  });

  it("should return a path ending with xanoscript_docs", () => {
    const path = getXanoscriptDocsPath();
    expect(path).toMatch(/xanoscript_docs$/);
  });

  it("should return a consistent path on repeated calls", () => {
    const path1 = getXanoscriptDocsPath();
    const path2 = getXanoscriptDocsPath();
    expect(path1).toBe(path2);
  });
});

describe("setXanoscriptDocsPath", () => {
  it("should override the docs path", () => {
    const customPath = "/custom/docs/path";
    setXanoscriptDocsPath(customPath);
    expect(getXanoscriptDocsPath()).toBe(customPath);
  });

  it("should be used by xanoscriptDocs when set", () => {
    setXanoscriptDocsPath(DOCS_PATH);
    const result = xanoscriptDocs();
    expect(result.documentation).toContain("Documentation version:");
  });
});

describe("xanoscriptDocs", () => {
  it("should return README when called with no args", () => {
    const result = xanoscriptDocs();
    expect(result).toHaveProperty("documentation");
    expect(typeof result.documentation).toBe("string");
    expect(result.documentation).toContain("Documentation version:");
  });

  it("should return specific topic documentation", () => {
    const result = xanoscriptDocs({ topic: "syntax" });
    expect(result.documentation).toContain("Documentation version:");
  });

  it("should return topic documentation for aliases", () => {
    const result = xanoscriptDocs({ topic: "auth" });
    expect(result.documentation).toContain("# Security");
    expect(result.documentation).toContain("Documentation version:");
  });

  it("should include trace-driven API guidance for empty inputs and blank PATCH fields", () => {
    const result = xanoscriptDocs({ topic: "apis" });
    expect(result.documentation).toContain("Every `query` must include `input`, `stack`, and `response`");
    expect(result.documentation).toContain('blank text should mean "leave the existing value unchanged"');
  });

  it("should not teach invalid expression filters or guessed async primitives", () => {
    const syntax = xanoscriptDocs({ topic: "syntax" }).documentation;
    const working = xanoscriptDocs({ topic: "working" }).documentation;
    const functions = xanoscriptDocs({ topic: "functions" }).documentation;

    expect(syntax).toContain('$ts|format_timestamp:"N":"UTC"');
    expect(syntax).toContain('$db.product.name includes "phone"');
    expect(syntax).not.toContain('$db.title\\|includes:"tutorial"');
    expect(syntax).not.toContain('$ts|timestamp_day_of_week    // Day');

    expect(working).toContain("Do not invent background job invocation syntax");
    expect(working).not.toContain('run.job "my_job" { stack');
    expect(functions).toContain("Do not add `async = true`");
    expect(functions).not.toContain("await $request as $result");
  });

  it("should steer invalid bulk operation guesses to validated loop fallbacks", () => {
    const database = xanoscriptDocs({ topic: "database" }).documentation;
    const performance = xanoscriptDocs({ topic: "performance" }).documentation;

    expect(database).toContain("Bulk operation syntax is version-sensitive");
    expect(database).toContain("db.add \"product\"");
    expect(database).not.toContain('db.bulk.add "product" {\n  data = [');
    expect(performance).toContain("explicit batch write loops");
    expect(performance).not.toContain("db.add_bulk");
  });

  it("should keep trace-critical docs snippets valid against the parser", () => {
    const snippets = [
      `function "docs/date_parts" {
  input {}
  stack {
    var $ts { value = "now"|to_timestamp }
    var $dow { value = $ts|format_timestamp:"N":"UTC" }
  }
  response = $dow
}`,
      `function "docs/db_where_ops" {
  input {
    text query?
  }
  stack {
    db.query "product" {
      where = $db.product.name includes $input.query && $db.product.tags contains "featured" && $db.product.tags overlaps ["a","b"] && $db.product.price|between:10:100
      return = {type: "list"}
    } as $products
  }
  response = $products
}`,
      `function "docs/batch_insert_loop" {
  input {
    json[] items
  }
  stack {
    foreach ($input.items) {
      each as $item {
        db.add "product" {
          data = {
            name: $item.name,
            price: $item.price,
            sku: $item.sku
          }
        } as $created
      }
    }
  }
  response = true
}`,
      `function "docs/function_run_sync" {
  input {
    int order_id
  }
  stack {
    function.run "process_order" {
      input = { order_id: $input.order_id }
    } as $result
  }
  response = $result
}`,
    ];

    for (const snippet of snippets) {
      const result = validateXanoscript({ code: snippet });
      expect(result.valid, result.message).toBe(true);
      if ("errors" in result) {
        expect(result.errors, result.message).toHaveLength(0);
      }
    }
  });

  it("should return context-aware docs for file_path", () => {
    const result = xanoscriptDocs({ file_path: "api/users/create.xs" });
    expect(result.documentation).toContain("XanoScript Documentation for:");
    expect(result.documentation).toContain("Matched topics:");
  });

  it("should support quick_reference mode", () => {
    const full = xanoscriptDocs({ topic: "syntax", mode: "full" });
    const quick = xanoscriptDocs({ topic: "syntax", mode: "quick_reference" });
    expect(quick.documentation.length).toBeLessThanOrEqual(full.documentation.length);
  });

  it("should throw for unknown topic", () => {
    expect(() => xanoscriptDocs({ topic: "nonexistent" })).toThrow(
      'Unknown topic "nonexistent"'
    );
  });

  it("should throw for invalid docs path", () => {
    setXanoscriptDocsPath("/nonexistent/path");
    expect(() => xanoscriptDocs({ topic: "syntax" })).toThrow();
  });
});

describe("xanoscriptDocsTool", () => {
  it("should return success with data for valid call", () => {
    const result = xanoscriptDocsTool();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(typeof result.data).toBe("string");
    expect(result.error).toBeUndefined();
  });

  it("should return success with topic docs", () => {
    const result = xanoscriptDocsTool({ topic: "syntax" });
    expect(result.success).toBe(true);
    expect(result.data).toContain("Documentation version:");
  });

  it("should return success with alias topic docs", () => {
    const result = xanoscriptDocsTool({ topic: "comments" });
    expect(result.success).toBe(true);
    expect(result.data).toContain("Documentation version:");
  });

  it("should return error for unknown topic", () => {
    const result = xanoscriptDocsTool({ topic: "nonexistent" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("Unknown topic");
  });

  it("should return error for invalid docs path", () => {
    setXanoscriptDocsPath("/nonexistent/path");
    const result = xanoscriptDocsTool({ topic: "syntax" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("Error retrieving XanoScript documentation");
  });

  it("should return multi-content array for file_path mode", () => {
    const result = xanoscriptDocsTool({ file_path: "api/users/create.xs" });
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    const data = result.data as string[];
    // First element is the header
    expect(data[0]).toContain("XanoScript Documentation for: api/users/create.xs");
    expect(data[0]).toContain("Matched topics:");
    expect(data[0]).toContain("Version:");
    // Remaining elements are per-topic content
    expect(data.length).toBeGreaterThan(1);
  });

  it("should return single string for topic mode", () => {
    const result = xanoscriptDocsTool({ topic: "syntax" });
    expect(result.success).toBe(true);
    expect(typeof result.data).toBe("string");
    expect(Array.isArray(result.data)).toBe(false);
  });

  it("should return single string for no-args mode", () => {
    const result = xanoscriptDocsTool();
    expect(result.success).toBe(true);
    expect(typeof result.data).toBe("string");
    expect(Array.isArray(result.data)).toBe(false);
  });

  it("should produce multiple MCP content blocks for file_path via toMcpResponse", () => {
    const result = xanoscriptDocsTool({ file_path: "api/users/create.xs" });
    const mcpResponse = toMcpResponse(result);
    expect(mcpResponse.isError).toBeUndefined();
    // Should have multiple content blocks (header + N topics)
    expect(mcpResponse.content.length).toBeGreaterThan(1);
    // All blocks should be text type
    for (const block of mcpResponse.content) {
      expect(block.type).toBe("text");
      expect(typeof block.text).toBe("string");
    }
  });

  it("should produce single MCP content block for topic mode via toMcpResponse", () => {
    const result = xanoscriptDocsTool({ topic: "syntax" });
    const mcpResponse = toMcpResponse(result);
    expect(mcpResponse.content).toHaveLength(1);
    expect(mcpResponse.content[0].type).toBe("text");
  });

  it("should include structuredContent for file_path mode", () => {
    const result = xanoscriptDocsTool({ file_path: "api/users/create.xs" });
    expect(result.success).toBe(true);
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent).toHaveProperty("file_path", "api/users/create.xs");
    expect(result.structuredContent).toHaveProperty("mode", "quick_reference");
    expect(result.structuredContent).toHaveProperty("version");
    expect(result.structuredContent).toHaveProperty("topics");
    expect(Array.isArray(result.structuredContent!.topics)).toBe(true);
  });

  it("should include structuredContent for topic mode", () => {
    const result = xanoscriptDocsTool({ topic: "syntax" });
    expect(result.success).toBe(true);
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent).toHaveProperty("documentation");
  });

  it("should include structuredContent in MCP response", () => {
    const result = xanoscriptDocsTool({ file_path: "api/users/create.xs" });
    const mcpResponse = toMcpResponse(result);
    expect(mcpResponse.structuredContent).toBeDefined();
    expect(mcpResponse.structuredContent).toHaveProperty("file_path");
    expect(mcpResponse.structuredContent).toHaveProperty("topics");
  });
});

describe("xanoscriptDocs structured output", () => {
  it("should include topics array for file_path mode", () => {
    const result = xanoscriptDocs({ file_path: "api/users/create.xs" });
    expect(result.topics).toBeDefined();
    expect(Array.isArray(result.topics)).toBe(true);
    expect(result.topics!.length).toBeGreaterThan(0);
  });

  it("should have topic and content fields in each TopicDoc", () => {
    const result = xanoscriptDocs({ file_path: "api/users/create.xs" });
    for (const doc of result.topics!) {
      expect(doc).toHaveProperty("topic");
      expect(doc).toHaveProperty("content");
      expect(typeof doc.topic).toBe("string");
      expect(typeof doc.content).toBe("string");
      expect(doc.content.length).toBeGreaterThan(0);
    }
  });

  it("should not include topics array for topic mode", () => {
    const result = xanoscriptDocs({ topic: "syntax" });
    expect(result.topics).toBeUndefined();
  });

  it("should not include topics array for no-args mode", () => {
    const result = xanoscriptDocs();
    expect(result.topics).toBeUndefined();
  });

  it("should respect exclude_topics in structured output", () => {
    const result = xanoscriptDocs({
      file_path: "api/users/create.xs",
      exclude_topics: ["syntax", "essentials"],
    });
    expect(result.topics).toBeDefined();
    const topicNames = result.topics!.map((d) => d.topic);
    expect(topicNames).not.toContain("syntax");
    expect(topicNames).not.toContain("essentials");
  });
});
