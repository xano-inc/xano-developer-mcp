import { describe, it, expect } from "vitest";
import { formatDocumentation } from "./format.js";
import type { TopicDoc } from "../meta_api_docs/types.js";

describe("run_api_docs/format", () => {
  describe("formatDocumentation", () => {
    const minimalDoc: TopicDoc = {
      topic: "test",
      title: "Test Topic",
      description: "A test topic description",
    };

    it("should use Run API config by default", () => {
      const docWithEndpoints: TopicDoc = {
        ...minimalDoc,
        endpoints: [
          {
            method: "GET",
            path: "/test",
            description: "Test endpoint",
          },
        ],
      };
      const result = formatDocumentation(docWithEndpoints);
      expect(result).toContain("https://app.dev.xano.com/api:run/");
      expect(result).toContain("NOT your Xano instance URL");
    });

    it("should format documentation with title", () => {
      const result = formatDocumentation(minimalDoc);
      expect(result).toContain("# Test Topic");
    });

    it("should format documentation with description", () => {
      const result = formatDocumentation(minimalDoc);
      expect(result).toContain("A test topic description");
    });

    it("should respect detail level", () => {
      const docWithExamples: TopicDoc = {
        ...minimalDoc,
        examples: [
          {
            title: "Example",
            description: "Test",
            request: { method: "GET", path: "/test" },
          },
        ],
      };

      const overviewResult = formatDocumentation(docWithExamples, "overview");
      expect(overviewResult).not.toContain("## Examples");

      const detailedResult = formatDocumentation(docWithExamples, "detailed");
      expect(detailedResult).toContain("## Examples");
    });

    it("should use run_api_docs in related topics", () => {
      const docWithRelated: TopicDoc = {
        ...minimalDoc,
        related_topics: ["session", "history"],
      };
      const result = formatDocumentation(docWithRelated);
      expect(result).toContain("run_api_docs");
      expect(result).toContain("session, history");
    });

    it("should default to detailed level", () => {
      const docWithEndpoints: TopicDoc = {
        ...minimalDoc,
        endpoints: [
          {
            method: "GET",
            path: "/test",
            description: "Test",
            parameters: [
              { name: "id", type: "string", description: "ID" },
            ],
          },
        ],
      };
      const result = formatDocumentation(docWithEndpoints);
      expect(result).toContain("**Parameters:**");
    });

    it("should default to including schemas", () => {
      const docWithSchemas: TopicDoc = {
        ...minimalDoc,
        schemas: {
          TestSchema: { type: "object" },
        },
      };
      const result = formatDocumentation(docWithSchemas);
      expect(result).toContain("## Schemas");
    });
  });
});
