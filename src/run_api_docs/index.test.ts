import { describe, it, expect } from "vitest";
import {
  topics,
  getTopicNames,
  getTopicDescriptions,
  handleRunApiDocs,
  runApiDocsToolDefinition,
} from "./index.js";

describe("run_api_docs/index", () => {
  describe("topics", () => {
    it("should have all expected topics", () => {
      const expectedTopics = [
        "start",
        "run",
        "session",
        "history",
        "data",
        "workflows",
      ];

      expect(Object.keys(topics)).toEqual(expectedTopics);
    });

    it("should have valid TopicDoc structure for each topic", () => {
      for (const [key, doc] of Object.entries(topics)) {
        expect(doc).toHaveProperty("topic");
        expect(doc).toHaveProperty("title");
        expect(doc).toHaveProperty("description");
        expect(typeof doc.topic).toBe("string");
        expect(typeof doc.title).toBe("string");
        expect(typeof doc.description).toBe("string");
        expect(doc.topic).toBe(key);
      }
    });
  });

  describe("getTopicNames", () => {
    it("should return all topic names", () => {
      const names = getTopicNames();
      expect(names).toEqual(Object.keys(topics));
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
    it("should return formatted topic descriptions", () => {
      const descriptions = getTopicDescriptions();
      expect(typeof descriptions).toBe("string");
      expect(descriptions).toContain("- start:");
      expect(descriptions).toContain("- run:");
      expect(descriptions).toContain("- session:");
    });

    it("should include all topics", () => {
      const descriptions = getTopicDescriptions();
      for (const key of Object.keys(topics)) {
        expect(descriptions).toContain(`- ${key}:`);
      }
    });
  });

  describe("handleRunApiDocs", () => {
    it("should return error for undefined topic", () => {
      const result = handleRunApiDocs(undefined);
      expect(result).toContain('Error: Unknown topic "undefined"');
      expect(result).toContain("Available topics:");
    });

    it("should return error for unknown topic", () => {
      const result = handleRunApiDocs("nonexistent");
      expect(result).toContain('Error: Unknown topic "nonexistent"');
      expect(result).toContain("Available topics:");
    });

    it("should return documentation for valid topic", () => {
      const result = handleRunApiDocs("start");
      expect(result).not.toContain("Error:");
    });

    it("should return run documentation", () => {
      const result = handleRunApiDocs("run");
      expect(result).toContain("Run Execution");
      expect(result).toContain("/run/exec");
    });

    it("should return session documentation", () => {
      const result = handleRunApiDocs("session");
      expect(result).toContain("Session");
    });

    it("should use default detail_level of detailed", () => {
      const result = handleRunApiDocs("run");
      expect(result).toContain("**Parameters:**");
    });

    it("should respect overview detail_level", () => {
      const result = handleRunApiDocs("run", "overview");
      expect(result).toContain("Run Execution");
    });

    it("should respect examples detail_level", () => {
      const result = handleRunApiDocs("run", "examples");
      expect(result).toContain("**Example:**");
    });

    it("should include schemas by default", () => {
      const result = handleRunApiDocs("run");
      expect(result).toContain("## Schemas");
    });

    it("should exclude schemas when includeSchemas is false", () => {
      const result = handleRunApiDocs("run", "detailed", false);
      expect(result).not.toContain("## Schemas");
    });

    it("should use Run API base URL", () => {
      const result = handleRunApiDocs("run");
      expect(result).toContain("https://app.dev.xano.com/api:run/");
    });
  });

  describe("runApiDocsToolDefinition", () => {
    it("should have required tool properties", () => {
      expect(runApiDocsToolDefinition).toHaveProperty("name", "run_api_docs");
      expect(runApiDocsToolDefinition).toHaveProperty("description");
      expect(runApiDocsToolDefinition).toHaveProperty("inputSchema");
    });

    it("should mention fixed base URL in description", () => {
      expect(runApiDocsToolDefinition.description).toContain(
        "https://app.dev.xano.com/api:run/"
      );
    });

    it("should have valid inputSchema", () => {
      const schema = runApiDocsToolDefinition.inputSchema;
      expect(schema.type).toBe("object");
      expect(schema.properties).toHaveProperty("topic");
      expect(schema.properties).toHaveProperty("detail_level");
      expect(schema.properties).toHaveProperty("include_schemas");
      expect(schema.required).toEqual(["topic"]);
    });

    it("should include all topic names in enum", () => {
      const topicEnum = runApiDocsToolDefinition.inputSchema.properties.topic.enum;
      expect(topicEnum).toEqual(getTopicNames());
    });
  });
});
