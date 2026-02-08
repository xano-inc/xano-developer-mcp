/**
 * Xano Run API Documentation Index
 *
 * This module exports all documentation topics and provides
 * the run_api_docs tool handler for the MCP server.
 */

import type { TopicDoc, DetailLevel } from "../meta_api_docs/types.js";
import { formatDocumentation } from "./format.js";

// Import all topic documentation
import { startDoc } from "./topics/start.js";
import { runDoc } from "./topics/run.js";
import { sessionDoc } from "./topics/session.js";
import { historyDoc } from "./topics/history.js";
import { dataDoc } from "./topics/data.js";
import { workflowsDoc } from "./topics/workflows.js";

/**
 * All available documentation topics
 */
export const topics: Record<string, TopicDoc> = {
  start: startDoc,
  run: runDoc,
  session: sessionDoc,
  history: historyDoc,
  data: dataDoc,
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
 * Handler for the run_api_docs tool
 */
export function handleRunApiDocs(
  topic?: string,
  detailLevel?: string,
  includeSchemas?: boolean
): string {
  // Validate topic
  if (!topic || !topics[topic]) {
    const available = getTopicNames().join(", ");
    return `Error: Unknown topic "${topic}".\n\nAvailable topics: ${available}`;
  }

  const doc = topics[topic];
  return formatDocumentation(
    doc,
    (detailLevel as DetailLevel) || "detailed",
    includeSchemas !== false
  );
}

/**
 * Tool definition for MCP server
 */
export const runApiDocsToolDefinition = {
  name: "run_api_docs",
  description: `Get documentation for Xano's Run API. Use this to understand runtime execution, session management, and XanoScript execution.

**Important:** The Run API uses a fixed base URL: https://app.dev.xano.com/api:run/<endpoint> (NOT your Xano instance URL)

## Topics
${getTopicDescriptions()}

## Usage
- Start with "start" topic for overview and getting started
- Use "workflows" for step-by-step guides
- Use specific topics (run, session, etc.) for detailed endpoint docs`,

  inputSchema: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        enum: getTopicNames(),
        description: "Documentation topic to retrieve",
      },
      detail_level: {
        type: "string",
        enum: ["overview", "detailed", "examples"],
        default: "detailed",
        description:
          "Level of detail: overview (brief), detailed (full docs), examples (with code examples)",
      },
      include_schemas: {
        type: "boolean",
        default: true,
        description: "Include JSON schemas for requests/responses",
      },
    },
    required: ["topic"],
  },
};
