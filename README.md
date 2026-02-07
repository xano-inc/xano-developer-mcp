# Xano Developer MCP

A Model Context Protocol (MCP) server that provides AI assistants with comprehensive documentation and tools for developing applications on the Xano Headless API platform.

## Overview

This MCP server acts as a bridge between AI models and Xano's developer ecosystem, offering:

- Complete Xano Headless API documentation
- XanoScript code validation and syntax checking
- XanoScript programming language documentation with examples
- Development workflows and best practices

## Quick Start

### Claude Code (Recommended)

```bash
claude mcp add xano-developer -- npx -y @xano/developer-mcp
```

That's it! The MCP server will be automatically installed and configured.

### Claude Desktop

Add to your Claude Desktop configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "xano-developer": {
      "command": "npx",
      "args": ["-y", "@xano/developer-mcp"]
    }
  }
}
```

## Checking Your Version

```bash
npx @xano/developer-mcp --version
```

If installed from source:

```bash
node dist/index.js --version
```

## Installation from Source

### Prerequisites

- Node.js (ES2022+ compatible)
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/xano-inc/xano-developer-mcp.git
cd xano-developer-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Running the Server

```bash
# Production
npm start

# Development (build + run)
npm run dev
```

The server communicates via stdio (standard input/output) using the JSON-RPC protocol, which is the standard transport for MCP servers.

### Source Install Configuration

If you installed from source, configure your MCP client to use the local build:

**Claude Code:**
```bash
claude mcp add xano-developer node /path/to/xano-developer-mcp/dist/index.js
```

**Claude Desktop:**
```json
{
  "mcpServers": {
    "xano-developer": {
      "command": "node",
      "args": ["/path/to/xano-developer-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

### 1. `api_docs`

Retrieves Xano Headless API documentation for specific resources.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `object` | string | No | Specific API resource to document |

**Available Objects:**
- `workspace` - Workspace management, branches, datasources, OpenAPI specs
- `table` - Database table schema management
- `api_group` - API groups and endpoints management
- `function` - Reusable function library
- `task` - Scheduled tasks (cron jobs)
- `middleware` - Request/response middleware
- `addon` - Response transformation queries
- `agent` - AI agent configuration
- `tool` - AI tool definitions for agents
- `mcp_server` - Model Context Protocol server management
- `realtime` - Realtime WebSocket channels
- `triggers` - Event-driven triggers
- `file` - File uploads and static hosting
- `history` - Request history and audit logs
- `authentication` - User authentication and session info

**Example:**
```
api_docs({ object: "workspace" })
```

### 2. `validate_xanoscript`

Validates XanoScript code for syntax errors. The language server auto-detects the object type from the code syntax.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | The XanoScript code to validate |

**Example:**
```
validate_xanoscript({
  code: "var:result = 1 + 2"
})
```

**Returns:** List of errors with line/column positions, or confirmation of validity.

### 3. `xanoscript_docs`

Retrieves XanoScript programming language documentation with context-aware support.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | No | Specific documentation topic to retrieve |
| `file_path` | string | No | File path being edited for context-aware docs (e.g., `apis/users/create.xs`) |
| `mode` | string | No | `full` (default) or `quick_reference` for compact syntax cheatsheet |

**Available Topics:**

| Topic | Description |
|-------|-------------|
| `readme` | XanoScript overview, workspace structure, and quick reference |
| `syntax` | Expressions, operators, and filters for all XanoScript code |
| `types` | Data types, input blocks, and validation |
| `tables` | Database schema definitions with indexes and relationships |
| `functions` | Reusable function stacks with inputs and responses |
| `apis` | HTTP endpoint definitions with authentication and CRUD patterns |
| `tasks` | Scheduled and cron jobs |
| `database` | All db.* operations: query, get, add, edit, patch, delete |
| `agents` | AI agent configuration with LLM providers and tools |
| `tools` | AI tools for agents and MCP servers |
| `mcp-servers` | MCP server definitions exposing tools |
| `testing` | Unit tests, mocks, and assertions |
| `integrations` | Cloud storage, Redis, security, and external APIs |
| `frontend` | Static frontend development and deployment |
| `ephemeral` | Temporary test environments |

**Examples:**
```
// Get overview
xanoscript_docs()

// Get specific topic
xanoscript_docs({ topic: "functions" })

// Context-aware: get all docs relevant to file being edited
xanoscript_docs({ file_path: "apis/users/create.xs" })

// Compact quick reference (uses less context)
xanoscript_docs({ topic: "database", mode: "quick_reference" })
```

### 4. `init_workspace`

Get comprehensive instructions for initializing a local Xano development workspace.

**Parameters:** None

**Returns:** Documentation on:
- Directory structure for local development
- File naming conventions
- Registry format for tracking changes
- Workflows for pulling/pushing XanoScript files via the Headless API

**Example:**
```
init_workspace()
```

## MCP Resources

The server also exposes XanoScript documentation as MCP resources for direct access:

| Resource URI | Description |
|--------------|-------------|
| `xanoscript://docs/readme` | Overview and quick reference |
| `xanoscript://docs/syntax` | Expressions, operators, and filters |
| `xanoscript://docs/types` | Data types and validation |
| `xanoscript://docs/tables` | Database schema definitions |
| `xanoscript://docs/functions` | Reusable function stacks |
| `xanoscript://docs/apis` | HTTP endpoint definitions |
| `xanoscript://docs/tasks` | Scheduled and cron jobs |
| `xanoscript://docs/database` | Database operations |
| `xanoscript://docs/agents` | AI agent configuration |
| `xanoscript://docs/tools` | AI tools for agents |
| `xanoscript://docs/mcp-servers` | MCP server definitions |
| `xanoscript://docs/testing` | Unit tests and mocks |
| `xanoscript://docs/integrations` | External service integrations |
| `xanoscript://docs/frontend` | Static frontend development |
| `xanoscript://docs/ephemeral` | Temporary test environments |

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `tsc` | Compile TypeScript to JavaScript |
| `start` | `node dist/index.js` | Run the MCP server |
| `dev` | `tsc && node dist/index.js` | Build and run in development |
| `sync-docs` | `npx ts-node scripts/sync-xanoscript-docs.ts` | Regenerate XanoScript documentation mapping |

## Project Structure

```
xano-developer-mcp/
├── src/
│   ├── index.ts              # Main MCP server implementation
│   ├── xanoscript.d.ts       # TypeScript declarations
│   └── templates/
│       ├── init-workspace.ts # Workspace initialization template
│       └── xanoscript-index.ts
├── dist/                      # Compiled JavaScript output
├── scripts/
│   └── sync-xanoscript-docs.ts  # Documentation sync script
├── api_docs/                  # Xano Headless API documentation (16 markdown files)
│   ├── index.md
│   ├── workspace.md
│   ├── table.md
│   └── ...
├── xanoscript_docs/           # XanoScript language documentation
│   ├── version.json
│   ├── README.md
│   ├── syntax.md
│   ├── functions.md
│   ├── apis.md
│   └── ...
├── package.json
└── tsconfig.json
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | ^1.26.0 | Official MCP SDK |
| `@xano/xanoscript-language-server` | ^11.6.3 | XanoScript parser and validation |
| `minimatch` | ^10.1.2 | Glob pattern matching for context-aware docs |

## How It Works

```
AI Client
    │
    ▼
MCP Protocol (JSON-RPC over stdio)
    │
    ▼
Xano Developer MCP Server
    │
    ├─► api_docs → Reads /api_docs/*.md files
    │
    ├─► validate_xanoscript → Parses code with XanoScript language server
    │
    ├─► xanoscript_docs → Context-aware docs from /xanoscript_docs/*.md
    │
    ├─► init_workspace → Returns workspace setup instructions
    │
    └─► MCP Resources → Direct access to documentation files
```

## Authentication

The MCP server itself does not require authentication. However, when using the documented APIs to interact with actual Xano services, you will need appropriate Xano Headless API credentials.

## Development

### Building

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Documentation Structure

The XanoScript documentation uses a file-based structure in `xanoscript_docs/`. The documentation mapping is configured in `src/index.ts` via the `XANOSCRIPT_DOCS_V2` constant, which defines:

- **file**: The markdown file containing the documentation
- **applyTo**: Glob patterns for context-aware matching (e.g., `apis/**/*.xs`)
- **description**: Human-readable description of the topic

## License

See [LICENSE](LICENSE) for details.
