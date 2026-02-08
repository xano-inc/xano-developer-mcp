/**
 * Template for xanoscript_docs index documentation
 * Edit this file to update the XanoScript documentation index
 *
 * NOTE: This template is currently unused. The actual documentation is served
 * directly from the XANOSCRIPT_DOCS_V2 config in index.ts.
 */

export interface XanoscriptIndexParams {
  version: string;
}

export function generateXanoscriptIndexTemplate(params: XanoscriptIndexParams): string {
  const { version } = params;

  return `# XanoScript Documentation Index
Version: ${version}

Use \`xanoscript_docs({ topic: "<topic>" })\` to retrieve documentation.

## Core Language
| Topic | Description |
|-------|-------------|
| \`syntax\` | Expressions, operators, filters, system variables |
| \`types\` | Data types, validation, input blocks |
| \`functions\` | Reusable function stacks, async, loops |
| \`schema\` | Runtime schema parsing and validation |

## Data
| Topic | Description |
|-------|-------------|
| \`tables\` | Database schema definitions with indexes and relationships |
| \`database\` | All db.* operations: query, get, add, edit, patch, delete |
| \`addons\` | Reusable subqueries for fetching related data |
| \`streaming\` | Streaming data from files, requests, and responses |

## APIs & Endpoints
| Topic | Description |
|-------|-------------|
| \`apis\` | HTTP endpoint definitions with authentication and CRUD patterns |
| \`tasks\` | Scheduled and cron jobs |
| \`triggers\` | Event-driven handlers (table, realtime, workspace, agent, MCP) |
| \`realtime\` | Real-time channels and events for push updates |

## AI & Agents
| Topic | Description |
|-------|-------------|
| \`agents\` | AI agent configuration with LLM providers and tools |
| \`tools\` | AI tools for agents and MCP servers |
| \`mcp-servers\` | MCP server definitions exposing tools |

## Integrations
| Topic | Description |
|-------|-------------|
| \`integrations\` | Cloud storage, Redis, security, and external APIs |

## Configuration
| Topic | Description |
|-------|-------------|
| \`workspace\` | Workspace-level settings: environment variables, preferences, realtime |
| \`branch\` | Branch-level settings: middleware, history retention, visual styling |
| \`middleware\` | Request/response interceptors for functions, queries, tasks, and tools |

## Development
| Topic | Description |
|-------|-------------|
| \`testing\` | Unit tests, mocks, and assertions |
| \`debugging\` | Logging, inspecting, and debugging XanoScript execution |
| \`frontend\` | Static frontend development and deployment |
| \`run\` | Run job and service configurations for the Xano Job Runner |

## Best Practices
| Topic | Description |
|-------|-------------|
| \`performance\` | Performance optimization best practices |
| \`security\` | Security best practices for authentication and authorization |
`;
}
