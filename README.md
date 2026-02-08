# Xano Developer MCP

[![npm version](https://img.shields.io/npm/v/@xano/developer-mcp.svg)](https://www.npmjs.com/package/@xano/developer-mcp)

An MCP server that provides AI assistants with comprehensive documentation and tools for developing applications on [Xano](https://xano.com).

[Xano](https://xano.com) is the fastest way to build a scalable backend for your app — no code required. Build APIs, manage databases, and deploy instantly.

**Xano Resources:** [Website](https://xano.com) | [Documentation](https://docs.xano.com/) | [Blog](https://www.xano.com/blog/) | [Community](https://community.xano.com/)

**Available on npm:** [@xano/developer-mcp](https://www.npmjs.com/package/@xano/developer-mcp)

## Overview

This MCP server acts as a bridge between AI models and Xano's developer ecosystem, offering:

- **Meta API Documentation** - Programmatically manage Xano workspaces, databases, APIs, functions, and more
- **Run API Documentation** - Runtime execution, session management, and XanoScript execution
- **XanoScript Documentation** - Language reference with context-aware docs based on file type
- **Code Validation** - Syntax checking with the official XanoScript language server
- **Workflow Guides** - Step-by-step guides for common development tasks

## Quick Start

### Claude Code (Recommended)

```bash
claude mcp add xano-developer -- npx -y @xano/developer-mcp
```

That's it! The MCP server will be automatically installed and configured.

### Install via npm

You can also install the package globally from npm:

```bash
npm install -g @xano/developer-mcp
```

Then add to Claude Code:

```bash
claude mcp add xano-developer -- xano-developer-mcp
```

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

### 1. `validate_xanoscript`

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

### 2. `xanoscript_docs`

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
| `triggers` | Event-driven handlers (table, realtime, workspace, agent, MCP) |
| `database` | All db.* operations: query, get, add, edit, patch, delete |
| `agents` | AI agent configuration with LLM providers and tools |
| `tools` | AI tools for agents and MCP servers |
| `mcp-servers` | MCP server definitions exposing tools |
| `testing` | Unit tests, mocks, and assertions |
| `integrations` | Cloud storage, Redis, security, and external APIs |
| `frontend` | Static frontend development and deployment |
| `run` | Run job and service configurations |
| `addons` | Reusable subqueries for fetching related data |
| `debugging` | Logging, inspecting, and debugging XanoScript execution |
| `performance` | Performance optimization best practices |
| `realtime` | Real-time channels and events for push updates |
| `schema` | Runtime schema parsing and validation |
| `security` | Security best practices for authentication and authorization |
| `streaming` | Streaming data from files, requests, and responses |

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

### 3. `run_api_docs`

Get documentation for Xano's Run API. Use this to understand runtime execution, session management, and XanoScript execution.

**Important:** The Run API uses a fixed base URL: `https://app.dev.xano.com/api:run/<endpoint>` (NOT your Xano instance URL)

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Documentation topic to retrieve |
| `detail_level` | string | No | `overview`, `detailed` (default), or `examples` |
| `include_schemas` | boolean | No | Include JSON schemas for requests/responses (default: true) |

**Available Topics:**

| Topic | Description |
|-------|-------------|
| `start` | Getting started with the Run API |
| `run` | Execute XanoScript code and API endpoints |
| `session` | Session management for stateful execution |
| `history` | Execution history and debugging |
| `data` | Data operations and variable management |
| `workflows` | Step-by-step workflow guides |

**Examples:**
```
// Get overview of Run API
run_api_docs({ topic: "start" })

// Get detailed run endpoint documentation
run_api_docs({ topic: "run", detail_level: "detailed" })

// Get examples without schemas (smaller context)
run_api_docs({ topic: "session", detail_level: "examples", include_schemas: false })

// Step-by-step workflow guides
run_api_docs({ topic: "workflows" })
```

### 4. `mcp_version`

Get the current version of the Xano Developer MCP server.

**Parameters:** None

**Returns:** The version string from package.json.

**Example:**
```
mcp_version()
```

### 5. `meta_api_docs`

Get documentation for Xano's Meta API. Use this to understand how to programmatically manage Xano workspaces, databases, APIs, functions, agents, and more.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Documentation topic to retrieve |
| `detail_level` | string | No | `overview`, `detailed` (default), or `examples` |
| `include_schemas` | boolean | No | Include JSON schemas for requests/responses (default: true) |

**Available Topics:**

| Topic | Description |
|-------|-------------|
| `start` | Getting started with the Meta API |
| `authentication` | API authentication and authorization |
| `workspace` | Workspace management endpoints |
| `apigroup` | API group operations |
| `api` | API endpoint management |
| `table` | Database table operations |
| `function` | Function management |
| `task` | Scheduled task operations |
| `agent` | AI agent configuration |
| `tool` | AI tool management |
| `mcp_server` | MCP server endpoints |
| `middleware` | Middleware configuration |
| `branch` | Branch management |
| `realtime` | Real-time channel operations |
| `file` | File management |
| `history` | Version history |
| `workflows` | Step-by-step workflow guides |

**Examples:**
```
// Get overview of Meta API
meta_api_docs({ topic: "start" })

// Get detailed table documentation
meta_api_docs({ topic: "table", detail_level: "detailed" })

// Get examples without schemas (smaller context)
meta_api_docs({ topic: "api", detail_level: "examples", include_schemas: false })

// Step-by-step workflow guides
meta_api_docs({ topic: "workflows" })
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
| `xanoscript://docs/triggers` | Event-driven handlers |
| `xanoscript://docs/database` | Database operations |
| `xanoscript://docs/agents` | AI agent configuration |
| `xanoscript://docs/tools` | AI tools for agents |
| `xanoscript://docs/mcp-servers` | MCP server definitions |
| `xanoscript://docs/testing` | Unit tests and mocks |
| `xanoscript://docs/integrations` | External service integrations |
| `xanoscript://docs/frontend` | Static frontend development |
| `xanoscript://docs/run` | Run job and service configurations |
| `xanoscript://docs/addons` | Reusable subqueries for related data |
| `xanoscript://docs/debugging` | Logging and debugging tools |
| `xanoscript://docs/performance` | Performance optimization |
| `xanoscript://docs/realtime` | Real-time channels and events |
| `xanoscript://docs/schema` | Runtime schema parsing |
| `xanoscript://docs/security` | Security best practices |
| `xanoscript://docs/streaming` | Data streaming operations |

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `tsc` | Compile TypeScript to JavaScript |
| `start` | `node dist/index.js` | Run the MCP server |
| `dev` | `tsc && node dist/index.js` | Build and run in development |

## Project Structure

```
xano-developer-mcp/
├── src/
│   ├── index.ts              # Main MCP server implementation
│   ├── xanoscript.d.ts       # TypeScript declarations
│   ├── meta_api_docs/        # Meta API documentation
│   │   ├── index.ts          # API docs tool handler
│   │   ├── types.ts          # Type definitions
│   │   ├── format.ts         # Documentation formatter
│   │   └── topics/           # Individual topic modules
│   ├── run_api_docs/         # Run API documentation
│   │   ├── index.ts          # Run API tool handler
│   │   ├── format.ts         # Documentation formatter
│   │   └── topics/           # Individual topic modules
│   ├── xanoscript_docs/      # XanoScript language documentation
│   │   ├── version.json
│   │   ├── README.md
│   │   ├── syntax.md
│   │   └── ...
│   └── templates/
│       └── xanoscript-index.ts
├── dist/                      # Compiled JavaScript output
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
    ├─► validate_xanoscript → Parses code with XanoScript language server
    │
    ├─► xanoscript_docs → Context-aware docs from /xanoscript_docs/*.md
    │
    ├─► meta_api_docs → Meta API documentation with detail levels
    │
    ├─► run_api_docs → Run API documentation for runtime execution
    │
    ├─► mcp_version → Returns server version from package.json
    │
    └─► MCP Resources → Direct access to XanoScript documentation
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

**XanoScript Documentation** (`src/xanoscript_docs/`):
- Markdown files for XanoScript language reference
- Configured in `src/index.ts` via `XANOSCRIPT_DOCS_V2` with:
  - **file**: The markdown file containing the documentation
  - **applyTo**: Glob patterns for context-aware matching (e.g., `apis/**/*.xs`)
  - **description**: Human-readable description of the topic

**Meta API Documentation** (`src/meta_api_docs/`):
- TypeScript modules with structured documentation
- Supports parameterized output (detail levels, schema inclusion)
- Better for AI consumption due to context efficiency

## License

See [LICENSE](LICENSE) for details.
