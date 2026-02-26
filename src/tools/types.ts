/**
 * Common types for tool results
 */

export type ToolResult =
  | {
      success: true;
      data: string | string[];
      structuredContent?: Record<string, unknown>;
      error?: undefined;
    }
  | { success: false; error: string; data?: undefined; structuredContent?: undefined };

/**
 * Convert a ToolResult to MCP tool response format.
 * When data is a string[], each element becomes a separate content block.
 * When structuredContent is provided, it's included for clients that support outputSchema.
 */
export function toMcpResponse(result: ToolResult): {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
} {
  if (result.success) {
    const content = Array.isArray(result.data)
      ? result.data.map((text) => ({ type: "text" as const, text }))
      : [{ type: "text" as const, text: result.data }];

    if (result.structuredContent) {
      return { content, structuredContent: result.structuredContent };
    }
    return { content };
  }
  return {
    content: [{ type: "text", text: result.error }],
    isError: true,
  };
}
