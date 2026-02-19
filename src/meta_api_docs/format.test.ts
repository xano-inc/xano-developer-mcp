import { describe, it, expect } from "vitest";
import {
  formatDocumentation,
  META_API_CONFIG,
} from "./format.js";
import type { TopicDoc, EndpointDoc, ExampleDoc, PatternDoc } from "./types.js";

describe("meta_api_docs/format", () => {
  describe("META_API_CONFIG", () => {
    it("should have correct base URL info", () => {
      expect(META_API_CONFIG.baseUrlInfo).toContain(
        "https://<your-instance-subdomain>.xano.io/api:meta/"
      );
      expect(META_API_CONFIG.toolName).toBe("meta_api_docs");
    });
  });

  describe("formatDocumentation", () => {
    const minimalDoc: TopicDoc = {
      topic: "test",
      title: "Test Topic",
      description: "A test topic description",
    };

    it("should format minimal documentation", () => {
      const result = formatDocumentation(minimalDoc);
      expect(result).toContain("# Test Topic");
      expect(result).toContain("A test topic description");
    });

    it("should include AI hints when present", () => {
      const docWithHints: TopicDoc = {
        ...minimalDoc,
        ai_hints: "Use this for testing purposes",
      };
      const result = formatDocumentation(docWithHints);
      expect(result).toContain("## AI Usage Hints");
      expect(result).toContain("Use this for testing purposes");
    });

    it("should format endpoints correctly", () => {
      const docWithEndpoints: TopicDoc = {
        ...minimalDoc,
        endpoints: [
          {
            method: "GET",
            path: "/test",
            description: "Get test data",
          },
          {
            method: "POST",
            path: "/test",
            description: "Create test data",
            tool_name: "create_test",
          },
        ],
      };
      const result = formatDocumentation(docWithEndpoints);
      expect(result).toContain("## Endpoints");
      expect(result).toContain("### GET /test");
      expect(result).toContain("### POST /test");
      expect(result).toContain("**Tool:** `create_test`");
    });

    it("should format endpoint parameters", () => {
      const docWithParams: TopicDoc = {
        ...minimalDoc,
        endpoints: [
          {
            method: "GET",
            path: "/test/{id}",
            description: "Get test by ID",
            parameters: [
              {
                name: "id",
                type: "integer",
                required: true,
                description: "The test ID",
              },
              {
                name: "include_details",
                type: "boolean",
                required: false,
                default: false,
                description: "Include extra details",
              },
              {
                name: "format",
                type: "string",
                description: "Output format",
                enum: ["json", "xml", "csv"],
              },
            ],
          },
        ],
      };
      const result = formatDocumentation(docWithParams);
      expect(result).toContain("**Parameters:**");
      expect(result).toContain("`id`: integer (required)");
      expect(result).toContain("`include_details`: boolean [default: false]");
      expect(result).toContain("[options: json, xml, csv]");
    });

    it("should format request body", () => {
      const docWithBody: TopicDoc = {
        ...minimalDoc,
        endpoints: [
          {
            method: "POST",
            path: "/test",
            description: "Create test",
            request_body: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  required: true,
                  description: "The name",
                },
                value: {
                  type: "number",
                  description: "The value",
                },
              },
            },
          },
        ],
      };
      const result = formatDocumentation(docWithBody);
      expect(result).toContain("**Request Body:** `object`");
      expect(result).toContain("`name`: string (required)");
      expect(result).toContain("`value`: number");
    });

    it("should format examples in detailed mode", () => {
      const docWithExamples: TopicDoc = {
        ...minimalDoc,
        examples: [
          {
            title: "Basic Example",
            description: "A simple example",
            request: {
              method: "GET",
              path: "/test",
              headers: { Authorization: "Bearer token" },
            },
            response: { data: "test" },
          },
        ],
      };
      const result = formatDocumentation(docWithExamples, "detailed");
      expect(result).toContain("## Examples");
      expect(result).toContain("### Basic Example");
      expect(result).toContain("**Request:**");
      expect(result).toContain("GET /test");
      expect(result).toContain("Authorization: Bearer token");
      expect(result).toContain("**Response:**");
    });

    it("should format examples with request body", () => {
      const docWithBodyExample: TopicDoc = {
        ...minimalDoc,
        examples: [
          {
            title: "Create Example",
            description: "Creating data",
            request: {
              method: "POST",
              path: "/test",
              body: { name: "test", value: 42 },
            },
          },
        ],
      };
      const result = formatDocumentation(docWithBodyExample, "detailed");
      expect(result).toContain('"name": "test"');
      expect(result).toContain('"value": 42');
    });

    it("should format patterns/workflows", () => {
      const docWithPatterns: TopicDoc = {
        ...minimalDoc,
        patterns: [
          {
            name: "Basic Workflow",
            description: "A simple workflow",
            steps: ["1. Do step 1", "2. Do step 2", "3. Do step 3"],
            example: "example code here",
          },
        ],
      };
      const result = formatDocumentation(docWithPatterns);
      expect(result).toContain("## Workflows");
      expect(result).toContain("### Basic Workflow");
      expect(result).toContain("A simple workflow");
      expect(result).toContain("**Steps:**");
      expect(result).toContain("1. Do step 1");
      expect(result).toContain("**Example:**");
      expect(result).toContain("example code here");
    });

    it("should include schemas when includeSchemas is true", () => {
      const docWithSchemas: TopicDoc = {
        ...minimalDoc,
        schemas: {
          TestSchema: {
            type: "object",
            properties: {
              id: { type: "integer" },
            },
          },
        },
      };
      const result = formatDocumentation(docWithSchemas, "detailed", true);
      expect(result).toContain("## Schemas");
      expect(result).toContain('"TestSchema"');
    });

    it("should exclude schemas when includeSchemas is false", () => {
      const docWithSchemas: TopicDoc = {
        ...minimalDoc,
        schemas: {
          TestSchema: { type: "object" },
        },
      };
      const result = formatDocumentation(docWithSchemas, "detailed", false);
      expect(result).not.toContain("## Schemas");
    });

    it("should include related topics", () => {
      const docWithRelated: TopicDoc = {
        ...minimalDoc,
        related_topics: ["topic1", "topic2", "topic3"],
      };
      const result = formatDocumentation(docWithRelated);
      expect(result).toContain("## Related Topics");
      expect(result).toContain("topic1, topic2, topic3");
      expect(result).toContain("meta_api_docs");
    });

    it("should use custom config", () => {
      const customConfig = {
        baseUrlInfo: "## Base URL\nhttps://custom.example.com/api/",
        toolName: "custom_docs",
      };
      const result = formatDocumentation(
        { ...minimalDoc, patterns: [{ name: "Test", steps: ["step"] }] },
        "detailed",
        true,
        customConfig
      );
      expect(result).toContain("https://custom.example.com/api/");
    });

    describe("detail levels", () => {
      const docWithAll: TopicDoc = {
        ...minimalDoc,
        endpoints: [
          {
            method: "GET",
            path: "/test",
            description: "Test endpoint",
            parameters: [
              { name: "id", type: "integer", required: true, description: "ID" },
            ],
            example: {
              method: "GET",
              path: "/test/1",
            },
          },
        ],
        examples: [
          {
            title: "Example",
            description: "Test",
            request: { method: "GET", path: "/test" },
          },
        ],
      };

      it("overview should show minimal endpoint info", () => {
        const result = formatDocumentation(docWithAll, "overview");
        expect(result).toContain("### GET /test");
        expect(result).toContain("Test endpoint");
        expect(result).not.toContain("**Parameters:**");
      });

      it("detailed should show parameters but not inline examples", () => {
        const result = formatDocumentation(docWithAll, "detailed");
        expect(result).toContain("**Parameters:**");
        expect(result).toContain("## Examples");
      });

      it("examples should show inline examples in endpoints", () => {
        const result = formatDocumentation(docWithAll, "examples");
        expect(result).toContain("**Example:**");
        expect(result).toContain("GET /test/1");
      });
    });
  });
});
