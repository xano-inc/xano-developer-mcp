/**
 * Xano CLI Documentation Index
 *
 * This module exports all documentation topics and provides
 * the cli_docs tool handler for the MCP server.
 */

import { z } from "zod";
import type { TopicDoc, DetailLevel, CliDocsArgs } from "./types.js";
import { formatDocumentation } from "./format.js";
import { defineTool } from "../tools/define_tool.js";
import { gatePolicies, perPolicies, policiesOnly, type DeveloperToolsOptions } from "../policies.js";

// Import all topic documentation
import { authDoc } from "./topics/auth.js";
import { startDoc } from "./topics/start.js";
import { profileDoc } from "./topics/profile.js";
import { workspaceDoc } from "./topics/workspace.js";
import { branchDoc } from "./topics/branch.js";
import { functionDoc } from "./topics/function.js";
import { knowledgeDoc } from "./topics/knowledge.js";
import { releaseDoc } from "./topics/release.js";
import { tenantDoc } from "./topics/tenant.js";
import { unitTestDoc } from "./topics/unit_test.js";
import { workflowTestDoc } from "./topics/workflow_test.js";
import { sandboxDoc } from "./topics/sandbox.js";
import { platformDoc } from "./topics/platform.js";
import { staticHostDoc } from "./topics/static_host.js";
import { updateDoc } from "./topics/update.js";
import { integrationDoc } from "./topics/integration.js";
import { policyDoc } from "./topics/policy.js";
import { skillsDoc } from "./topics/skills.js";

/**
 * All documentation topics, the policies feature's included
 */
const allTopics: Record<string, TopicDoc> = {
  auth: authDoc,
  start: startDoc,
  profile: profileDoc,
  workspace: workspaceDoc,
  branch: branchDoc,
  function: functionDoc,
  knowledge: knowledgeDoc,
  release: releaseDoc,
  tenant: tenantDoc,
  unit_test: unitTestDoc,
  workflow_test: workflowTestDoc,
  sandbox: sandboxDoc,
  platform: platformDoc,
  static_host: staticHostDoc,
  update: updateDoc,
  integration: integrationDoc,
  policy: policiesOnly(policyDoc),
  skills: policiesOnly(skillsDoc),
};

/**
 * The topics served under the host's options
 */
export const topicsFor = perPolicies((options) => gatePolicies(allTopics, options));

/**
 * All available documentation topics (by default, without the policies feature)
 */
export const topics: Record<string, TopicDoc> = topicsFor();

/**
 * Get list of all available topic names
 */
export function getTopicNames(options?: DeveloperToolsOptions): string[] {
  return Object.keys(topicsFor(options));
}

/**
 * Get topic descriptions for tool documentation
 */
export function getTopicDescriptions(options?: DeveloperToolsOptions): string {
  return Object.entries(topicsFor(options))
    .map(([key, doc]) => `- ${key}: ${doc.title}`)
    .join("\n");
}

/**
 * Handler for the cli_docs tool
 */
export function handleCliDocs(
  args: CliDocsArgs,
  options?: DeveloperToolsOptions
): string {
  const { topic, detail_level = "detailed" } = args;

  // Validate topic
  const served = topicsFor(options);
  if (!served[topic]) {
    const available = getTopicNames(options).join(", ");
    return `Error: Unknown topic "${topic}".\n\nAvailable topics: ${available}`;
  }

  const doc = served[topic];
  return formatDocumentation(doc, detail_level as DetailLevel);
}

/**
 * Tool definition for MCP server, per the host's options
 */
export const cliDocsToolSpecFor = perPolicies((options) =>
  defineTool({
    name: "xano_cli_docs",
    description: `Get documentation for the Xano CLI. Use this to understand how to use the CLI for local development, code sync, and XanoScript execution.

## Topics
${getTopicDescriptions(options)}

## Usage
- Start with "start" topic for installation and setup
- Use "auth" or "profile" to understand authentication options
- Use "integration" to understand when to use CLI vs Meta API
- Use specific topics for command reference (workspace, sandbox, branch, release, tenant, function, etc.)`,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputShape: {
      topic: z
        .enum(getTopicNames(options) as [string, ...string[]])
        .describe(
          "Documentation topic to retrieve. Start with 'start' for installation and setup. " +
            "Example: topic='function' for function management commands, topic='sandbox' for the personal dev environment."
        ),
      detail_level: z
        .enum(["overview", "detailed", "examples"])
        .optional()
        .describe(
          "Level of detail to return. " +
            "'overview' = brief summary of commands and their purpose. " +
            "'detailed' = full command reference with flags and arguments. " +
            "'examples' = includes usage examples for each command. " +
            "Default: 'detailed'."
        ),
    },
    outputShape: {
      documentation: z
        .string()
        .describe("The CLI documentation content for the requested topic."),
    },
  })
);

/**
 * Tool definition for MCP server (by default, without the policies feature)
 */
export const cliDocsToolSpec = cliDocsToolSpecFor();
