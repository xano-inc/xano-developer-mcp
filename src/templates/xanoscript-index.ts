/**
 * Template for xanoscript_docs index documentation
 * Edit this file to update the XanoScript documentation index
 */

export interface XanoscriptIndexParams {
  version: string;
  aliasLookup: Record<string, string[]>;
}

export function generateXanoscriptIndexTemplate(params: XanoscriptIndexParams): string {
  const { version, aliasLookup } = params;

  const formatRow = (keyword: string, description: string) => {
    const aliases = aliasLookup[keyword]?.slice(0, 3).join(", ") || "";
    return `| \`${keyword}\` | ${aliases ? aliases : "-"} | ${description} |`;
  };

  return `# XanoScript Documentation Index
Version: ${version}

Use \`xanoscript_docs\` with a keyword to retrieve documentation.

## Core Concepts
These return guidelines + examples for writing XanoScript code.

| Keyword | Aliases | Description |
|---------|---------|-------------|
${formatRow("function", "Custom reusable functions in `functions/`")}
${formatRow("api_query", "HTTP API endpoints in `apis/`")}
${formatRow("table", "Database table schemas in `tables/`")}
${formatRow("task", "Scheduled background tasks in `tasks/`")}
${formatRow("triggers", "Event-driven handlers in `triggers/`")}
${formatRow("tool", "AI-callable tools in `tools/`")}
${formatRow("agent", "AI agents in `agents/`")}
${formatRow("mcp_server", "MCP servers in `mcp_servers/`")}

## Language Reference
Core syntax and operators.

| Keyword | Aliases | Description |
|---------|---------|-------------|
${formatRow("syntax", "Complete XanoScript syntax (stack, var, conditional, foreach, etc.)")}
${formatRow("expressions", "Pipe operators and filters (string, math, array, date)")}
${formatRow("input", "Input definition syntax (types, filters, validation)")}
${formatRow("db_query", "Database query patterns (query, add, edit, delete)")}
${formatRow("query_filter", "WHERE clause and filter syntax")}

## Development Workflows
AI agent development strategies and phases.

| Keyword | Aliases | Description |
|---------|---------|-------------|
${formatRow("workflow", "Overall XanoScript development workflow")}
${formatRow("function_workflow", "AI workflow for creating functions")}
${formatRow("api_workflow", "AI workflow for creating API endpoints")}
${formatRow("table_workflow", "AI workflow for creating tables")}
${formatRow("task_workflow", "AI workflow for creating tasks")}

## Specialized Topics

| Keyword | Aliases | Description |
|---------|---------|-------------|
${formatRow("addons", "Reusable subqueries for related data")}
${formatRow("debugging", "Logging and debugging tools")}
${formatRow("frontend", "Frontend development with Xano")}
${formatRow("lovable", "Building from Lovable-generated websites")}
${formatRow("performance", "Performance optimization best practices")}
${formatRow("realtime", "Real-time channels and events")}
${formatRow("schema", "Runtime schema parsing and validation")}
${formatRow("security", "Security best practices")}
${formatRow("streaming", "Streaming data from files and responses")}
${formatRow("testing", "Unit testing XanoScript code")}
${formatRow("tips", "Tips and tricks")}
${formatRow("run", "Run job and service configurations")}
`;
}
