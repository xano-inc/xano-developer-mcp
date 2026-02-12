/**
 * XanoScript Validation Tool
 *
 * Validates XanoScript code for syntax errors using the XanoScript language server.
 * Can be used standalone or within the MCP server.
 */

import { xanoscriptParser } from "@xano/xanoscript-language-server/parser/parser.js";
import { getSchemeFromContent } from "@xano/xanoscript-language-server/utils.js";
import type { ToolResult } from "./types.js";

// =============================================================================
// Types
// =============================================================================

export interface ValidateXanoscriptArgs {
  /** The XanoScript code to validate */
  code: string;
}

export interface ParserDiagnostic {
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  message: string;
  source: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ParserDiagnostic[];
  message: string;
}

// =============================================================================
// Standalone Tool Function
// =============================================================================

/**
 * Validate XanoScript code for syntax errors.
 *
 * @param args - The validation arguments
 * @returns Validation result with errors if any
 *
 * @example
 * ```ts
 * import { validateXanoscript } from '@xano/developer-mcp';
 *
 * const result = validateXanoscript({ code: 'return 1 + 1' });
 * if (result.valid) {
 *   console.log('Code is valid!');
 * } else {
 *   console.log('Errors:', result.errors);
 * }
 * ```
 */
export function validateXanoscript(args: ValidateXanoscriptArgs): ValidationResult {
  if (!args?.code) {
    return {
      valid: false,
      errors: [],
      message: "Error: 'code' parameter is required",
    };
  }

  try {
    const text = args.code;
    const scheme = getSchemeFromContent(text);
    const parser = xanoscriptParser(text, scheme);

    if (parser.errors.length === 0) {
      return {
        valid: true,
        errors: [],
        message: "XanoScript is valid. No syntax errors found.",
      };
    }

    const diagnostics: ParserDiagnostic[] = parser.errors.map(
      (error: {
        token?: { startOffset: number; endOffset: number };
        message: string;
        name?: string;
      }) => {
        const startOffset = error.token?.startOffset ?? 0;
        const endOffset = error.token?.endOffset ?? 5;

        const lines = text.substring(0, startOffset).split("\n");
        const line = lines.length - 1;
        const character = lines[lines.length - 1].length;

        const endLines = text.substring(0, endOffset + 1).split("\n");
        const endLine = endLines.length - 1;
        const endCharacter = endLines[endLines.length - 1].length;

        return {
          range: {
            start: { line, character },
            end: { line: endLine, character: endCharacter },
          },
          message: error.message,
          source: error.name || "XanoScript Parser",
        };
      }
    );

    const errorMessages = diagnostics.map((d: ParserDiagnostic, i: number) => {
      const location = `Line ${d.range.start.line + 1}, Column ${d.range.start.character + 1}`;
      return `${i + 1}. [${location}] ${d.message}`;
    });

    return {
      valid: false,
      errors: diagnostics,
      message: `Found ${diagnostics.length} error(s):\n\n${errorMessages.join("\n")}`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      errors: [],
      message: `Validation error: ${errorMessage}`,
    };
  }
}

/**
 * Validate XanoScript and return a simplified result.
 * Returns ToolResult format for consistent error handling.
 */
export function validateXanoscriptTool(args: ValidateXanoscriptArgs): ToolResult {
  const result = validateXanoscript(args);
  return {
    success: result.valid,
    data: result.valid ? result.message : undefined,
    error: result.valid ? undefined : result.message,
  };
}

// =============================================================================
// MCP Tool Definition
// =============================================================================

export const validateXanoscriptToolDefinition = {
  name: "validate_xanoscript",
  description:
    "Validate XanoScript code for syntax errors. Returns a list of errors with line/column positions, or confirms the code is valid. The language server auto-detects the object type from the code syntax.",
  inputSchema: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description: "The XanoScript code to validate",
      },
    },
    required: ["code"],
  },
};
