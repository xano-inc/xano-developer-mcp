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

## Xano Skills

This repo ships two agent skills under `skills/`:

- **`xano-init`** — guided setup that profiles a Xano workspace and builds a sandbox-first development playbook
- **`xanoscript-docs-expert`** — deep reference for working with XanoScript documentation and this MCP project's architecture

**Using Claude Code inside this repo?** You already have both skills. They're committed to `.claude/skills/` and load automatically when Claude Code starts a session in this directory — no install step needed. Just invoke `xano-init` or `xanoscript-docs-expert` by name, or describe the task in natural language.

**Using a different agent, or want the skills available in other projects?** Skills are distributed via the open [Agent Skills standard](https://github.com/vercel-labs/skills) and install with a single `npx` command — no cloning or manual file copying.

Install `xano-init` globally into Claude Code:

```bash
npx skills add xano-inc/xano-developer-mcp -s xano-init -a claude-code -g
```

Install into multiple agents at once (Claude Code, Codex, Cursor, OpenCode, etc.):

```bash
npx skills add xano-inc/xano-developer-mcp -s xano-init \
  -a claude-code -a codex -a cursor -a opencode -g
```

Drop `-s` to install every skill in the repo, or drop `-g` to scope the install to the current project instead of your user profile. Other supported agents include `gemini-cli`, `windsurf`, `continue`, `cline`, `github-copilot`, and more — see the [skills CLI](https://github.com/vercel-labs/skills) for the full list.

Start a new agent session after installing so the skill manifest is picked up.

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
  cliDocs,
  mcpVersion
} from '@xano/developer-mcp';
```

### Validate XanoScript Code

```typescript
import { validateXanoscript } from '@xano/developer-mcp';

// Validate code directly
const result = validateXanoscript({ code: 'var:result = 1 + 2' });

if (result.valid) {
  console.log('Code is valid!');
} else {
  console.log('Validation errors:');
  result.errors.forEach(error => {
    console.log(`  Line ${error.range.start.line + 1}: ${error.message}`);
  });
}

// Validate a file
const fileResult = validateXanoscript({ file_path: './function/utils.xs' });

// Batch validate a directory
const dirResult = validateXanoscript({ directory: './api', pattern: '**/*.xs' });
console.log(`${dirResult.valid_files}/${dirResult.total_files} files valid`);
```

### Get XanoScript Documentation

```typescript
import { xanoscriptDocs } from '@xano/developer-mcp';

// Get the compact topic index (the no-arg default; ~4KB / ~1K tokens)
const index = xanoscriptDocs();
console.log(index.documentation);

// Get the full prose overview (the previous no-arg default)
const overview = xanoscriptDocs({ topic: 'readme' });

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
| `cliDocs` | Get CLI documentation |
| `mcpVersion` | Get the package version |
| `toolDefinitions` | MCP tool definitions (JSON Schema, for building custom MCP servers) |
| `toolSpecs` | Tool specs with Zod input/output shapes (preferred for new code — works directly with `McpServer.registerTool`) |
| `handleTool` | Async tool dispatcher (`Promise<ToolResult>`) for building custom MCP servers |

### TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  ValidateXanoscriptArgs,
  ValidationResult,
  ParserDiagnostic,
  XanoscriptDocsArgs,
  MetaApiDocsArgs,
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

### 1. `xano_validate_xanoscript`

Validates XanoScript code for syntax errors. Supports multiple input methods. The language server auto-detects the object type from the code syntax.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | No | The XanoScript code to validate as a string |
| `file_path` | string | No | Path to a single `.xs` file to validate |
| `file_paths` | string[] | No | Array of file paths for batch validation |
| `directory` | string | No | Directory path to validate all `.xs` files recursively |
| `pattern` | string | No | Glob pattern to filter files when using `directory` (default: `**/*.xs`) |

> One of `code`, `file_path`, `file_paths`, or `directory` is required.

**Examples:**
```
// Validate code directly
xano_validate_xanoscript({ code: "var:result = 1 + 2" })

// Validate a single file
xano_validate_xanoscript({ file_path: "function/utils/format.xs" })

// Validate multiple files
xano_validate_xanoscript({ file_paths: ["api/users/get.xs", "api/users/create.xs"] })

// Validate all .xs files in a directory
xano_validate_xanoscript({ directory: "api/users" })

// Validate with a specific pattern
xano_validate_xanoscript({ directory: "src", pattern: "api/**/*.xs" })
```

**Returns:** List of errors with line/column positions and helpful suggestions, or confirmation of validity.

### 2. `xano_xanoscript_docs`

Retrieves XanoScript programming language documentation with context-aware support. Called with no parameters, it returns a compact topic index (~4KB / ~1K tokens) for orientation; use `topic='readme'` for the full prose overview, or `topic=`/`file_path=` to drill in.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | No | Specific documentation topic to retrieve |
| `file_path` | string | No | File path being edited for context-aware docs (e.g., `api/users/create_post.xs`) |
| `mode` | string | No | `full` (default), `quick_reference` for compact syntax reference, or `index` for topic listing with sizes |
| `tier` | string | No | Pre-packaged documentation tier for context-limited models: `survival` (~1.2K tokens) or `working` (~4.4K tokens). Overrides topic/file_path/mode when set |
| `max_tokens` | number | No | Maximum estimated token budget. Loads topics in priority order until budget is reached. Helps prevent context overflow for small-window models |
| `exclude_topics` | string[] | No | Topic names to exclude from `file_path` results (e.g., topics already loaded) |

**Available Topics:**

| Topic | Description |
|-------|-------------|
| `survival` | Minimal syntax survival kit (~5KB, ~1.2K tokens) for models with <16K context — reach via `tier='survival'` |
| `working` | Complete working reference (~17KB, ~4.4K tokens) for models with 16-64K context — reach via `tier='working'` |
| `readme` | XanoScript overview, workspace structure, and quick reference |
| `essentials` | Common patterns, quick reference, and common mistakes to avoid |
| `syntax` | Expressions, operators, and filters for all XanoScript code |
| `syntax/string-filters` | String filters, regex, encoding, security filters, text functions |
| `syntax/array-filters` | Array filters, functional operations, and array functions |
| `syntax/functions` | Math filters/functions, object functions, bitwise operations |
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
| `addons` | Reusable subqueries for fetching related data |
| `debugging` | Logging, inspecting, and debugging XanoScript execution |
| `performance` | Performance optimization best practices |
| `realtime` | Real-time channels and events for push updates |
| `security` | Security best practices for authentication and authorization |
| `streaming` | Streaming data from files, requests, and responses |
| `middleware` | Request/response interceptors for functions, queries, tasks, and tools |
| `branch` | Branch-level settings: middleware, history retention, visual styling |
| `workspace` | Workspace-level settings: environment variables, preferences, realtime |

**Examples:**
```
// Get the compact topic index (no-arg default)
xano_xanoscript_docs()

// Get the full prose overview (previous no-arg default)
xano_xanoscript_docs({ topic: "readme" })

// Get survival kit for small context models (~1.2K tokens)
xano_xanoscript_docs({ tier: "survival" })

// Get working reference for medium context models (~4.4K tokens)
xano_xanoscript_docs({ tier: "working" })

// Get essentials (recommended first stop)
xano_xanoscript_docs({ topic: "essentials" })

// Get specific topic
xano_xanoscript_docs({ topic: "functions" })

// Discover available topics with sizes
xano_xanoscript_docs({ mode: "index" })

// Budget-aware: load docs up to token limit
xano_xanoscript_docs({ file_path: "api/users/create_post.xs", max_tokens: 2000 })

// Context-aware: get all docs relevant to file being edited
xano_xanoscript_docs({ file_path: "api/users/create_post.xs" })

// Context-aware with exclusions (skip already-loaded topics)
xano_xanoscript_docs({ file_path: "api/users/create_post.xs", exclude_topics: ["syntax", "essentials"] })

// Compact quick reference (uses less context)
xano_xanoscript_docs({ topic: "database", mode: "quick_reference" })
```

### 3. `xano_version`

Get the current version of the Xano Developer MCP server.

**Parameters:** None

**Returns:** The version string from package.json.

**Example:**
```
xano_version()
```

### 4. `xano_meta_api_docs`

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
xano_meta_api_docs({ topic: "start" })

// Get detailed table documentation
xano_meta_api_docs({ topic: "table", detail_level: "detailed" })

// Get examples without schemas (smaller context)
xano_meta_api_docs({ topic: "api", detail_level: "examples", include_schemas: false })

// Step-by-step workflow guides
xano_meta_api_docs({ topic: "workflows" })
```

### 5. `xano_cli_docs`

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
| `auth` | Browser-based OAuth authentication |
| `profile` | Profile management - credentials and multi-environment setup |
| `workspace` | Workspace operations - pull/push code sync, git integration |
| `sandbox` | Personal auto-provisioned dev environment (free-tier friendly) |
| `branch` | Branch management - list, switch, create, and delete branches |
| `function` | Function management - list, get, create, edit |
| `release` | Release management - create, export, import, pull, push |
| `tenant` | Tenant management - CRUD, deployments, env vars, backups, clusters |
| `unit_test` | Unit test management - list and run unit tests |
| `workflow_test` | Workflow test management - list, run, and manage workflow tests |
| `platform` | Platform management - list and view platform versions |
| `static_host` | Static hosting - deploy frontend builds |
| `update` | Update the CLI to the latest version |
| `integration` | CLI + Meta API integration guide - when to use each |

**Examples:**
```
// Get CLI setup guide
xano_cli_docs({ topic: "start" })

// Learn when to use CLI vs Meta API
xano_cli_docs({ topic: "integration" })

// Get workspace sync commands
xano_cli_docs({ topic: "workspace", detail_level: "detailed" })

// Profile management with examples
xano_cli_docs({ topic: "profile", detail_level: "examples" })
```

## MCP Resources

The server also exposes XanoScript documentation as MCP resources for direct access:

| Resource URI | Description |
|--------------|-------------|
| `xanoscript://docs/survival` | Minimal syntax survival kit (~1.2K tokens) |
| `xanoscript://docs/working` | Complete working reference (~4.4K tokens) |
| `xanoscript://docs/readme` | Overview and quick reference |
| `xanoscript://docs/essentials` | Common patterns, quick reference, and common mistakes to avoid |
| `xanoscript://docs/syntax` | Expressions, operators, and filters |
| `xanoscript://docs/syntax/string-filters` | String filters, regex, encoding, security filters |
| `xanoscript://docs/syntax/array-filters` | Array filters, functional operations |
| `xanoscript://docs/syntax/functions` | Math filters/functions, object functions, bitwise |
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
| `xanoscript://docs/addons` | Reusable subqueries for related data |
| `xanoscript://docs/debugging` | Logging and debugging tools |
| `xanoscript://docs/performance` | Performance optimization |
| `xanoscript://docs/realtime` | Real-time channels and events |
| `xanoscript://docs/security` | Security best practices |
| `xanoscript://docs/streaming` | Data streaming operations |
| `xanoscript://docs/middleware` | Request/response interceptors |
| `xanoscript://docs/branch` | Branch-level settings |
| `xanoscript://docs/workspace` | Workspace-level settings |

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `tsc && cp -r src/xanoscript_docs dist/` | Compile TypeScript and copy docs |
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
│   │   ├── index.ts                    # Unified tool exports & handler
│   │   ├── index.test.ts               # Tests for tool handler
│   │   ├── types.ts                    # Common types (ToolResult)
│   │   ├── validate_xanoscript.ts      # XanoScript validation tool
│   │   ├── xanoscript_docs.ts          # XanoScript docs tool
│   │   ├── xanoscript_docs.test.ts     # Tests for xanoscript docs tool
│   │   ├── mcp_version.ts              # Version tool
│   │   ├── meta_api_docs.ts            # Meta API docs tool wrapper
│   │   └── cli_docs.ts                 # CLI docs tool wrapper
│   ├── meta_api_docs/                  # Meta API documentation
│   │   ├── index.ts                    # API docs handler
│   │   ├── index.test.ts               # Tests for index
│   │   ├── types.ts                    # Type definitions
│   │   ├── types.test.ts               # Tests for types
│   │   ├── format.ts                   # Documentation formatter
│   │   ├── format.test.ts              # Tests for formatter
│   │   └── topics/                     # Individual topic modules
│   ├── cli_docs/                       # Xano CLI documentation
│   │   ├── index.ts                    # CLI docs handler
│   │   ├── types.ts                    # Type definitions
│   │   ├── format.ts                   # Documentation formatter
│   │   └── topics/                     # Individual topic modules
│   └── xanoscript_docs/                # XanoScript language documentation
│       ├── docs_index.json             # Machine-readable topic registry
│       ├── version.json
│       ├── README.md
│       ├── essentials.md
│       ├── syntax.md
│       ├── syntax/                     # Syntax sub-topics
│       │   ├── string-filters.md
│       │   ├── array-filters.md
│       │   └── functions.md
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
| `@xano/xanoscript-language-server` | ^11.6.5 | XanoScript parser and validation |
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
    ├─► xano_validate_xanoscript → Parses code with XanoScript language server
    │
    ├─► xano_xanoscript_docs → Context-aware docs from /xanoscript_docs/*.md
    │
    ├─► xano_meta_api_docs → Meta API documentation with detail levels
    │
    ├─► xano_cli_docs → CLI documentation for local development workflows
    │
    ├─► xano_version → Returns server version from package.json
    │
    └─► MCP Resources → Direct access to XanoScript documentation
```

## Authentication

The MCP server and library functions do not require authentication. However, when using the documented APIs (Meta API) to interact with actual Xano services, you will need appropriate Xano API credentials. See the `xano_meta_api_docs` tool for authentication details.

## Development

### Building

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Documentation Structure

**XanoScript Documentation** (`src/xanoscript_docs/`):
- Markdown files for XanoScript language reference
- Configured in `src/xanoscript_docs/docs_index.json` with:
  - **file**: The markdown file containing the documentation
  - **applyTo**: Glob patterns for context-aware matching (e.g., `api/**/*.xs`)
  - **description**: Human-readable description of the topic
  - **aliases**: Alternative names for topic lookup
  - **priority**: Ordering weight for file_path matching

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
| `tools/index.ts` | `tools/index.test.ts` | Tool handler dispatch and argument validation |
| `tools/xanoscript_docs.ts` | `tools/xanoscript_docs.test.ts` | XanoScript documentation tool and path resolution |
| `meta_api_docs/index.ts` | `meta_api_docs/index.test.ts` | Meta API documentation handler and topic management |
| `meta_api_docs/format.ts` | `meta_api_docs/format.test.ts` | Documentation formatting for endpoints, examples, and patterns |
| `meta_api_docs/types.ts` | `meta_api_docs/types.test.ts` | Type structure validation |

### Test Structure

Tests are co-located with source files using the `.test.ts` suffix:

```
src/
├── xanoscript.ts
├── xanoscript.test.ts          # Tests for xanoscript.ts
├── tools/
│   ├── index.ts
│   ├── index.test.ts           # Tests for tool handler
│   ├── xanoscript_docs.ts
│   ├── xanoscript_docs.test.ts # Tests for xanoscript docs tool
│   └── ...
├── meta_api_docs/
│   ├── index.ts
│   ├── index.test.ts           # Tests for index.ts
│   ├── format.ts
│   ├── format.test.ts          # Tests for format.ts
│   └── ...
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

## Upgrading from 1.x to 2.0

Version 2 modernizes the MCP server internals and normalizes all tool names
under a single `xano_` namespace. The high-level standalone library functions
(`validateXanoscript`, `xanoscriptDocs`, `metaApiDocs`, `cliDocs`, `mcpVersion`)
are unchanged.

### Tool renames (MCP clients)

If your agent or MCP client config references tools by name, update them:

| 1.x | 2.0 |
|---|---|
| `validate_xanoscript` | `xano_validate_xanoscript` |
| `xanoscript_docs` | `xano_xanoscript_docs` |
| `meta_api_docs` | `xano_meta_api_docs` |
| `cli_docs` | `xano_cli_docs` |
| `mcp_version` | `xano_version` |

The single `xano_` prefix improves discoverability when multiple MCP servers
are installed and lets clients filter Xano tools by name pattern.

### Library API

`handleTool(name, args)` is now `async` and returns `Promise<ToolResult>`
instead of `ToolResult`. Update call sites to use `await` and the new tool
names:

```ts
// 1.x
const result = handleTool("xanoscript_docs", { topic: "syntax" });

// 2.0
const result = await handleTool("xano_xanoscript_docs", { topic: "syntax" });
```

The individual `*ToolDefinition` exports (`validateXanoscriptToolDefinition`,
`xanoscriptDocsToolDefinition`, `mcpVersionToolDefinition`,
`metaApiDocsToolDefinition`, `cliDocsToolDefinition`) were removed in favor
of a single source of truth. Use `toolSpecs[name].definition` instead:

```ts
// 1.x
import { validateXanoscriptToolDefinition } from "@xano/developer-mcp";

// 2.0
import { toolSpecs } from "@xano/developer-mcp";
const validateXanoscriptToolDefinition =
  toolSpecs.xano_validate_xanoscript.definition;
```

A new `ToolName` type export enumerates every registered tool name.

### Notable fixes and additions

- `xano_xanoscript_docs` now correctly accepts the documented `tier` and
  `max_tokens` parameters — previously they were silently dropped before
  reaching the handler.
- The server is built on the modern `McpServer` API with Zod-derived schemas,
  so the JSON Schema published over the wire can no longer drift from the
  runtime parser.
- New `toolSpecs` export exposes each tool's Zod input/output shape — use it
  when registering tools in a custom `McpServer`.
- `xano_validate_xanoscript` results now include a `warnings` count in
  `structuredContent` on success.

## License

See [LICENSE](LICENSE) for details.
