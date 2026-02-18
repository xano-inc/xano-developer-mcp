<div align="center">

# 🚀 Xano Developer MCP

**Supercharge your AI with the power of Xano**

[![npm version](https://img.shields.io/npm/v/@xano/developer-mcp.svg)](https://www.npmjs.com/package/@xano/developer-mcp)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

🤖 **AI-Powered** · 📚 **Comprehensive Docs** · ⚡ **Instant Setup** · 🔧 **Built-in Tools**

---

</div>

An MCP server and standalone library that gives AI assistants superpowers for developing on [Xano](https://xano.com) — complete with documentation, code validation, and workflow guides. Use it as an MCP server or import the tools directly in your own applications.

> 💡 **What's Xano?** The fastest way to build a scalable backend for your app — no code required. Build APIs, manage databases, and deploy instantly.

### 🔗 Quick Links

| 🌐 [Website](https://xano.com) | 📖 [Docs](https://docs.xano.com/) | 📝 [Blog](https://www.xano.com/blog/) | 💬 [Community](https://community.xano.com/) | 📦 [npm](https://www.npmjs.com/package/@xano/developer-mcp) |
|:---:|:---:|:---:|:---:|:---:|

## Overview

This MCP server acts as a bridge between AI models and Xano's developer ecosystem, offering:

- **Meta API Documentation** - Programmatically manage Xano workspaces, databases, APIs, functions, and more
- **Run API Documentation** - Runtime execution, session management, and XanoScript execution
- **CLI Documentation** - Command-line interface for local development, code sync, and execution
- **XanoScript Documentation** - Language reference with context-aware docs based on file type
- **Code Validation** - Syntax checking with the official XanoScript language server
- **Workflow Guides** - Step-by-step guides for common development tasks

## Quick Start

### Claude Code (Recommended)

```bash
claude mcp add xano -- npx -y @xano/developer-mcp
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

## Library Usage

In addition to using this package as an MCP server, you can import and use the tools directly in your own applications.

### Installation

```bash
npm install @xano/developer-mcp
```

### Importing Tools

```typescript
import {
  validateXanoscript,
  xanoscriptDocs,
  metaApiDocs,
  runApiDocs,
  cliDocs,
  mcpVersion
} from '@xano/developer-mcp';
```

### Validate XanoScript Code

```typescript
import { validateXanoscript } from '@xano/developer-mcp';

const result = validateXanoscript({ code: 'var:result = 1 + 2' });

if (result.valid) {
  console.log('Code is valid!');
} else {
  console.log('Validation errors:');
  result.errors.forEach(error => {
    console.log(`  Line ${error.range.start.line + 1}: ${error.message}`);
  });
}
```

### Get XanoScript Documentation

```typescript
import { xanoscriptDocs } from '@xano/developer-mcp';

// Get overview (README)
const overview = xanoscriptDocs();
console.log(overview.documentation);

// Get specific topic
const syntaxDocs = xanoscriptDocs({ topic: 'syntax' });

// Get context-aware docs for a file path
const apiDocs = xanoscriptDocs({ file_path: 'api/users/create_post.xs' });

// Get compact quick reference
const quickRef = xanoscriptDocs({ topic: 'database', mode: 'quick_reference' });
```

### Get Meta API Documentation

```typescript
import { metaApiDocs } from '@xano/developer-mcp';

// Get overview
const overview = metaApiDocs({ topic: 'start' });

// Get detailed documentation with examples
const workspaceDocs = metaApiDocs({
  topic: 'workspace',
  detail_level: 'examples',
  include_schemas: true
});

console.log(workspaceDocs.documentation);
```

### Get Run API Documentation

```typescript
import { runApiDocs } from '@xano/developer-mcp';

const sessionDocs = runApiDocs({
  topic: 'session',
  detail_level: 'detailed'
});

console.log(sessionDocs.documentation);
```

### Get CLI Documentation

```typescript
import { cliDocs } from '@xano/developer-mcp';

const cliSetup = cliDocs({ topic: 'start' });
console.log(cliSetup.documentation);
```

### Get Package Version

```typescript
import { mcpVersion } from '@xano/developer-mcp';

const { version } = mcpVersion();
console.log(`Using version ${version}`);
```

### Available Exports

| Export | Description |
|--------|-------------|
| `validateXanoscript` | Validate XanoScript code and get detailed error information |
| `xanoscriptDocs` | Get XanoScript language documentation |
| `metaApiDocs` | Get Meta API documentation |
| `runApiDocs` | Get Run API documentation |
| `cliDocs` | Get CLI documentation |
| `mcpVersion` | Get the package version |
| `toolDefinitions` | MCP tool definitions (for building custom MCP servers) |
| `handleTool` | Tool dispatcher function (for building custom MCP servers) |

### TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  ValidateXanoscriptArgs,
  ValidationResult,
  ParserDiagnostic,
  XanoscriptDocsArgs,
  MetaApiDocsArgs,
  RunApiDocsArgs,
  CliDocsArgs,
  ToolResult
} from '@xano/developer-mcp';
```

### Package Entry Points

The package provides multiple entry points:

```typescript
// Main library entry (recommended)
import { validateXanoscript } from '@xano/developer-mcp';

// Tools module directly
import { validateXanoscript } from '@xano/developer-mcp/tools';

// Server module (for extending the MCP server)
import '@xano/developer-mcp/server';
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
| `file_path` | string | No | File path being edited for context-aware docs (e.g., `api/users/create_post.xs`) |
| `mode` | string | No | `full` (default) or `quick_reference` for compact syntax cheatsheet |

**Available Topics:**

| Topic | Description |
|-------|-------------|
| `readme` | XanoScript overview, workspace structure, and quick reference |
| `cheatsheet` | Quick reference for 20 most common XanoScript patterns (recommended first stop) |
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
| `unit-testing` | Unit tests, mocks, and assertions within functions, APIs, and middleware |
| `workflow-tests` | End-to-end workflow tests with data sources and tags |
| `integrations` | External service integrations index |
| `integrations/cloud-storage` | AWS S3, Azure Blob, and GCP Storage |
| `integrations/search` | Elasticsearch, OpenSearch, and Algolia |
| `integrations/redis` | Redis caching, rate limiting, and queues |
| `integrations/external-apis` | HTTP requests with api.request |
| `integrations/utilities` | Local storage, email, zip, and Lambda |
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

// Get quick reference cheatsheet (recommended first stop)
xanoscript_docs({ topic: "cheatsheet" })

// Get specific topic
xanoscript_docs({ topic: "functions" })

// Context-aware: get all docs relevant to file being edited
xanoscript_docs({ file_path: "api/users/create_post.xs" })

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

### 6. `cli_docs`

Get documentation for the Xano CLI. The CLI is **optional but recommended** for local development workflows. Not all users will have it installed.

- **npm:** https://www.npmjs.com/package/@xano/cli
- **GitHub:** https://github.com/xano-inc/cli

Use this tool to understand CLI commands for local development, code synchronization, and XanoScript execution.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Documentation topic to retrieve |
| `detail_level` | string | No | `overview`, `detailed` (default), or `examples` |

**Available Topics:**

| Topic | Description |
|-------|-------------|
| `start` | Getting started with the CLI - installation and setup |
| `profile` | Profile management - credentials and multi-environment setup |
| `workspace` | Workspace operations - pull/push code sync |
| `function` | Function management - list, get, create, edit |
| `run` | Run API commands - execute code, manage projects/sessions |
| `static_host` | Static hosting - deploy frontend builds |
| `integration` | CLI + Meta API integration guide - when to use each |

**Examples:**
```
// Get CLI setup guide
cli_docs({ topic: "start" })

// Learn when to use CLI vs Meta API
cli_docs({ topic: "integration" })

// Get workspace sync commands
cli_docs({ topic: "workspace", detail_level: "detailed" })

// Profile management with examples
cli_docs({ topic: "profile", detail_level: "examples" })
```

## MCP Resources

The server also exposes XanoScript documentation as MCP resources for direct access:

| Resource URI | Description |
|--------------|-------------|
| `xanoscript://docs/readme` | Overview and quick reference |
| `xanoscript://docs/cheatsheet` | Quick reference for 20 most common patterns |
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
| `xanoscript://docs/unit-testing` | Unit tests and mocks |
| `xanoscript://docs/workflow-tests` | End-to-end workflow tests |
| `xanoscript://docs/integrations` | External service integrations index |
| `xanoscript://docs/integrations/cloud-storage` | AWS S3, Azure Blob, GCP Storage |
| `xanoscript://docs/integrations/search` | Elasticsearch, OpenSearch, Algolia |
| `xanoscript://docs/integrations/redis` | Redis caching and queues |
| `xanoscript://docs/integrations/external-apis` | HTTP requests with api.request |
| `xanoscript://docs/integrations/utilities` | Email, zip, Lambda utilities |
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
| `test` | `vitest run` | Run unit tests |
| `test:watch` | `vitest` | Run tests in watch mode |
| `test:coverage` | `vitest run --coverage` | Run tests with coverage report |

## Project Structure

```
xano-developer-mcp/
├── src/
│   ├── index.ts                        # MCP server entry point
│   ├── lib.ts                          # Library entry point (for npm imports)
│   ├── xanoscript.ts                   # XanoScript documentation logic
│   ├── xanoscript.test.ts              # Tests for xanoscript module
│   ├── xanoscript-language-server.d.ts # TypeScript declarations
│   ├── tools/                          # Standalone tool modules
│   │   ├── index.ts                    # Unified tool exports
│   │   ├── types.ts                    # Common types (ToolResult)
│   │   ├── validate_xanoscript.ts      # XanoScript validation tool
│   │   ├── xanoscript_docs.ts          # XanoScript docs tool
│   │   ├── mcp_version.ts              # Version tool
│   │   ├── meta_api_docs.ts            # Meta API docs tool wrapper
│   │   ├── run_api_docs.ts             # Run API docs tool wrapper
│   │   └── cli_docs.ts                 # CLI docs tool wrapper
│   ├── meta_api_docs/                  # Meta API documentation
│   │   ├── index.ts                    # API docs handler
│   │   ├── index.test.ts               # Tests for index
│   │   ├── types.ts                    # Type definitions
│   │   ├── types.test.ts               # Tests for types
│   │   ├── format.ts                   # Documentation formatter
│   │   ├── format.test.ts              # Tests for formatter
│   │   └── topics/                     # Individual topic modules
│   ├── run_api_docs/                   # Run API documentation
│   │   ├── index.ts                    # Run API handler
│   │   ├── index.test.ts               # Tests for index
│   │   ├── format.ts                   # Documentation formatter
│   │   ├── format.test.ts              # Tests for formatter
│   │   └── topics/                     # Individual topic modules
│   ├── cli_docs/                       # Xano CLI documentation
│   │   ├── index.ts                    # CLI docs handler
│   │   ├── types.ts                    # Type definitions
│   │   ├── format.ts                   # Documentation formatter
│   │   └── topics/                     # Individual topic modules
│   └── xanoscript_docs/                # XanoScript language documentation
│       ├── version.json
│       ├── README.md
│       ├── syntax.md
│       └── ...
├── dist/                               # Compiled JavaScript output
├── vitest.config.ts                    # Test configuration
├── package.json
└── tsconfig.json
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | ^1.26.0 | Official MCP SDK |
| `@xano/xanoscript-language-server` | ^11.6.3 | XanoScript parser and validation |
| `minimatch` | ^10.1.2 | Glob pattern matching for context-aware docs |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.9.0 | TypeScript compiler |
| `vitest` | ^3.0.0 | Fast unit test framework |
| `@types/node` | ^22.0.0 | Node.js type definitions |
| `@types/minimatch` | ^5.1.2 | Minimatch type definitions |

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
    ├─► cli_docs → CLI documentation for local development workflows
    │
    ├─► mcp_version → Returns server version from package.json
    │
    └─► MCP Resources → Direct access to XanoScript documentation
```

## Authentication

The MCP server and library functions do not require authentication. However, when using the documented APIs (Meta API, Run API) to interact with actual Xano services, you will need appropriate Xano API credentials. See the `meta_api_docs` and `run_api_docs` tools for authentication details.

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
  - **applyTo**: Glob patterns for context-aware matching (e.g., `api/**/*.xs`)
  - **description**: Human-readable description of the topic

**Meta API Documentation** (`src/meta_api_docs/`):
- TypeScript modules with structured documentation
- Supports parameterized output (detail levels, schema inclusion)
- Better for AI consumption due to context efficiency

## Testing

The project uses [Vitest](https://vitest.dev/) as its test framework with comprehensive unit tests.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

| Module | Test File | Description |
|--------|-----------|-------------|
| `xanoscript.ts` | `xanoscript.test.ts` | Core XanoScript documentation logic including file path matching and quick reference extraction |
| `meta_api_docs/index.ts` | `meta_api_docs/index.test.ts` | Meta API documentation handler and topic management |
| `meta_api_docs/format.ts` | `meta_api_docs/format.test.ts` | Documentation formatting for endpoints, examples, and patterns |
| `meta_api_docs/types.ts` | `meta_api_docs/types.test.ts` | Type structure validation |
| `run_api_docs/index.ts` | `run_api_docs/index.test.ts` | Run API documentation handler |
| `run_api_docs/format.ts` | `run_api_docs/format.test.ts` | Run API formatting with correct base URL |

### Test Structure

Tests are co-located with source files using the `.test.ts` suffix:

```
src/
├── xanoscript.ts
├── xanoscript.test.ts          # Tests for xanoscript.ts
├── meta_api_docs/
│   ├── index.ts
│   ├── index.test.ts           # Tests for index.ts
│   ├── format.ts
│   ├── format.test.ts          # Tests for format.ts
│   └── ...
└── run_api_docs/
    ├── index.ts
    ├── index.test.ts           # Tests for index.ts
    └── ...
```

### Writing Tests

Tests use Vitest's API which is compatible with Jest:

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "./myModule.js";

describe("myFunction", () => {
  it("should return expected result", () => {
    expect(myFunction("input")).toBe("expected");
  });
});
```

## License

See [LICENSE](LICENSE) for details.
