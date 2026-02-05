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

Retrieves XanoScript programming language documentation.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | No | Documentation topic to retrieve |

**Supported Keywords:**

| Category | Keywords |
|----------|----------|
| Core Concepts | `function`, `api_query`, `table`, `task`, `tool`, `agent`, `mcp_server` |
| Language Reference | `syntax`, `expressions`, `input`, `db_query`, `query_filter` |
| Workflows | `workflow`, `function_workflow`, `api_workflow`, `table_workflow`, `task_workflow` |
| Special Topics | `frontend`, `lovable`, `testing`, `tips`, `ephemeral` |

**Aliases:** The tool supports keyword aliases for convenience:
- `api`, `apis`, `query`, `endpoint` → `api_query`
- `func` → `function`
- `db` → `db_query`

**Example:**
```
xanoscript_docs({ keyword: "function" })
```

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
│   └── xanoscript.d.ts       # TypeScript declarations
├── dist/                      # Compiled JavaScript output
├── scripts/
│   └── sync-xanoscript-docs.ts  # Documentation sync script
├── api_docs/                  # Xano API documentation (16 markdown files)
│   ├── index.md
│   ├── workspace.md
│   ├── table.md
│   └── ...
├── xanoscript_docs/           # XanoScript language documentation
│   ├── version.json
│   ├── function_guideline.md
│   ├── function_examples.md
│   └── ...
├── package.json
└── tsconfig.json
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | 1.26.0 | Official MCP SDK |
| `@xano/xanoscript-language-server` | 11.6.3 | XanoScript parser and validation |

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
    └─► xanoscript_docs → Reads external XanoScript documentation
```

## Authentication

The MCP server itself does not require authentication. However, when using the documented APIs to interact with actual Xano services, you will need appropriate Xano Headless API credentials.

## Development

### Syncing Documentation

If the XanoScript documentation source changes, regenerate the mapping:

```bash
npm run sync-docs
```

This scans the xanoscript-ai-documentation directory and updates the documentation mapping in the server.

### Building

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

## License

See [LICENSE](LICENSE) for details.
