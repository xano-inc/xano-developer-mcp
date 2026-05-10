/**
 * Tool definition helper.
 *
 * Single source of truth: Zod input/output shapes carry parameter descriptions,
 * enums, and validation rules. JSON Schema for the MCP protocol is derived
 * from those shapes via `z.toJSONSchema`, so the wire-level schema and the
 * runtime parser can never drift.
 */

import { z } from "zod";

export type ZodRawShape = Record<string, z.ZodTypeAny>;

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  annotations: ToolAnnotations;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

export interface ToolSpec<I extends ZodRawShape, O extends ZodRawShape> {
  name: string;
  description: string;
  annotations: ToolAnnotations;
  inputShape: I;
  outputShape: O;
}

export interface BuiltTool<I extends ZodRawShape, O extends ZodRawShape>
  extends ToolSpec<I, O> {
  definition: ToolDefinition;
  inputParser: z.ZodObject<I>;
}

/**
 * Build a tool from Zod shapes. Returns the spec plus a derived JSON Schema
 * `definition` (for library consumers) and an `inputParser` (for safe parsing).
 */
export function defineTool<I extends ZodRawShape, O extends ZodRawShape>(
  spec: ToolSpec<I, O>
): BuiltTool<I, O> {
  const inputParser = z.object(spec.inputShape);
  const outputObj = z.object(spec.outputShape);

  const definition: ToolDefinition = {
    name: spec.name,
    description: spec.description,
    annotations: spec.annotations,
    inputSchema: z.toJSONSchema(inputParser) as Record<string, unknown>,
    outputSchema: z.toJSONSchema(outputObj) as Record<string, unknown>,
  };

  return { ...spec, definition, inputParser };
}
