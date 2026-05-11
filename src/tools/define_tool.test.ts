import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineTool } from "./define_tool.js";

describe("defineTool", () => {
  const built = defineTool({
    name: "test_tool",
    description: "A test tool",
    annotations: { readOnlyHint: true, destructiveHint: false },
    inputShape: {
      code: z.string().describe("the code"),
      mode: z.enum(["full", "quick"]).optional().describe("the mode"),
      tags: z.array(z.string()).optional(),
      count: z.number().optional(),
    },
    outputShape: {
      ok: z.boolean().describe("success flag"),
      message: z.string().optional(),
    },
  });

  const input = built.definition.inputSchema as unknown as {
    type: string;
    properties: Record<string, { type?: string; description?: string; enum?: string[]; items?: { type: string } }>;
    required?: string[];
  };

  it("emits an object schema with properties", () => {
    expect(input.type).toBe("object");
    expect(input.properties).toHaveProperty("code");
    expect(input.properties).toHaveProperty("mode");
  });

  it("preserves .describe() text from Zod shapes", () => {
    expect(input.properties.code.description).toBe("the code");
    expect(input.properties.mode.description).toBe("the mode");
  });

  it("lists only non-optional fields as required", () => {
    expect(input.required).toEqual(["code"]);
  });

  it("encodes enums into JSON Schema", () => {
    expect(input.properties.mode.enum).toEqual(["full", "quick"]);
  });

  it("encodes z.array(z.string()) as array of strings", () => {
    expect(input.properties.tags.type).toBe("array");
    expect(input.properties.tags.items).toEqual({ type: "string" });
  });

  it("strips $schema dialect key from emitted JSON Schema", () => {
    expect(input).not.toHaveProperty("$schema");
    expect(built.definition.outputSchema).not.toHaveProperty("$schema");
  });

  it("strips additionalProperties so wire schema stays permissive", () => {
    expect(input).not.toHaveProperty("additionalProperties");
    expect(built.definition.outputSchema).not.toHaveProperty(
      "additionalProperties"
    );
  });

  it("inputParser accepts what the schema declares as valid", () => {
    const parsed = built.inputParser.safeParse({ code: "x", mode: "full" });
    expect(parsed.success).toBe(true);
  });

  it("inputParser rejects invalid enum values", () => {
    const parsed = built.inputParser.safeParse({ code: "x", mode: "nope" });
    expect(parsed.success).toBe(false);
  });

  it("inputParser strips unknown keys (forward-compat with wire schema)", () => {
    const parsed = built.inputParser.safeParse({ code: "x", extra: 42 });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty("extra");
    }
  });
});
