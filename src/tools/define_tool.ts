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
  readonly readOnlyHint?: boolean;
  readonly destructiveHint?: boolean;
  readonly idempotentHint?: boolean;
  readonly openWorldHint?: boolean;
}

/**
 * Branded JSON Schema type. Anything emitted by `defineTool` is guaranteed
 * to have passed through `z.toJSONSchema` and had wire-incompatible keys
 * (`$schema`, `additionalProperties`) stripped.
 */
export type JsonSchema = Readonly<Record<string, unknown>> & {
  readonly __jsonSchemaBrand: unique symbol;
};

export interface ToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly annotations: ToolAnnotations;
  readonly inputSchema: JsonSchema;
  readonly outputSchema: JsonSchema;
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
  readonly definition: ToolDefinition;
  readonly inputParser: z.ZodObject<I>;
}

/**
 * Strip keys that MCP clients/SDKs don't expect on tool schemas.
 * - `$schema`: dialect URL added by zod 4 — not part of the MCP wire format.
 * - `additionalProperties: false`: emitted by zod for `z.object`; we want
 *   the wire schema to remain forward-compatible (extra keys ignored by the
 *   parser anyway since `z.object` strips them).
 */
function sanitizeJsonSchema(schema: Record<string, unknown>): JsonSchema {
  const { $schema: _$schema, additionalProperties: _ap, ...rest } = schema;
  return rest as JsonSchema;
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
    inputSchema: sanitizeJsonSchema(
      z.toJSONSchema(inputParser) as Record<string, unknown>
    ),
    outputSchema: sanitizeJsonSchema(
      z.toJSONSchema(outputObj) as Record<string, unknown>
    ),
  };

  return { ...spec, definition, inputParser };
}
