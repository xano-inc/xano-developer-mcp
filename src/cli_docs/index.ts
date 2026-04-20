/**
 * Xano CLI Documentation Index
 *
 * This module exports all documentation topics and provides
 * the cli_docs tool handler for the MCP server.
 */

import type { TopicDoc, DetailLevel, CliDocsArgs } from "./types.js";
import { formatDocumentation } from "./format.js";

// Import all topic documentation
import { authDoc } from "./topics/auth.js";
import { startDoc } from "./topics/start.js";
import { profileDoc } from "./topics/profile.js";
import { workspaceDoc } from "./topics/workspace.js";
import { branchDoc } from "./topics/branch.js";
import { functionDoc } from "./topics/function.js";
import { releaseDoc } from "./topics/release.js";
import { tenantDoc } from "./topics/tenant.js";
import { unitTestDoc } from "./topics/unit_test.js";
import { workflowTestDoc } from "./topics/workflow_test.js";
import { sandboxDoc } from "./topics/sandbox.js";
import { platformDoc } from "./topics/platform.js";
import { staticHostDoc } from "./topics/static_host.js";
import { updateDoc } from "./topics/update.js";
import { integrationDoc } from "./topics/integration.js";

/**
 * All available documentation topics
 */
export const topics: Record<string, TopicDoc> = {
  auth: authDoc,
  start: startDoc,
  profile: profileDoc,
  workspace: workspaceDoc,
  branch: branchDoc,
  function: functionDoc,
  release: releaseDoc,
  tenant: tenantDoc,
  unit_test: unitTestDoc,
  workflow_test: workflowTestDoc,
  sandbox: sandboxDoc,
  platform: platformDoc,
  static_host: staticHostDoc,
  update: updateDoc,
  integration: integrationDoc,
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
 * Handler for the cli_docs tool
 */
export function handleCliDocs(args: CliDocsArgs): string {
  const { topic, detail_level = "detailed" } = args;

  // Validate topic
  if (!topics[topic]) {
    const available = getTopicNames().join(", ");
    return `Error: Unknown topic "${topic}".\n\nAvailable topics: ${available}`;
  }

  const doc = topics[topic];
  return formatDocumentation(doc, detail_level as DetailLevel);
}

/**
 * Tool definition for MCP server
 */
export const cliDocsToolDefinition = {
  name: "cli_docs",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  description: `Get documentation for the Xano CLI. Use this to understand how to use the CLI for local development, code sync, and XanoScript execution.

## Topics
${getTopicDescriptions()}

## Usage
- Start with "start" topic for installation and setup
- Use "auth" or "profile" to understand authentication options
- Use "integration" to understand when to use CLI vs Meta API
- Use specific topics for command reference (workspace, sandbox, branch, release, tenant, function, etc.)`,

  inputSchema: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        enum: getTopicNames(),
        description:
          "Documentation topic to retrieve. Start with 'start' for installation and setup. " +
          "Example: topic='function' for function management commands, topic='sandbox' for the personal dev environment.",
      },
      detail_level: {
        type: "string",
        enum: ["overview", "detailed", "examples"],
        default: "detailed",
        description:
          "Level of detail to return. " +
          "'overview' = brief summary of commands and their purpose. " +
          "'detailed' = full command reference with flags and arguments. " +
          "'examples' = includes usage examples for each command. " +
          "Default: 'detailed'.",
      },
    },
    required: ["topic"],
  },
  outputSchema: {
    type: "object",
    properties: {
      documentation: {
        type: "string",
        description: "The CLI documentation content for the requested topic.",
      },
    },
    required: ["documentation"],
  },
};
