#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { xanoscriptParser } from "@xano/xanoscript-language-server/parser/parser.js";
import { getSchemeFromContent } from "@xano/xanoscript-language-server/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// XanoScript docs mapping - keyword to files
// Run `npm run sync-docs` to regenerate this from the docs directory
const XANOSCRIPT_DOCS: Record<string, string[]> = {
  // Core concepts (guideline + examples)
  agent: ["agent_guideline.md", "agent_examples.md"],
  api_query: ["api_query_guideline.md", "api_query_examples.md"],
  function: ["function_guideline.md", "function_examples.md"],
  mcp_server: ["mcp_server_guideline.md", "mcp_server_examples.md"],
  table: ["table_guideline.md", "table_examples.md"],
  task: ["task_guideline.md", "task_examples.md"],
  tool: ["tool_guideline.md", "tool_examples.md"],

  // Guideline only
  db_query: ["db_query_guideline.md"],
  ephemeral: ["ephemeral_environment_guideline.md"],
  expressions: ["expression_guideline.md"],
  frontend: ["frontend_guideline.md"],
  input: ["input_guideline.md"],
  testing: ["unit_testing_guideline.md"],

  // Workflows (AI agent development guides)
  workflow: ["AGENTS.md"],
  api_workflow: ["API_AGENTS.md"],
  function_workflow: ["FUNCTION_AGENTS.md"],
  table_workflow: ["TABLE_AGENTS.md"],
  task_workflow: ["TASK_AGENTS.md"],

  // Standalone reference docs
  lovable: ["build_from_lovable.md"],
  syntax: ["functions.md"],
  query_filter: ["query_filter.md"],
  tips: ["tips_and_tricks.md"],
  workspace: ["workspace.md"],
};

// Keyword aliases for convenience
const KEYWORD_ALIASES: Record<string, string> = {
  // api_query
  api: "api_query",
  apis: "api_query",
  endpoint: "api_query",
  endpoints: "api_query",
  query: "api_query",

  // function
  func: "function",
  functions: "function",

  // table
  tables: "table",
  schema: "table",
  schemas: "table",

  // task
  tasks: "task",
  cron: "task",
  scheduled: "task",

  // tool
  tools: "tool",

  // agent
  agents: "agent",
  ai_agent: "agent",

  // mcp_server
  mcp: "mcp_server",

  // syntax
  reference: "syntax",
  ref: "syntax",
  statements: "syntax",
  stack: "syntax",

  // expressions
  expr: "expressions",
  expression: "expressions",
  filters: "expressions",
  pipes: "expressions",
  operators: "expressions",

  // input
  inputs: "input",
  params: "input",
  parameters: "input",

  // db_query
  db: "db_query",
  database: "db_query",

  // query_filter
  filter: "query_filter",
  where: "query_filter",

  // workflow
  workflows: "workflow",
  dev: "workflow",
  development: "workflow",

  // testing
  test: "testing",
  tests: "testing",
  unit_test: "testing",

  // tips
  tip: "tips",
  tricks: "tips",

  // frontend
  ui: "frontend",
  static: "frontend",
};

// Object type configuration for workspace initialization
interface XanoObjectConfig {
  path: string;           // Directory path
  endpoint: string;       // API endpoint path segment
  extension: string;      // File extension
  hasXanoscript: boolean; // Whether the object has XanoScript content
  supportsNesting?: boolean; // For API groups with endpoints
}

const XANO_OBJECT_TYPES: Record<string, XanoObjectConfig> = {
  function: {
    path: "functions",
    endpoint: "function",
    extension: ".xs",
    hasXanoscript: true,
  },
  table: {
    path: "tables",
    endpoint: "table",
    extension: ".xs",
    hasXanoscript: true,
  },
  task: {
    path: "tasks",
    endpoint: "task",
    extension: ".xs",
    hasXanoscript: true,
  },
  api_group: {
    path: "apis",
    endpoint: "api-group",
    extension: ".xs",
    hasXanoscript: true,
    supportsNesting: true,
  },
  tool: {
    path: "tools",
    endpoint: "tool",
    extension: ".xs",
    hasXanoscript: true,
  },
  agent: {
    path: "agents",
    endpoint: "agent",
    extension: ".xs",
    hasXanoscript: true,
  },
  middleware: {
    path: "middlewares",
    endpoint: "middleware",
    extension: ".xs",
    hasXanoscript: true,
  },
  addon: {
    path: "addons",
    endpoint: "addon",
    extension: ".xs",
    hasXanoscript: true,
  },
  mcp_server: {
    path: "mcp_servers",
    endpoint: "mcp-server",
    extension: ".xs",
    hasXanoscript: true,
  },
  realtime_channel: {
    path: "realtime",
    endpoint: "realtime-channel",
    extension: ".xs",
    hasXanoscript: true,
  },
};

// Registry status types
type XanoStatus = "new" | "unchanged" | "changed" | "deleted";

interface RegistryRecord {
  id: number;
  type: string;
  name: string;
  path: string;
  sha256?: string;
  status: XanoStatus;
  original?: string; // Base64-encoded original content
  updated_at?: string;
}

interface WorkspaceRegistry {
  workspace_id: number;
  workspace_name: string;
  branch: string;
  base_url: string;
  created_at: string;
  updated_at: string;
  objects: RegistryRecord[];
}

// Generate init_workspace documentation
function generateInitWorkspaceDoc(): string {
  const objectTypesTable = Object.entries(XANO_OBJECT_TYPES)
    .map(([type, config]) => `| \`${type}\` | \`${config.path}/\` | \`${config.endpoint}\` |`)
    .join("\n");

  return `# Xano Workspace Initialization Guide

This guide explains how to set up a local development workspace that syncs with the Xano Headless API.

## Directory Structure

Initialize your workspace with these directories:

\`\`\`
your-project/
├── .xano/
│   └── registry.json      # Tracks all objects and their sync state
├── functions/             # Custom reusable functions
│   ├── calculate_total.xs
│   └── validate_email.xs
├── tables/                # Database table schemas
│   ├── user.xs
│   └── order.xs
├── tasks/                 # Scheduled background tasks
│   └── cleanup_sessions.xs
├── apis/                  # API groups and endpoints
│   └── auth/              # API group directory
│       ├── api_group.xs   # Group definition
│       ├── POST_login.xs  # Endpoint: POST /auth/login
│       └── GET_me.xs      # Endpoint: GET /auth/me
├── tools/                 # AI-callable tools
├── agents/                # AI agents
├── middlewares/           # Request/response middleware
├── addons/                # Query addons
├── mcp_servers/           # MCP servers
└── realtime/              # Realtime channels
\`\`\`

## Object Types

| Type | Directory | API Endpoint |
|------|-----------|--------------|
${objectTypesTable}

## File Naming Convention

Files should follow snake_case naming with the \`.xs\` extension:
- \`{name}.xs\` - Basic format (e.g., \`calculate_total.xs\`)
- \`{id}_{name}.xs\` - With ID prefix for disambiguation (e.g., \`42_calculate_total.xs\`)
- API endpoints: \`{VERB}_{path}.xs\` (e.g., \`POST_login.xs\`, \`GET_users_id.xs\`)

## Registry Format

The \`.xano/registry.json\` file tracks the sync state between local files and the Xano API:

\`\`\`json
{
  "workspace_id": 12345,
  "workspace_name": "My Project",
  "branch": "",
  "base_url": "https://your-instance.xano.io/api:headless",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "objects": [
    {
      "id": 1,
      "type": "function",
      "name": "calculate_total",
      "path": "functions/calculate_total.xs",
      "sha256": "abc123...",
      "status": "unchanged",
      "original": "ZnVuY3Rpb24gY2FsY3VsYXRlX3RvdGFsIHsgLi4uIH0=",
      "updated_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": 0,
      "type": "function",
      "name": "new_function",
      "path": "functions/new_function.xs",
      "status": "new"
    }
  ]
}
\`\`\`

### Registry Record Fields

| Field | Description |
|-------|-------------|
| \`id\` | Xano object ID (0 = new, not yet synced) |
| \`type\` | Object type (function, table, task, etc.) |
| \`name\` | Object name extracted from XanoScript |
| \`path\` | Relative file path from workspace root |
| \`sha256\` | SHA256 hash of file content for change detection |
| \`status\` | Sync status: "new", "unchanged", "changed", "deleted" |
| \`original\` | Base64-encoded original content (for conflict detection) |
| \`updated_at\` | Last sync timestamp |

### Status Values

| Status | Description |
|--------|-------------|
| \`new\` | Created locally, not yet pushed to Xano |
| \`unchanged\` | In sync with remote |
| \`changed\` | Modified locally since last sync |
| \`deleted\` | Marked for deletion (file removed locally) |

## Fetching Objects from the API

Use the Headless API to fetch objects. For detailed endpoint documentation, use \`api_docs({ object: "function" })\` etc.

### List Objects

\`\`\`
GET /workspace/{workspace_id}/{type}
Headers:
  Authorization: Bearer {token}

Query Parameters:
  - branch: Branch label (empty = live branch)
  - page: Page number (default: 1)
  - per_page: Items per page (default: 50, max: 10000)
  - search: Text search filter
  - sort: Sort field (created_at, updated_at, name)
  - order: asc or desc
\`\`\`

### Get Single Object with XanoScript

\`\`\`
GET /workspace/{workspace_id}/{type}/{id}
Headers:
  Authorization: Bearer {token}

Query Parameters:
  - branch: Branch label
\`\`\`

The response includes the \`xanoscript\` field with the code content:
\`\`\`json
{
  "id": 1,
  "name": "calculate_total",
  "xanoscript": {
    "status": "ok",
    "value": "function calculate_total { ... }"
  }
}
\`\`\`

## Pull Workflow

1. **Fetch object list** from API (paginated)
2. **For each object**, get the full definition including XanoScript
3. **Generate file path** based on type and name
4. **Write file** to the appropriate directory
5. **Update registry** with object metadata and SHA256 hash

### Example Pull Request Sequence

\`\`\`javascript
// 1. List all functions
const response = await fetch(
  \`\${baseUrl}/workspace/\${workspaceId}/function?branch=\${branch}&per_page=100\`,
  { headers: { Authorization: \`Bearer \${token}\` } }
);
const { items, nextPage } = await response.json();

// 2. For each function, save to file
for (const func of items) {
  const xanoscript = func.xanoscript?.value || '';
  const fileName = \`\${snakeCase(func.name)}.xs\`;
  const filePath = \`functions/\${fileName}\`;

  // Write file
  await writeFile(filePath, xanoscript);

  // Add to registry
  registry.objects.push({
    id: func.id,
    type: 'function',
    name: func.name,
    path: filePath,
    sha256: sha256(xanoscript),
    status: 'unchanged',
    original: btoa(xanoscript),
    updated_at: func.updated_at
  });
}
\`\`\`

## Push Workflow

1. **Read registry** to find changed/new objects
2. **For each changed file**, read content and detect changes
3. **Create or update** via API with XanoScript content
4. **Update registry** with new IDs and hashes

### Example Push Request

\`\`\`javascript
// Create new function
const response = await fetch(
  \`\${baseUrl}/workspace/\${workspaceId}/function?branch=\${branch}\`,
  {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'text/x-xanoscript'
    },
    body: xanoscriptContent
  }
);

// Update existing function
const response = await fetch(
  \`\${baseUrl}/workspace/\${workspaceId}/function/\${functionId}?publish=true\`,
  {
    method: 'PUT',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'text/x-xanoscript'
    },
    body: xanoscriptContent
  }
);
\`\`\`

## API Documentation References

For detailed API documentation on each object type, use:

- \`api_docs()\` - Overview of all endpoints
- \`api_docs({ object: "workspace" })\` - Workspace management
- \`api_docs({ object: "function" })\` - Functions API
- \`api_docs({ object: "table" })\` - Tables API
- \`api_docs({ object: "task" })\` - Tasks API
- \`api_docs({ object: "api_group" })\` - API groups and endpoints
- \`api_docs({ object: "agent" })\` - AI agents
- \`api_docs({ object: "tool" })\` - AI tools
- \`api_docs({ object: "authentication" })\` - Auth and user info

## XanoScript Documentation References

For writing XanoScript code, use:

- \`xanoscript_docs()\` - Full documentation index
- \`xanoscript_docs({ keyword: "function" })\` - Function syntax
- \`xanoscript_docs({ keyword: "table" })\` - Table schema syntax
- \`xanoscript_docs({ keyword: "api_query" })\` - API endpoint syntax
- \`xanoscript_docs({ keyword: "syntax" })\` - Language reference

## Validating XanoScript

Before pushing changes, validate the XanoScript syntax:

\`\`\`
validate_xanoscript({ code: "function foo { ... }" })
\`\`\`

This will check for syntax errors and return line/column positions for any issues.
`;
}

// Map of object names to their documentation files
const DOCS_MAP: Record<string, string> = {
  workspace: "workspace.md",
  table: "table.md",
  api_group: "api_group.md",
  function: "function.md",
  task: "task.md",
  middleware: "middleware.md",
  addon: "addon.md",
  agent: "agent.md",
  tool: "tool.md",
  mcp_server: "mcp_server.md",
  realtime: "realtime.md",
  triggers: "triggers.md",
  file: "file.md",
  history: "history.md",
  authentication: "authentication.md",
};

// Get the api_docs directory path
function getDocsPath(): string {
  // In development, look relative to src
  // In production (after build), look relative to dist
  const possiblePaths = [
    join(__dirname, "..", "api_docs"),
    join(__dirname, "..", "..", "api_docs"),
  ];

  for (const p of possiblePaths) {
    try {
      readFileSync(join(p, "index.md"));
      return p;
    } catch {
      continue;
    }
  }

  return join(__dirname, "..", "api_docs");
}

const DOCS_PATH = getDocsPath();

// Get the xanoscript_docs directory path
function getXanoscriptDocsPath(): string {
  const possiblePaths = [
    join(__dirname, "..", "xanoscript_docs"),
    join(__dirname, "..", "..", "xanoscript_docs"),
  ];

  for (const p of possiblePaths) {
    try {
      readFileSync(join(p, "version.json"));
      return p;
    } catch {
      continue;
    }
  }

  return join(__dirname, "..", "xanoscript_docs");
}

const XANOSCRIPT_DOCS_PATH = getXanoscriptDocsPath();

function readDocumentation(object?: string): string {
  try {
    if (!object) {
      // Return index documentation
      return readFileSync(join(DOCS_PATH, "index.md"), "utf-8");
    }

    const normalizedObject = object.toLowerCase().trim();

    // Check if the object exists in our map
    if (normalizedObject in DOCS_MAP) {
      const filePath = join(DOCS_PATH, DOCS_MAP[normalizedObject]);
      return readFileSync(filePath, "utf-8");
    }

    // Try to find a partial match
    const matchingKey = Object.keys(DOCS_MAP).find(
      (key) =>
        key.includes(normalizedObject) || normalizedObject.includes(key)
    );

    if (matchingKey) {
      const filePath = join(DOCS_PATH, DOCS_MAP[matchingKey]);
      return readFileSync(filePath, "utf-8");
    }

    // Return error message with available options
    const availableObjects = Object.keys(DOCS_MAP).join(", ");
    return `Error: Unknown object "${object}". Available objects: ${availableObjects}

Use api_docs() without parameters to see the full documentation index.`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error reading documentation: ${errorMessage}`;
  }
}

// Read XanoScript documentation version
function getXanoscriptDocsVersion(): string {
  try {
    const versionFile = readFileSync(
      join(XANOSCRIPT_DOCS_PATH, "version.json"),
      "utf-8"
    );
    return JSON.parse(versionFile).version || "unknown";
  } catch {
    return "unknown";
  }
}

// Generate the XanoScript documentation index
function generateXanoscriptIndex(): string {
  const version = getXanoscriptDocsVersion();

  // Build alias lookup (keyword -> aliases)
  const aliasLookup: Record<string, string[]> = {};
  for (const [alias, keyword] of Object.entries(KEYWORD_ALIASES)) {
    aliasLookup[keyword] = aliasLookup[keyword] || [];
    aliasLookup[keyword].push(alias);
  }

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
${formatRow("frontend", "Frontend development with Xano")}
${formatRow("lovable", "Building from Lovable-generated websites")}
${formatRow("testing", "Unit testing XanoScript code")}
${formatRow("tips", "Tips and tricks")}
${formatRow("ephemeral", "Ephemeral environment setup")}
`;
}

// Read XanoScript documentation for a keyword
function readXanoscriptDocs(keyword?: string): string {
  try {
    if (!keyword) {
      return generateXanoscriptIndex();
    }

    const normalizedKeyword = keyword.toLowerCase().trim();

    // Check for alias first
    const resolvedKeyword =
      KEYWORD_ALIASES[normalizedKeyword] || normalizedKeyword;

    // Check if keyword exists
    if (!(resolvedKeyword in XANOSCRIPT_DOCS)) {
      // Try partial match
      const matchingKey = Object.keys(XANOSCRIPT_DOCS).find(
        (key) =>
          key.includes(resolvedKeyword) || resolvedKeyword.includes(key)
      );

      if (matchingKey) {
        return readXanoscriptDocs(matchingKey);
      }

      const availableKeywords = Object.keys(XANOSCRIPT_DOCS).join(", ");
      return `Error: Unknown keyword "${keyword}". Available keywords: ${availableKeywords}

Use xanoscript_docs() without parameters to see the full documentation index.`;
    }

    const files = XANOSCRIPT_DOCS[resolvedKeyword];
    const version = getXanoscriptDocsVersion();

    // Read and concatenate all files for this keyword
    const contents: string[] = [];
    contents.push(`# XanoScript: ${resolvedKeyword}`);
    contents.push(`Documentation version: ${version}\n`);

    for (const file of files) {
      const filePath = join(XANOSCRIPT_DOCS_PATH, file);
      try {
        const content = readFileSync(filePath, "utf-8");
        contents.push(`---\n## Source: ${file}\n---\n`);
        contents.push(content);
      } catch (err) {
        contents.push(`\n[Error reading ${file}: file not found]\n`);
      }
    }

    return contents.join("\n");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error reading XanoScript documentation: ${errorMessage}`;
  }
}

// Create the MCP server
const server = new Server(
  {
    name: "xano-developer-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "api_docs",
        description:
          "Get Xano Headless API documentation. Returns documentation for interacting with the Xano Headless API using XanoScript. Use without parameters for an overview, or specify an object for detailed documentation.",
        inputSchema: {
          type: "object",
          properties: {
            object: {
              type: "string",
              description: `Optional: The specific API object to get documentation for. Available values: ${Object.keys(DOCS_MAP).join(", ")}`,
            },
          },
          required: [],
        },
      },
      {
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
      },
      {
        name: "xanoscript_docs",
        description:
          "Get XanoScript programming language documentation for AI code generation. " +
          "Call without a keyword to see the full index of available topics. " +
          "Use a keyword to retrieve specific documentation (guidelines + examples).",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description:
                "Documentation topic to retrieve. " +
                "Core: function, api_query (or 'api'), table, task, tool, agent, mcp_server. " +
                "Reference: syntax (or 'ref'), expressions (or 'expr'), input, db_query (or 'db'). " +
                "Workflow: workflow, function_workflow, api_workflow, table_workflow, task_workflow. " +
                "Omit for the full documentation index.",
            },
          },
          required: [],
        },
      },
      {
        name: "init_workspace",
        description:
          "Get comprehensive instructions for initializing a local Xano development workspace. " +
          "Returns documentation on directory structure, file naming conventions, registry format for tracking changes, " +
          "and workflows for pulling/pushing XanoScript files via the Headless API. " +
          "Use this when setting up local development for Xano projects.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "api_docs") {
    const args = request.params.arguments as { object?: string } | undefined;
    const object = args?.object;
    const documentation = readDocumentation(object);

    return {
      content: [
        {
          type: "text",
          text: documentation,
        },
      ],
    };
  }

  if (request.params.name === "validate_xanoscript") {
    const args = request.params.arguments as {
      code: string;
    };

    if (!args?.code) {
      return {
        content: [
          {
            type: "text",
            text: "Error: 'code' parameter is required",
          },
        ],
        isError: true,
      };
    }

    try {
      const text = args.code;
      const scheme = getSchemeFromContent(text);
      const parser = xanoscriptParser(text, scheme);

      if (parser.errors.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "✓ XanoScript is valid. No syntax errors found.",
            },
          ],
        };
      }

      // Convert parser errors to diagnostics with line/column info
      const diagnostics = parser.errors.map((error) => {
        const startOffset = error.token?.startOffset ?? 0;
        const endOffset = error.token?.endOffset ?? 5;

        // Calculate line and character positions from offset
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
      });

      // Format errors for readable output
      const errorMessages = diagnostics.map((d, i) => {
        const location = `Line ${d.range.start.line + 1}, Column ${d.range.start.character + 1}`;
        return `${i + 1}. [${location}] ${d.message}`;
      });

      return {
        content: [
          {
            type: "text",
            text: `Found ${diagnostics.length} error(s):\n\n${errorMessages.join("\n")}`,
          },
        ],
        isError: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Validation error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === "xanoscript_docs") {
    const args = request.params.arguments as { keyword?: string } | undefined;
    const keyword = args?.keyword;
    const documentation = readXanoscriptDocs(keyword);

    return {
      content: [
        {
          type: "text",
          text: documentation,
        },
      ],
    };
  }

  if (request.params.name === "init_workspace") {
    const documentation = generateInitWorkspaceDoc();

    return {
      content: [
        {
          type: "text",
          text: documentation,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${request.params.name}`,
      },
    ],
    isError: true,
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Xano Developer MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
