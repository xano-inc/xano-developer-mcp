/**
 * Xano Meta API Documentation Index
 *
 * This module exports all documentation topics and provides
 * the meta_api_docs tool handler for the MCP server.
 */

import { z } from "zod";
import type { TopicDoc, DetailLevel, MetaApiDocsArgs } from "./types.js";
import { formatDocumentation } from "./format.js";
import { defineTool } from "../tools/define_tool.js";

// Import all topic documentation
import { startDoc } from "./topics/start.js";
import { authenticationDoc } from "./topics/authentication.js";
import { workspaceDoc } from "./topics/workspace.js";
import { apigroupDoc } from "./topics/apigroup.js";
import { apiDoc } from "./topics/api.js";
import { tableDoc } from "./topics/table.js";
import { functionDoc } from "./topics/function.js";
import { taskDoc } from "./topics/task.js";
import { agentDoc } from "./topics/agent.js";
import { toolDoc } from "./topics/tool.js";
import { mcpServerDoc } from "./topics/mcp_server.js";
import { middlewareDoc } from "./topics/middleware.js";
import { branchDoc } from "./topics/branch.js";
import { realtimeDoc } from "./topics/realtime.js";
import { fileDoc } from "./topics/file.js";
import { historyDoc } from "./topics/history.js";
import { workflowsDoc } from "./topics/workflows.js";

/**
 * All available documentation topics
 */
export const topics: Record<string, TopicDoc> = {
  start: startDoc,
  authentication: authenticationDoc,
  workspace: workspaceDoc,
  apigroup: apigroupDoc,
  api: apiDoc,
  table: tableDoc,
  function: functionDoc,
  task: taskDoc,
  agent: agentDoc,
  tool: toolDoc,
  mcp_server: mcpServerDoc,
  middleware: middlewareDoc,
  branch: branchDoc,
  realtime: realtimeDoc,
  file: fileDoc,
  history: historyDoc,
  workflows: workflowsDoc,
};

/**
 * Get list of all available topic names
 */
export function getTopicNames(): string[] {
  return Object.keys(topics);
}

/**
 * Get topic descriptions for tool documentation
 */
export function getTopicDescriptions(): string {
  return Object.entries(topics)
    .map(([key, doc]) => `- ${key}: ${doc.title}`)
    .join("\n");
}

/**
 * Handler for the meta_api_docs tool
 */
export function handleMetaApiDocs(args: MetaApiDocsArgs): string {
  const { topic, detail_level = "detailed", include_schemas = true } = args;

  // Validate topic
  if (!topics[topic]) {
    const available = getTopicNames().join(", ");
    return `Error: Unknown topic "${topic}".\n\nAvailable topics: ${available}`;
  }

  const doc = topics[topic];
  return formatDocumentation(doc, detail_level as DetailLevel, include_schemas);
}

/**
 * Tool definition for MCP server
 */
export const metaApiDocsTool_spec = defineTool({
  name: "meta_api_docs",
  description: `Get documentation for Xano's Meta API. Use this to understand how to programmatically manage Xano workspaces, databases, APIs, functions, agents, and more.

## Topics
${getTopicDescriptions()}

## Usage
- Start with "start" topic for overview and getting started
- Use "workflows" for step-by-step guides
- Use specific topics (workspace, table, api, etc.) for detailed endpoint docs`,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputShape: {
    topic: z
      .enum(getTopicNames() as [string, ...string[]])
      .describe(
        "Documentation topic to retrieve. Start with 'start' for an overview of the Meta API. " +
          "Example: topic='workspace' for workspace management endpoints, topic='table' for database table operations."
      ),
    detail_level: z
      .enum(["overview", "detailed", "examples"])
      .optional()
      .describe(
        "Level of detail to return. " +
          "'overview' = brief summary of endpoints and their purpose. " +
          "'detailed' = full API reference with parameters, headers, and response formats. " +
          "'examples' = includes curl and fetch code examples for each endpoint. " +
          "Default: 'detailed'."
      ),
    include_schemas: z
      .boolean()
      .optional()
      .describe(
        "Include JSON schemas for request bodies and response payloads. " +
          "Useful for understanding the expected data format. Set to false to reduce response size. " +
          "Default: true."
      ),
  },
  outputShape: {
    documentation: z
      .string()
      .describe(
        "The Meta API documentation content for the requested topic."
      ),
  },
});

export const metaApiDocsToolDefinition = metaApiDocsTool_spec.definition;
