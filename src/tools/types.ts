/**
 * Common types for tool results
 */

export interface ToolResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Convert a ToolResult to MCP tool response format
 */
export function toMcpResponse(result: ToolResult): {
  content: { type: "text"; text: string }[];
  isError?: boolean;
} {
  if (result.success) {
    return {
      content: [{ type: "text", text: result.data! }],
    };
  }
  return {
    content: [{ type: "text", text: result.error! }],
    isError: true,
  };
}
