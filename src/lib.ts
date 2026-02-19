/**
 * @xano/developer-mcp Library Entry Point
 *
 * This module exports all tools for use as a standalone library.
 * Use this when you want to use the Xano tools outside of the MCP context.
 *
 * @example
 * ```ts
 * import {
 *   validateXanoscript,
 *   xanoscriptDocs,
 *   metaApiDocs,
 *   cliDocs,
 *   mcpVersion
 * } from '@xano/developer-mcp';
 *
 * // Validate XanoScript code
 * const validation = validateXanoscript({ code: 'return 1 + 1' });
 * if (validation.valid) {
 *   console.log('Code is valid!');
 * } else {
 *   console.log('Errors:', validation.errors);
 * }
 *
 * // Get XanoScript documentation
 * const docs = xanoscriptDocs({ topic: 'syntax', mode: 'quick_reference' });
 * console.log(docs.documentation);
 *
 * // Get Meta API documentation
 * const apiDocs = metaApiDocs({ topic: 'workspace', detail_level: 'examples' });
 * console.log(apiDocs.documentation);
 *
 * // Get CLI documentation
 * const cliDocs = cliDocs({ topic: 'start' });
 * console.log(cliDocs.documentation);
 *
 * // Get version
 * const { version } = mcpVersion();
 * console.log(`Version: ${version}`);
 * ```
 *
 * @packageDocumentation
 */

// =============================================================================
// Main Tool Exports
// =============================================================================

// Validation
export {
  validateXanoscript,
  type ValidateXanoscriptArgs,
  type ValidationResult,
  type ParserDiagnostic,
} from "./tools/validate_xanoscript.js";

// XanoScript Documentation
export {
  xanoscriptDocs,
  getXanoscriptDocsPath,
  setXanoscriptDocsPath,
  type XanoscriptDocsArgs,
  type XanoscriptDocsResult,
} from "./tools/xanoscript_docs.js";

// MCP Version
export {
  mcpVersion,
  getServerVersion,
  setServerVersion,
  type McpVersionResult,
} from "./tools/mcp_version.js";

// Meta API Documentation
export {
  metaApiDocs,
  metaApiTopics,
  getMetaApiTopicNames,
  getMetaApiTopicDescriptions,
  type MetaApiDocsArgs,
  type MetaApiDocsResult,
} from "./tools/meta_api_docs.js";

// CLI Documentation
export {
  cliDocs,
  cliTopics,
  getCliTopicNames,
  getCliTopicDescriptions,
  type CliDocsArgs,
  type CliDocsResult,
} from "./tools/cli_docs.js";

// =============================================================================
// Utility Exports
// =============================================================================

export { type ToolResult, toMcpResponse } from "./tools/types.js";

// =============================================================================
// XanoScript Core Exports (for advanced usage)
// =============================================================================

export {
  XANOSCRIPT_DOCS_V2,
  readXanoscriptDocsV2,
  getDocsForFilePath,
  extractQuickReference,
  getXanoscriptDocsVersion,
  getTopicNames as getXanoscriptTopicNames,
  getTopicDescriptions as getXanoscriptTopicDescriptions,
  type DocConfig,
} from "./xanoscript.js";

// =============================================================================
// MCP Tool Definitions (for building custom MCP servers)
// =============================================================================

export {
  toolDefinitions,
  handleTool,
  validateXanoscriptToolDefinition,
  xanoscriptDocsToolDefinition,
  mcpVersionToolDefinition,
  metaApiDocsToolDefinition,
  cliDocsToolDefinition,
} from "./tools/index.js";
