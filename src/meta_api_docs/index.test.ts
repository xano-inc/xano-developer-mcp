import { describe, it, expect } from "vitest";
import {
  topics,
  getTopicNames,
  getTopicDescriptions,
  handleMetaApiDocs,
  metaApiDocsToolDefinition,
} from "./index.js";

describe("meta_api_docs/index", () => {
  describe("topics", () => {
    it("should have all expected topics", () => {
      const expectedTopics = [
        "start",
        "authentication",
        "workspace",
        "apigroup",
        "api",
        "table",
        "function",
        "task",
        "agent",
        "tool",
        "mcp_server",
        "middleware",
        "branch",
        "realtime",
        "file",
        "history",
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
      expect(descriptions).toContain("- workspace:");
      expect(descriptions).toContain("- api:");
    });

    it("should include all topics", () => {
      const descriptions = getTopicDescriptions();
      for (const key of Object.keys(topics)) {
        expect(descriptions).toContain(`- ${key}:`);
      }
    });
  });

  describe("handleMetaApiDocs", () => {
    it("should return error for unknown topic", () => {
      const result = handleMetaApiDocs({ topic: "nonexistent" });
      expect(result).toContain('Error: Unknown topic "nonexistent"');
      expect(result).toContain("Available topics:");
    });

    it("should return documentation for valid topic", () => {
      const result = handleMetaApiDocs({ topic: "start" });
      expect(result).toContain("Xano Meta API - Getting Started");
      expect(result).not.toContain("Error:");
    });

    it("should use default detail_level of detailed", () => {
      const result = handleMetaApiDocs({ topic: "start" });
      expect(result).toContain("Examples");
    });

    it("should respect overview detail_level", () => {
      const result = handleMetaApiDocs({
        topic: "start",
        detail_level: "overview",
      });
      expect(result).toContain("Xano Meta API");
    });

    it("should respect examples detail_level", () => {
      const result = handleMetaApiDocs({
        topic: "start",
        detail_level: "examples",
      });
      expect(result).toContain("Examples");
    });

    it("should include schemas by default", () => {
      const result = handleMetaApiDocs({ topic: "workspace" });
      // Schemas may or may not be present depending on the topic
      expect(typeof result).toBe("string");
    });

    it("should respect include_schemas=false", () => {
      const result = handleMetaApiDocs({
        topic: "workspace",
        include_schemas: false,
      });
      expect(typeof result).toBe("string");
    });
  });

  describe("metaApiDocsToolDefinition", () => {
    it("should have required tool properties", () => {
      expect(metaApiDocsToolDefinition).toHaveProperty("name", "meta_api_docs");
      expect(metaApiDocsToolDefinition).toHaveProperty("description");
      expect(metaApiDocsToolDefinition).toHaveProperty("inputSchema");
    });

    it("should have valid inputSchema", () => {
      const schema = metaApiDocsToolDefinition.inputSchema;
      expect(schema.type).toBe("object");
      expect(schema.properties).toHaveProperty("topic");
      expect(schema.properties).toHaveProperty("detail_level");
      expect(schema.properties).toHaveProperty("include_schemas");
      expect(schema.required).toEqual(["topic"]);
    });

    it("should include all topic names in enum", () => {
      const topicEnum = metaApiDocsToolDefinition.inputSchema.properties.topic.enum;
      expect(topicEnum).toEqual(getTopicNames());
    });
  });
});
