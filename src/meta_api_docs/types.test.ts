import { describe, it, expect } from "vitest";
import type {
  HttpMethod,
  ParameterDoc,
  RequestBodyDoc,
  ResponseDoc,
  RequestExampleDoc,
  EndpointDoc,
  ExampleDoc,
  PatternDoc,
  TopicDoc,
  DetailLevel,
  MetaApiDocsArgs,
} from "./types.js";

describe("meta_api_docs/types", () => {
  describe("type structures", () => {
    it("should allow valid HttpMethod values", () => {
      const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
      expect(methods).toHaveLength(5);
    });

    it("should allow valid ParameterDoc structure", () => {
      const param: ParameterDoc = {
        name: "id",
        type: "integer",
        required: true,
        default: 1,
        description: "The ID",
        enum: ["a", "b"],
        in: "path",
      };
      expect(param.name).toBe("id");
      expect(param.in).toBe("path");
    });

    it("should allow minimal ParameterDoc", () => {
      const param: ParameterDoc = {
        name: "test",
        type: "string",
        description: "A test parameter",
      };
      expect(param.required).toBeUndefined();
    });

    it("should allow valid RequestBodyDoc structure", () => {
      const body: RequestBodyDoc = {
        type: "object",
        description: "Request body",
        properties: {
          name: { type: "string", required: true, description: "Name" },
        },
        example: { name: "test" },
      };
      expect(body.type).toBe("object");
    });

    it("should allow valid ResponseDoc structure", () => {
      const response: ResponseDoc = {
        type: "object",
        description: "Response",
        properties: { id: { type: "integer" } },
      };
      expect(response.type).toBe("object");
    });

    it("should allow valid RequestExampleDoc structure", () => {
      const example: RequestExampleDoc = {
        method: "POST",
        path: "/test",
        headers: { "Content-Type": "application/json" },
        body: { data: "test" },
      };
      expect(example.method).toBe("POST");
    });

    it("should allow valid EndpointDoc structure", () => {
      const endpoint: EndpointDoc = {
        method: "GET",
        path: "/test/{id}",
        tool_name: "get_test",
        description: "Get a test",
        tags: ["test", "example"],
        parameters: [
          { name: "id", type: "integer", description: "ID" },
        ],
        request_body: { type: "object" },
        response: { type: "object" },
        example: { method: "GET", path: "/test/1" },
      };
      expect(endpoint.method).toBe("GET");
      expect(endpoint.tags).toContain("test");
    });

    it("should allow valid ExampleDoc structure", () => {
      const example: ExampleDoc = {
        title: "Example Title",
        description: "Example description",
        request: {
          method: "GET",
          path: "/test",
          headers: { Authorization: "Bearer token" },
          body: undefined,
        },
        response: { success: true },
      };
      expect(example.title).toBe("Example Title");
    });

    it("should allow valid PatternDoc structure", () => {
      const pattern: PatternDoc = {
        name: "Workflow Name",
        description: "Workflow description",
        steps: ["Step 1", "Step 2"],
        example: "example code",
      };
      expect(pattern.steps).toHaveLength(2);
    });

    it("should allow valid TopicDoc structure", () => {
      const topic: TopicDoc = {
        topic: "test",
        title: "Test Topic",
        description: "Test description",
        endpoints: [],
        examples: [],
        related_topics: ["other"],
        schemas: { TestSchema: {} },
        patterns: [],
        ai_hints: "AI hints here",
      };
      expect(topic.topic).toBe("test");
      expect(topic.ai_hints).toBeDefined();
    });

    it("should allow valid DetailLevel values", () => {
      const levels: DetailLevel[] = ["overview", "detailed", "examples"];
      expect(levels).toHaveLength(3);
    });

    it("should allow valid MetaApiDocsArgs structure", () => {
      const args: MetaApiDocsArgs = {
        topic: "start",
        detail_level: "detailed",
        include_schemas: true,
      };
      expect(args.topic).toBe("start");
    });

    it("should allow minimal MetaApiDocsArgs", () => {
      const args: MetaApiDocsArgs = {
        topic: "start",
      };
      expect(args.detail_level).toBeUndefined();
      expect(args.include_schemas).toBeUndefined();
    });
  });
});
