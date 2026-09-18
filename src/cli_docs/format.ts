/**
 * Formatting utilities for CLI documentation
 */

import type { TopicDoc, CommandDoc, DetailLevel } from "./types.js";

/**
 * Format a command for display
 */
export function formatCommand(cmd: CommandDoc, detailed: boolean): string {
  const lines: string[] = [];

  lines.push(`### \`${cmd.name}\``);
  lines.push(cmd.description);
  lines.push("");
  lines.push("```bash");
  lines.push(cmd.usage);
  lines.push("```");

  if (detailed && cmd.flags && cmd.flags.length > 0) {
    lines.push("");
    lines.push("**Flags:**");
    lines.push("| Flag | Type | Required | Description |");
    lines.push("|------|------|----------|-------------|");
    for (const flag of cmd.flags) {
      const flagName = flag.short ? `-${flag.short}, --${flag.name}` : `--${flag.name}`;
      const required = flag.required ? "Yes" : "No";
      const desc = flag.default ? `${flag.description} (default: ${flag.default})` : flag.description;
      lines.push(`| \`${flagName}\` | ${flag.type} | ${required} | ${desc} |`);
    }
  }

  if (detailed && cmd.args && cmd.args.length > 0) {
    lines.push("");
    lines.push("**Arguments:**");
    lines.push("| Argument | Required | Description |");
    lines.push("|----------|----------|-------------|");
    for (const arg of cmd.args) {
      const required = arg.required ? "Yes" : "No";
      lines.push(`| \`${arg.name}\` | ${required} | ${arg.description} |`);
    }
  }

  if (cmd.examples && cmd.examples.length > 0) {
    lines.push("");
    lines.push("**Examples:**");
    lines.push("```bash");
    lines.push(cmd.examples.join("\n"));
    lines.push("```");
  }

  return lines.join("\n");
}

/**
 * Format complete documentation for a topic
 */
export function formatDocumentation(
  doc: TopicDoc,
  detailLevel: DetailLevel
): string {
  const sections: string[] = [];

  // Title and description
  sections.push(`# ${doc.title}`);
  sections.push("");
  sections.push(doc.description);

  // AI hints for overview/detailed
  if (doc.ai_hints && (detailLevel === "overview" || detailLevel === "detailed")) {
    sections.push("");
    sections.push("## AI Usage Notes");
    sections.push(doc.ai_hints);
  }

  // Commands
  if (doc.commands && doc.commands.length > 0) {
    sections.push("");
    sections.push("## Commands");

    const showDetailed = detailLevel === "detailed" || detailLevel === "examples";
    for (const cmd of doc.commands) {
      sections.push("");
      sections.push(formatCommand(cmd, showDetailed));
    }
  }

  // Workflows
  if (doc.workflows && doc.workflows.length > 0 && detailLevel !== "overview") {
    sections.push("");
    sections.push("## Workflows");

    for (const workflow of doc.workflows) {
      sections.push("");
      sections.push(`### ${workflow.name}`);
      sections.push(workflow.description);
      sections.push("");
      workflow.steps.forEach((step, i) => {
        sections.push(`${i + 1}. ${step}`);
      });
      if (workflow.example) {
        sections.push("");
        sections.push("```bash");
        sections.push(workflow.example);
        sections.push("```");
      }
    }
  }

  // Related topics
  if (doc.related_topics && doc.related_topics.length > 0) {
    sections.push("");
    sections.push("## Related Topics");
    sections.push(doc.related_topics.map(t => `- \`${t}\``).join("\n"));
  }

  return sections.join("\n");
}
