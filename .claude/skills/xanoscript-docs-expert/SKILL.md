---
name: xanoscript-docs-expert
description: Expert skill for understanding, using, and modifying the xanoscript_docs documentation system in the xano-developer-mcp project. Use this skill whenever working with XanoScript documentation files (.md files in src/xanoscript_docs/), modifying the xanoscript_docs MCP tool, adding new documentation topics, editing existing docs, updating the topic registry in xanoscript.ts, or changing how documentation is served. Also use when someone asks about the xano-developer-mcp project architecture, the MCP server setup, or how the documentation delivery system works. Trigger on any mention of xanoscript_docs, XanoScript documentation, Xano MCP tools, or documentation authoring for this project.
---

# XanoScript Docs Expert

## Overview

This skill provides expert-level knowledge for working with the `xanoscript_docs` system inside the `@xano/developer-mcp` project. The project is a dual-purpose npm package: an MCP Server that serves XanoScript documentation to AI assistants, and a standalone library. The documentation lives as markdown files in `src/xanoscript_docs/` and is the primary content delivered by the `xanoscript_docs` MCP tool.

## Architecture at a Glance

```
src/
├── index.ts                    # MCP server entry (stdio transport)
├── lib.ts                      # Library entry (standalone usage)
├── xanoscript.ts               # Core doc logic: topic registry, file matching, content extraction
├── tools/
│   ├── index.ts                # Tool registry + dispatch (6 tools total)
│   ├── xanoscript_docs.ts      # xanoscript_docs tool: path resolution, MCP definition
│   ├── validate_xanoscript.ts  # Code validation via language server parser
│   ├── meta_api_docs.ts        # Meta API docs tool
│   ├── run_api_docs.ts         # Run API docs tool
│   ├── cli_docs.ts             # CLI docs tool
│   ├── mcp_version.ts          # Version tool
│   └── types.ts                # Shared ToolResult type
├── xanoscript_docs/            # 34 documentation topics (THE CONTENT)
│   ├── README.md               # Overview (returned when no args)
│   ├── version.json            # { "version": "2.0.0", "updated": "2025-02-06" }
│   ├── docs_index.json         # Machine-readable index with aliases, filters, constructs
│   ├── cheatsheet.md, syntax.md, quickstart.md, types.md  # Core language docs
│   ├── functions.md, database.md, tables.md, apis.md      # Construct-specific docs
│   ├── agents.md, tools.md, mcp-servers.md, triggers.md   # AI & event docs
│   ├── [16 more topic files...]
│   └── integrations/           # Sub-topic directory
│       ├── cloud-storage.md, search.md, redis.md
│       ├── external-apis.md, utilities.md
│   ...
├── meta_api_docs/              # Separate doc module for Meta API
├── run_api_docs/               # Separate doc module for Run API
└── cli_docs/                   # Separate doc module for CLI
```

## How the xanoscript_docs Tool Works

### Request Flow

```
Caller provides { topic?, file_path?, mode? }
    │
    ├── No args → Return README.md
    ├── topic="syntax" → Return syntax.md content
    ├── file_path="apis/users/create.xs" → minimatch applyTo patterns → return all matching docs
    └── mode="quick_reference" → Extract only "## Quick Reference" sections
    │
    └── All responses append: "---\nDocumentation version: X.X.X"
```

### Key Source Files

**`src/xanoscript.ts`** — The brain of the system:
- `XANOSCRIPT_DOCS_V2`: Record<string, DocConfig> mapping 34 topic keys to `{ file, applyTo, description }`
- `getDocsForFilePath(filePath)`: Uses `minimatch` to match file paths against `applyTo` glob patterns. Always includes "syntax" as a foundation topic.
- `extractQuickReference(content, topic)`: Finds "## Quick Reference" heading and extracts content until the next `## ` heading. Falls back to first 50 lines.
- `readXanoscriptDocsV2(docsPath, args)`: Main read function — decides what to return based on args.

**`src/tools/xanoscript_docs.ts`** — The tool wrapper:
- `getXanoscriptDocsPath()`: Resolves docs directory — tries `dist/xanoscript_docs/` first, falls back to `src/xanoscript_docs/`.
- `xanoscriptDocs(args)`: Standalone function returning `{ documentation: string }`.
- `xanoscriptDocsTool(args)`: Returns `ToolResult` (`{ success, data?, error? }`).
- `xanoscriptDocsToolDefinition`: MCP tool schema with name, description, inputSchema.

**`src/tools/index.ts`** — Registration:
- `toolDefinitions` array registers all 6 tools
- `handleTool(name, args)` dispatches by tool name
- `toMcpResponse()` converts ToolResult to MCP format: `{ content: [{ type: "text", text }], isError? }`

### Build Process

```bash
tsc && cp -r src/xanoscript_docs dist/
```

TypeScript compiles to `dist/`, then markdown files are copied verbatim. The docs are NOT transformed — they ship as-is.

## Adding a New Documentation Topic

This is the most common modification. Follow these steps exactly:

### Step 1: Create the Markdown File

Create a new `.md` file in `src/xanoscript_docs/`. For sub-topics, use the `integrations/` subdirectory pattern.

Every doc file MUST start with frontmatter:

```markdown
---
applyTo: "functions/**/*.xs, apis/**/*.xs"
---
```

The `applyTo` value specifies which file patterns this doc applies to when using context-aware delivery. Use empty string or omit patterns for docs only accessible via explicit `topic` parameter.

### Step 2: Register the Topic in `src/xanoscript.ts`

Add an entry to the `XANOSCRIPT_DOCS_V2` object:

```typescript
"my-new-topic": {
  file: "my-new-topic.md",           // Path relative to xanoscript_docs/
  applyTo: ["functions/**/*.xs"],     // Glob patterns for context-aware matching
  description: "One-line description of what this doc covers",
},
```

For sub-topics in a directory:
```typescript
"integrations/my-service": {
  file: "integrations/my-service.md",
  applyTo: [],                        // Sub-topics typically have empty applyTo
  description: "Description here",
},
```

### Step 3: Update `docs_index.json` (Optional but Recommended)

Add the topic to `src/xanoscript_docs/docs_index.json` in the appropriate section:

```json
"my-new-topic": {
  "file": "my-new-topic.md",
  "purpose": "Brief purpose description",
  "aliases": ["alias1", "alias2"]
}
```

Also update `constructs`, `operations`, or `tasks` sections if the new topic documents any of those.

### Step 4: Bump Version

Update `src/xanoscript_docs/version.json`:
```json
{
  "version": "2.1.0",
  "updated": "2025-03-15"
}
```

### Step 5: Build and Test

```bash
npm run build    # tsc && cp -r src/xanoscript_docs dist/
npm test         # vitest run
```

## Documentation Authoring Conventions

Read `references/doc-conventions.md` for the complete style guide. Here's the essential pattern:

### Required Structure

Every documentation file follows this skeleton:

```markdown
---
applyTo: "pattern/**/*.xs"
---

# Topic Title

> **TL;DR:** One or two sentences summarizing the key concepts.

## Quick Reference

| Feature | Example | Notes |
|---------|---------|-------|
| ...     | ...     | ...   |

## [Detailed Sections]

### Basic Structure
[Minimal working example]

### Common Patterns
[Real-world usage examples]

### Common Mistakes

❌ **Wrong:**
```xs
// incorrect code
```

✅ **Correct:**
```xs
// correct code
```

## Related Topics

| Topic | Use For |
|-------|---------|
| [syntax](xanoscript_docs({ topic: "syntax" })) | Filters and operators |
```

### Code Examples

- Use `xs` language identifier for XanoScript code blocks
- Use `javascript` for frontend code, `json` for data
- Comments use `//` only (no `#` or `/* */` in XanoScript)
- Show both wrong and correct patterns with ❌/✅ markers
- Progress from simple to complex examples

### Cross-Referencing

Reference other topics using this pattern:
```
For details, see xanoscript_docs({ topic: "syntax" })
For sub-topics: xanoscript_docs({ topic: "integrations/redis" })
```

### File Naming

- Lowercase with hyphens: `unit-testing.md`, `cloud-storage.md`
- Integration sub-topics go in `integrations/` subdirectory

## XanoScript Language Reference

For quick reference when writing docs, see `references/xanoscript-language.md`. Key things to remember:

### Type Names (Common Mistake Area)

| Correct | WRONG |
|---------|-------|
| `text` | `string` |
| `int` | `integer` |
| `decimal` | `float`, `number` |
| `bool` | `boolean` |

### Filter Type Safety (Most Common Doc Error)

String filters and array filters are NOT interchangeable. This is the #1 source of mistakes in the docs:

| Task | String Filter | Array Filter |
|------|--------------|--------------|
| Get length | `strlen` | `count` |
| Get part | `substr` | `slice` |
| Reverse | `split:""\|reverse\|join:""` | `reverse` |

### Control Flow Keyword

Always `elseif` (one word), never `else if`.

### String Concatenation

Use `~` (tilde), not `+`. Parentheses required around filtered values in concatenation:
```xs
($count|to_text) ~ " items"
```

## Modifying the MCP Tool Itself

For changes to how documentation is served (not the content):

### Changing Tool Parameters
Edit `xanoscriptDocsToolDefinition` in `src/tools/xanoscript_docs.ts`. The `inputSchema` follows JSON Schema format.

### Changing Doc Resolution Logic
Edit functions in `src/xanoscript.ts`:
- `getDocsForFilePath()` — context-aware matching logic
- `extractQuickReference()` — quick reference extraction
- `readXanoscriptDocsV2()` — main read dispatch

### Changing Path Resolution
Edit `getXanoscriptDocsPath()` in `src/tools/xanoscript_docs.ts`. The fallback chain: `dist/xanoscript_docs/` → `src/xanoscript_docs/` → default.

### Adding a New MCP Tool
1. Create `src/tools/my_tool.ts` with tool definition and handler
2. Register in `src/tools/index.ts`: add to `toolDefinitions` array and `handleTool` switch
3. Export from `src/lib.ts` if needed for standalone usage

## Testing

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With V8 coverage
```

Test files live alongside source: `src/xanoscript.test.ts`. Tests use Vitest with `describe`/`it`/`expect` patterns.

Key things to test when modifying docs:
- New topics resolve correctly via `readXanoscriptDocsV2({ topic: "new-topic" })`
- `applyTo` patterns match expected file paths via `getDocsForFilePath()`
- Quick reference extraction works if your doc has a `## Quick Reference` section

## Common Tasks Checklist

| Task | Files to Modify |
|------|----------------|
| Add new doc topic | New `.md` file + `xanoscript.ts` (XANOSCRIPT_DOCS_V2) + optionally `docs_index.json` |
| Edit existing doc content | Just the `.md` file in `src/xanoscript_docs/` |
| Change which files a doc applies to | `xanoscript.ts` → topic's `applyTo` array |
| Add integration sub-topic | New file in `integrations/` + register in `xanoscript.ts` |
| Change tool description/schema | `src/tools/xanoscript_docs.ts` → `xanoscriptDocsToolDefinition` |
| Change doc resolution logic | `src/xanoscript.ts` → `readXanoscriptDocsV2()` or `getDocsForFilePath()` |
| Update version | `src/xanoscript_docs/version.json` |
| Add new MCP tool (non-docs) | New file in `src/tools/` + register in `src/tools/index.ts` |
