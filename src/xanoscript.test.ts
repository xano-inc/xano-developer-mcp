import { describe, it, expect, beforeAll } from "vitest";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  XANOSCRIPT_DOCS_V2,
  getDocsForFilePath,
  extractQuickReference,
  getXanoscriptDocsVersion,
  readXanoscriptDocsV2,
  getTopicNames,
  getTopicDescriptions,
} from "./xanoscript.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_PATH = join(__dirname, "xanoscript_docs");

describe("xanoscript module", () => {
  describe("XANOSCRIPT_DOCS_V2", () => {
    it("should have all expected topics", () => {
      const expectedTopics = [
        "readme",
        "cheatsheet",
        "syntax",
        "quickstart",
        "types",
        "tables",
        "functions",
        "apis",
        "tasks",
        "triggers",
        "database",
        "agents",
        "tools",
        "mcp-servers",
        "testing",
        "integrations",
        "integrations/cloud-storage",
        "integrations/search",
        "integrations/redis",
        "integrations/external-apis",
        "integrations/utilities",
        "frontend",
        "run",
        "addons",
        "debugging",
        "performance",
        "realtime",
        "schema",
        "security",
        "streaming",
        "middleware",
        "branch",
        "workspace",
      ];

      expect(Object.keys(XANOSCRIPT_DOCS_V2)).toEqual(expectedTopics);
    });

    it("should have valid DocConfig structure for each topic", () => {
      for (const [key, config] of Object.entries(XANOSCRIPT_DOCS_V2)) {
        expect(config).toHaveProperty("file");
        expect(config).toHaveProperty("applyTo");
        expect(config).toHaveProperty("description");
        expect(typeof config.file).toBe("string");
        expect(Array.isArray(config.applyTo)).toBe(true);
        expect(typeof config.description).toBe("string");
        expect(config.file).toMatch(/\.md$/);
      }
    });
  });

  describe("getDocsForFilePath", () => {
    it("should always include syntax for .xs files", () => {
      const result = getDocsForFilePath("test.xs");
      expect(result).toContain("syntax");
    });

    it("should match apis files", () => {
      const result = getDocsForFilePath("apis/users/create.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("apis");
      expect(result).toContain("types");
      expect(result).toContain("database");
      expect(result).toContain("testing");
      expect(result).toContain("addons");
    });

    it("should match functions files", () => {
      const result = getDocsForFilePath("functions/utils/format.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("functions");
      expect(result).toContain("types");
      expect(result).toContain("database");
    });

    it("should match tables files", () => {
      const result = getDocsForFilePath("tables/users.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("tables");
    });

    it("should match tasks files", () => {
      const result = getDocsForFilePath("tasks/cleanup.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("tasks");
      expect(result).toContain("database");
      expect(result).toContain("integrations");
    });

    it("should match triggers files", () => {
      const result = getDocsForFilePath("triggers/table/users.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("triggers");
      expect(result).toContain("realtime");
    });

    it("should match agents files", () => {
      const result = getDocsForFilePath("agents/assistant/main.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("agents");
      expect(result).toContain("types");
    });

    it("should match tools files", () => {
      const result = getDocsForFilePath("tools/search/main.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("tools");
      expect(result).toContain("types");
      expect(result).toContain("database");
    });

    it("should match mcp_servers files", () => {
      const result = getDocsForFilePath("mcp_servers/myserver/main.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("mcp-servers");
    });

    it("should match middleware files", () => {
      const result = getDocsForFilePath("middleware/auth/main.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("middleware");
    });

    it("should match branch.xs", () => {
      const result = getDocsForFilePath("branch.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("branch");
    });

    it("should match workspace.xs", () => {
      const result = getDocsForFilePath("workspace.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("workspace");
    });

    it("should match static frontend files", () => {
      const result = getDocsForFilePath("static/index.html");
      expect(result).toContain("frontend");
    });

    it("should match run files", () => {
      const result = getDocsForFilePath("run/job/main.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("run");
    });

    it("should not include readme automatically", () => {
      const result = getDocsForFilePath("apis/test.xs");
      expect(result).not.toContain("readme");
    });

    it("should include syntax and quickstart for .xs files", () => {
      const result = getDocsForFilePath("some/random/file.xs");
      expect(result).toContain("syntax");
      expect(result).toContain("quickstart");
    });
  });

  describe("extractQuickReference", () => {
    it("should extract Quick Reference section when present", () => {
      const content = `# Title

Some intro text.

## Quick Reference

Quick reference content here.

More quick reference.

## Next Section

Other content.
`;
      const result = extractQuickReference(content, "test");
      expect(result).toContain("# test");
      expect(result).toContain("## Quick Reference");
      expect(result).toContain("Quick reference content here.");
      expect(result).not.toContain("## Next Section");
      expect(result).not.toContain("Other content.");
    });

    it("should return fallback when no Quick Reference section", () => {
      const content = `# Title

Some intro text.

## First Section

Section content.

## Second Section

More content.
`;
      const result = extractQuickReference(content, "test");
      expect(result).toContain("# Title");
      expect(result).toContain("Some intro text.");
      expect(result).not.toContain("## First Section");
    });

    it("should return up to 50 lines if no sections found", () => {
      const lines = Array(100).fill("Line content").join("\n");
      const result = extractQuickReference(lines, "test");
      const resultLines = result.split("\n");
      expect(resultLines.length).toBeLessThanOrEqual(50);
    });

    it("should include Quick Reference to end if no following section", () => {
      const content = `# Title

## Quick Reference

Quick reference content.
More content.
Even more content.
`;
      const result = extractQuickReference(content, "test");
      expect(result).toContain("Quick reference content.");
      expect(result).toContain("More content.");
      expect(result).toContain("Even more content.");
    });
  });

  describe("getXanoscriptDocsVersion", () => {
    it("should return version from valid docs path", () => {
      const version = getXanoscriptDocsVersion(DOCS_PATH);
      expect(typeof version).toBe("string");
      // Version should be a semver-like string or "unknown"
      expect(version).toMatch(/^(\d+\.\d+\.\d+|unknown)$/);
    });

    it("should return unknown for invalid path", () => {
      const version = getXanoscriptDocsVersion("/nonexistent/path");
      expect(version).toBe("unknown");
    });
  });

  describe("readXanoscriptDocsV2", () => {
    it("should return README when no args provided", () => {
      const result = readXanoscriptDocsV2(DOCS_PATH);
      expect(result).toContain("Documentation version:");
    });

    it("should return README when empty args provided", () => {
      const result = readXanoscriptDocsV2(DOCS_PATH, {});
      expect(result).toContain("Documentation version:");
    });

    it("should return specific topic documentation", () => {
      const result = readXanoscriptDocsV2(DOCS_PATH, { topic: "syntax" });
      expect(result).toContain("Documentation version:");
    });

    it("should return error for unknown topic", () => {
      const result = readXanoscriptDocsV2(DOCS_PATH, { topic: "nonexistent" });
      expect(result).toContain('Error: Unknown topic "nonexistent"');
      expect(result).toContain("Available topics:");
    });

    it("should return context-aware docs for file_path", () => {
      const result = readXanoscriptDocsV2(DOCS_PATH, {
        file_path: "apis/users/create.xs",
      });
      expect(result).toContain("XanoScript Documentation for: apis/users/create.xs");
      expect(result).toContain("Matched topics:");
      expect(result).toContain("Version:");
    });

    it("should support quick_reference mode for topic", () => {
      const fullResult = readXanoscriptDocsV2(DOCS_PATH, {
        topic: "syntax",
        mode: "full",
      });
      const quickResult = readXanoscriptDocsV2(DOCS_PATH, {
        topic: "syntax",
        mode: "quick_reference",
      });
      // Quick reference should be shorter
      expect(quickResult.length).toBeLessThanOrEqual(fullResult.length);
    });

    it("should support quick_reference mode for file_path", () => {
      const fullResult = readXanoscriptDocsV2(DOCS_PATH, {
        file_path: "apis/test.xs",
        mode: "full",
      });
      const quickResult = readXanoscriptDocsV2(DOCS_PATH, {
        file_path: "apis/test.xs",
        mode: "quick_reference",
      });
      expect(quickResult).toContain("Mode: quick_reference");
    });

    it("should return error for invalid docs path", () => {
      const result = readXanoscriptDocsV2("/nonexistent/path", {
        topic: "syntax",
      });
      expect(result).toContain("Error reading XanoScript documentation:");
    });
  });

  describe("getTopicNames", () => {
    it("should return all topic names", () => {
      const names = getTopicNames();
      expect(names).toEqual(Object.keys(XANOSCRIPT_DOCS_V2));
    });

    it("should return an array of strings", () => {
      const names = getTopicNames();
      expect(Array.isArray(names)).toBe(true);
      names.forEach((name) => {
        expect(typeof name).toBe("string");
      });
    });
  });

  describe("getTopicDescriptions", () => {
    it("should return formatted descriptions string", () => {
      const descriptions = getTopicDescriptions();
      expect(typeof descriptions).toBe("string");
    });

    it("should include all topics", () => {
      const descriptions = getTopicDescriptions();
      for (const key of Object.keys(XANOSCRIPT_DOCS_V2)) {
        expect(descriptions).toContain(key);
      }
    });

    it("should include topic descriptions", () => {
      const descriptions = getTopicDescriptions();
      expect(descriptions).toContain("XanoScript overview");
      expect(descriptions).toContain("Expressions, operators");
    });
  });
});
