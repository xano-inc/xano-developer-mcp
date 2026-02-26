/**
 * XanoScript Validation Tool
 *
 * Validates XanoScript code for syntax errors using the XanoScript language server.
 * Can be used standalone or within the MCP server.
 *
 * Supports multiple input methods:
 * - code: Raw XanoScript code as a string
 * - file_path: Path to a single .xs file
 * - file_paths: Array of file paths for batch validation
 * - directory: Directory path with optional glob pattern
 */

import { xanoscriptParser } from "@xano/xanoscript-language-server/parser/parser.js";
import { getSchemeFromContent } from "@xano/xanoscript-language-server/utils.js";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, resolve, basename } from "path";
import { minimatch } from "minimatch";
import type { ToolResult } from "./types.js";

// =============================================================================
// Types
// =============================================================================

export interface ValidateXanoscriptArgs {
  /** The XanoScript code to validate (mutually exclusive with file_path/file_paths/directory) */
  code?: string;
  /** Path to a single XanoScript file to validate */
  file_path?: string;
  /** Array of file paths for batch validation */
  file_paths?: string[];
  /** Directory to validate (validates all .xs files recursively) */
  directory?: string;
  /** Glob pattern to filter files when using directory (default: "**\/*.xs") */
  pattern?: string;
}

export interface ParserDiagnostic {
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  message: string;
  source: string;
}

export interface SingleFileValidationResult {
  valid: boolean;
  errors: ParserDiagnostic[];
  message: string;
  file_path?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ParserDiagnostic[];
  message: string;
}

export interface BatchValidationResult {
  valid: boolean;
  total_files: number;
  valid_files: number;
  invalid_files: number;
  results: SingleFileValidationResult[];
  message: string;
}

// =============================================================================
// Error Message Improvements
// =============================================================================

/**
 * Common type aliases that users might try
 */
const TYPE_ALIASES: Record<string, string> = {
  boolean: "bool",
  integer: "int",
  string: "text",
  number: "decimal",
  float: "decimal",
  double: "decimal",
  array: "type[]",
  list: "type[]",
  object: "json",
  map: "json",
  dict: "json",
  dictionary: "json",
};

/**
 * Reserved variable names that cannot be used
 */
const RESERVED_VARIABLES = [
  "$response",
  "$output",
  "$input",
  "$index",
  "$auth",
  "$env",
  "$db",
  "$this",
  "$result",
];

/**
 * Common syntax mistakes and their fixes
 */
const SYNTAX_SUGGESTIONS: Array<{
  pattern: RegExp;
  suggestion: string;
}> = [
  {
    pattern: /else\s+if/,
    suggestion: 'Use "elseif" (one word) instead of "else if"',
  },
  {
    pattern: /body\s*=/,
    suggestion:
      'Use "params" instead of "body" for api.request request body',
  },
  {
    pattern: /\|default:/,
    suggestion:
      'There is no "default" filter. Use "first_notnull" or "??" operator instead',
  },
  {
    pattern: /boolean/,
    suggestion: 'Use "bool" instead of "boolean" for type declaration',
  },
  {
    pattern: /integer(?!\s*\()/,
    suggestion: 'Use "int" instead of "integer" for type declaration',
  },
  {
    pattern: /string(?!\s*\()/,
    suggestion: 'Use "text" instead of "string" for type declaration',
  },
];

/**
 * Enhance error message with helpful suggestions
 */
function enhanceErrorMessage(
  message: string,
  code: string,
  lineNumber: number
): string {
  let enhanced = message;
  const lines = code.split("\n");
  const errorLine = lines[lineNumber] || "";

  // Check for type aliases
  for (const [alias, correct] of Object.entries(TYPE_ALIASES)) {
    const regex = new RegExp(`\\b${alias}\\b`, "i");
    if (regex.test(errorLine)) {
      enhanced += `\n\n💡 Suggestion: Use "${correct}" instead of "${alias}"`;
      break;
    }
  }

  // Check for reserved variables
  for (const reserved of RESERVED_VARIABLES) {
    if (
      errorLine.includes(`var ${reserved}`) ||
      errorLine.includes(`var.update ${reserved}`)
    ) {
      enhanced += `\n\n💡 "${reserved}" is a reserved variable name. Try a different name like "${reserved.replace("$", "$my_")}"`;
      break;
    }
  }

  // Check for common syntax mistakes
  for (const { pattern, suggestion } of SYNTAX_SUGGESTIONS) {
    if (pattern.test(errorLine) || pattern.test(code)) {
      enhanced += `\n\n💡 Suggestion: ${suggestion}`;
      break;
    }
  }

  // Add the actual line of code for context
  if (errorLine.trim()) {
    enhanced += `\n\nCode at line ${lineNumber + 1}:\n  ${errorLine.trim()}`;
  }

  return enhanced;
}

// =============================================================================
// File Reading Utilities
// =============================================================================

/**
 * Read a file and return its contents
 */
function readFile(filePath: string): { content: string; error?: string } {
  try {
    const absolutePath = resolve(filePath);
    if (!existsSync(absolutePath)) {
      return { content: "", error: `File not found: ${filePath}` };
    }
    const content = readFileSync(absolutePath, "utf-8");
    return { content };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { content: "", error: `Error reading file: ${errorMessage}` };
  }
}

/**
 * Find all .xs files in a directory matching the pattern
 */
function findXsFiles(
  directory: string,
  pattern: string = "**/*.xs"
): string[] {
  const absoluteDir = resolve(directory);
  if (!existsSync(absoluteDir)) {
    return [];
  }

  const files: string[] = [];

  function walkDir(dir: string, basePath: string = "") {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = basePath ? join(basePath, entry.name) : entry.name;

      if (entry.isDirectory()) {
        walkDir(fullPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith(".xs")) {
        if (minimatch(relativePath, pattern)) {
          files.push(fullPath);
        }
      }
    }
  }

  walkDir(absoluteDir);
  return files;
}

// =============================================================================
// Standalone Tool Function
// =============================================================================

/**
 * Validate a single piece of XanoScript code.
 * Internal function used by the public API.
 */
function validateCode(
  code: string,
  filePath?: string
): SingleFileValidationResult {
  try {
    const text = code;
    const scheme = getSchemeFromContent(text);
    const parser = xanoscriptParser(text, scheme);

    if (parser.errors.length === 0) {
      return {
        valid: true,
        errors: [],
        message: filePath
          ? `✓ ${basename(filePath)}: Valid`
          : "XanoScript is valid. No syntax errors found.",
        file_path: filePath,
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

        // Enhance error message with suggestions
        const enhancedMessage = enhanceErrorMessage(error.message, text, line);

        return {
          range: {
            start: { line, character },
            end: { line: endLine, character: endCharacter },
          },
          message: enhancedMessage,
          source: error.name || "XanoScript Parser",
        };
      }
    );

    const errorMessages = diagnostics.map((d: ParserDiagnostic, i: number) => {
      const location = `Line ${d.range.start.line + 1}, Column ${d.range.start.character + 1}`;
      return `${i + 1}. [${location}] ${d.message}`;
    });

    const prefix = filePath ? `✗ ${basename(filePath)}: ` : "";
    return {
      valid: false,
      errors: diagnostics,
      message: `${prefix}Found ${diagnostics.length} error(s):\n\n${errorMessages.join("\n")}`,
      file_path: filePath,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      errors: [],
      message: `Validation error: ${errorMessage}`,
      file_path: filePath,
    };
  }
}

/**
 * Validate XanoScript code for syntax errors.
 *
 * Supports multiple input methods:
 * - code: Raw XanoScript code as a string
 * - file_path: Path to a single .xs file
 * - file_paths: Array of file paths for batch validation
 * - directory: Directory path with optional glob pattern
 *
 * @param args - The validation arguments
 * @returns Validation result with errors if any
 *
 * @example
 * ```ts
 * import { validateXanoscript } from '@xano/developer-mcp';
 *
 * // Validate code directly
 * const result = validateXanoscript({ code: 'return 1 + 1' });
 *
 * // Validate a single file
 * const fileResult = validateXanoscript({ file_path: './functions/utils.xs' });
 *
 * // Validate multiple files
 * const batchResult = validateXanoscript({
 *   file_paths: ['./apis/users/get.xs', './apis/users/create.xs']
 * });
 *
 * // Validate all .xs files in a directory
 * const dirResult = validateXanoscript({ directory: './src' });
 *
 * // Validate with a specific pattern
 * const patternResult = validateXanoscript({
 *   directory: './src',
 *   pattern: 'apis/**\/*.xs'
 * });
 * ```
 */
export function validateXanoscript(
  args: ValidateXanoscriptArgs
): ValidationResult | BatchValidationResult {
  // Validate that at least one input method is provided
  if (!args?.code && !args?.file_path && !args?.file_paths && !args?.directory) {
    return {
      valid: false,
      errors: [],
      message:
        "Error: One of 'code', 'file_path', 'file_paths', or 'directory' parameter is required",
    };
  }

  // Handle direct code validation
  if (args.code) {
    const result = validateCode(args.code);
    return {
      valid: result.valid,
      errors: result.errors,
      message: result.message,
    };
  }

  // Handle single file validation
  if (args.file_path) {
    const { content, error } = readFile(args.file_path);
    if (error) {
      return {
        valid: false,
        errors: [],
        message: error,
      };
    }
    const result = validateCode(content, args.file_path);
    return {
      valid: result.valid,
      errors: result.errors,
      message: result.message,
    };
  }

  // Handle batch validation (file_paths or directory)
  let filesToValidate: string[] = [];

  if (args.file_paths) {
    filesToValidate = args.file_paths;
  } else if (args.directory) {
    filesToValidate = findXsFiles(args.directory, args.pattern || "**/*.xs");
    if (filesToValidate.length === 0) {
      return {
        valid: true,
        total_files: 0,
        valid_files: 0,
        invalid_files: 0,
        results: [],
        message: `No .xs files found in directory: ${args.directory}${args.pattern ? ` matching pattern: ${args.pattern}` : ""}`,
      };
    }
  }

  // Validate all files
  const results: SingleFileValidationResult[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (const filePath of filesToValidate) {
    const { content, error } = readFile(filePath);
    if (error) {
      results.push({
        valid: false,
        errors: [],
        message: error,
        file_path: filePath,
      });
      invalidCount++;
      continue;
    }

    const result = validateCode(content, filePath);
    results.push(result);
    if (result.valid) {
      validCount++;
    } else {
      invalidCount++;
    }
  }

  // Build summary message
  const allValid = invalidCount === 0;
  const summaryLines: string[] = [
    `Validated ${filesToValidate.length} file(s): ${validCount} valid, ${invalidCount} invalid`,
    "",
  ];

  // Show errors first, then valid files
  const invalidResults = results.filter((r) => !r.valid);
  const validResults = results.filter((r) => r.valid);

  if (invalidResults.length > 0) {
    summaryLines.push("❌ Files with errors:");
    for (const result of invalidResults) {
      summaryLines.push(`\n${result.message}`);
    }
    summaryLines.push("");
  }

  if (validResults.length > 0) {
    summaryLines.push("✅ Valid files:");
    for (const result of validResults) {
      summaryLines.push(`  ${result.file_path}`);
    }
  }

  return {
    valid: allValid,
    total_files: filesToValidate.length,
    valid_files: validCount,
    invalid_files: invalidCount,
    results,
    message: summaryLines.join("\n"),
  };
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
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  description:
    "Validate XanoScript code for syntax errors. Supports multiple input methods:\n" +
    "- code: Raw XanoScript code as a string\n" +
    "- file_path: Path to a single .xs file (easier than escaping code!)\n" +
    "- file_paths: Array of file paths for batch validation\n" +
    "- directory: Validate all .xs files in a directory\n\n" +
    "Returns errors with line/column positions and helpful suggestions for common mistakes. " +
    "The language server auto-detects the object type from the code syntax.",
  inputSchema: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description:
          "The XanoScript code to validate as a string. Use file_path instead if the code contains special characters that are hard to escape. " +
          "Example: \"var $name:text = 'hello'\\nreturn $name\"",
      },
      file_path: {
        type: "string",
        description:
          "Path to a single XanoScript file to validate. Easier than passing code directly - avoids escaping issues. " +
          "Example: \"functions/utils/format.xs\"",
      },
      file_paths: {
        type: "array",
        items: { type: "string" },
        description:
          "Array of file paths for batch validation. Returns a summary with per-file results. " +
          "Example: [\"apis/users/get.xs\", \"apis/users/create.xs\", \"functions/utils/format.xs\"]",
      },
      directory: {
        type: "string",
        description:
          "Directory path to validate. Validates all .xs files recursively. Use with 'pattern' to filter specific subdirectories or files. " +
          "Example: \"apis/users\"",
      },
      pattern: {
        type: "string",
        description:
          "Glob pattern to filter files when using 'directory' (default: \"**/*.xs\"). " +
          "Examples: \"apis/**/*.xs\" to match only API files, \"**/create.xs\" to match all create files.",
      },
    },
    required: [],
  },
};

// =============================================================================
// Utility Exports
// =============================================================================

export { TYPE_ALIASES, RESERVED_VARIABLES };
