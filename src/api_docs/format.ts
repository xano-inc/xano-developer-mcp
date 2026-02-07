/**
 * Formatting utilities for API documentation output
 */

import type { TopicDoc, EndpointDoc, ExampleDoc, PatternDoc, DetailLevel } from "./types.js";

function formatParameter(param: NonNullable<EndpointDoc["parameters"]>[0]): string {
  const required = param.required ? " (required)" : "";
  const defaultVal = param.default !== undefined ? ` [default: ${param.default}]` : "";
  const enumVals = param.enum ? ` [options: ${param.enum.join(", ")}]` : "";
  return `  - \`${param.name}\`: ${param.type}${required}${defaultVal}${enumVals} - ${param.description}`;
}

function formatEndpoint(ep: EndpointDoc, detailLevel: DetailLevel): string {
  const lines: string[] = [];

  // Method and path
  lines.push(`### ${ep.method} ${ep.path}`);
  if (ep.tool_name) {
    lines.push(`**Tool:** \`${ep.tool_name}\``);
  }
  lines.push("");
  lines.push(ep.description);

  if (detailLevel === "overview") {
    return lines.join("\n");
  }

  // Parameters
  if (ep.parameters?.length) {
    lines.push("");
    lines.push("**Parameters:**");
    for (const param of ep.parameters) {
      lines.push(formatParameter(param));
    }
  }

  // Request body
  if (ep.request_body) {
    lines.push("");
    lines.push(`**Request Body:** \`${ep.request_body.type}\``);
    if (ep.request_body.properties) {
      for (const [key, val] of Object.entries(ep.request_body.properties)) {
        const req = val.required ? " (required)" : "";
        lines.push(`  - \`${key}\`: ${val.type}${req} - ${val.description || ""}`);
      }
    }
  }

  // Example (only in detailed/examples mode)
  if (detailLevel === "examples" && ep.example) {
    lines.push("");
    lines.push("**Example:**");
    lines.push("```");
    lines.push(`${ep.example.method} ${ep.example.path}`);
    if (ep.example.body) {
      lines.push(JSON.stringify(ep.example.body, null, 2));
    }
    lines.push("```");
  }

  return lines.join("\n");
}

function formatExample(ex: ExampleDoc): string {
  const lines: string[] = [];

  lines.push(`### ${ex.title}`);
  lines.push("");
  lines.push(ex.description);
  lines.push("");
  lines.push("**Request:**");
  lines.push("```");
  lines.push(`${ex.request.method} ${ex.request.path}`);
  if (ex.request.headers) {
    for (const [key, val] of Object.entries(ex.request.headers)) {
      lines.push(`${key}: ${val}`);
    }
  }
  if (ex.request.body) {
    lines.push("");
    lines.push(JSON.stringify(ex.request.body, null, 2));
  }
  lines.push("```");

  if (ex.response !== undefined) {
    lines.push("");
    lines.push("**Response:**");
    lines.push("```json");
    lines.push(JSON.stringify(ex.response, null, 2));
    lines.push("```");
  }

  return lines.join("\n");
}

function formatPattern(pattern: PatternDoc): string {
  const lines: string[] = [];

  lines.push(`### ${pattern.name}`);
  if (pattern.description) {
    lines.push("");
    lines.push(pattern.description);
  }
  lines.push("");
  lines.push("**Steps:**");
  for (const step of pattern.steps) {
    lines.push(step);
  }

  if (pattern.example) {
    lines.push("");
    lines.push("**Example:**");
    lines.push("```");
    lines.push(pattern.example);
    lines.push("```");
  }

  return lines.join("\n");
}

export function formatDocumentation(
  doc: TopicDoc,
  detailLevel: DetailLevel = "detailed",
  includeSchemas: boolean = true
): string {
  const sections: string[] = [];

  // Header
  sections.push(`# ${doc.title}`);
  sections.push("");
  sections.push(doc.description);

  // AI Hints (always include for AI optimization)
  if (doc.ai_hints) {
    sections.push("");
    sections.push("## AI Usage Hints");
    sections.push(doc.ai_hints);
  }

  // Endpoints
  if (doc.endpoints?.length) {
    sections.push("");
    sections.push("## Endpoints");
    for (const ep of doc.endpoints) {
      sections.push("");
      sections.push(formatEndpoint(ep, detailLevel));
    }
  }

  // Patterns/Workflows
  if (doc.patterns?.length) {
    sections.push("");
    sections.push("## Workflows");
    for (const pattern of doc.patterns) {
      sections.push("");
      sections.push(formatPattern(pattern));
    }
  }

  // Examples
  if ((detailLevel === "detailed" || detailLevel === "examples") && doc.examples?.length) {
    sections.push("");
    sections.push("## Examples");
    for (const ex of doc.examples) {
      sections.push("");
      sections.push(formatExample(ex));
    }
  }

  // Schemas
  if (includeSchemas && doc.schemas && Object.keys(doc.schemas).length > 0) {
    sections.push("");
    sections.push("## Schemas");
    sections.push("");
    sections.push("```json");
    sections.push(JSON.stringify(doc.schemas, null, 2));
    sections.push("```");
  }

  // Related topics
  if (doc.related_topics?.length) {
    sections.push("");
    sections.push("## Related Topics");
    sections.push(`Use \`api_docs\` with topic: ${doc.related_topics.join(", ")}`);
  }

  return sections.join("\n");
}
