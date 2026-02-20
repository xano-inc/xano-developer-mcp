# Documentation Authoring Conventions

Complete style guide for writing and editing XanoScript documentation files in `src/xanoscript_docs/`.

## Table of Contents

- [File Structure](#file-structure)
- [Frontmatter](#frontmatter)
- [Content Organization](#content-organization)
- [Code Examples](#code-examples)
- [Tables and Quick References](#tables-and-quick-references)
- [Cross-Referencing](#cross-referencing)
- [Common Mistakes Sections](#common-mistakes-sections)
- [Decision Trees](#decision-trees)
- [Callouts and Warnings](#callouts-and-warnings)
- [Voice and Tone](#voice-and-tone)
- [Naming Conventions](#naming-conventions)
- [Complete Topic Registry](#complete-topic-registry)

## File Structure

Every doc file follows this pattern:

```markdown
---
applyTo: "pattern/**/*.xs"
---

# Topic Title

> **TL;DR:** Concise summary (1-2 sentences).

## Quick Reference

[Tables with common operations]

## Section Index

| Section | Contents |
|---------|----------|
| [Section 1](#section-1) | What it covers |

## Section 1: Basic Structure

[Minimal working example with explanation]

## Section 2: Common Patterns

[Progressive complexity examples]

## Section 3: Advanced Usage

[Complex patterns, edge cases]

## Common Mistakes

[Wrong/correct pattern pairs]

## Related Topics

| Topic | Use For |
|-------|---------|
| [topic](xanoscript_docs({ topic: "name" })) | Description |
```

## Frontmatter

Every file must begin with YAML frontmatter specifying `applyTo` glob patterns:

```yaml
---
applyTo: "functions/**/*.xs, apis/**/*.xs, tools/**/*.xs"
---
```

Common patterns:
- `"**/*.xs"` — applies to all XanoScript files (use for foundational docs like syntax, cheatsheet)
- `"functions/**/*.xs"` — applies to function definitions
- `"apis/**/*.xs"` — applies to API endpoint definitions
- `"tables/*.xs"` — applies to table schemas (no subdirectories)
- `"triggers/**/*.xs"` — applies to all trigger types
- Empty/omitted — only accessible via explicit topic parameter (common for integration sub-topics)

The frontmatter must match the `applyTo` array in `XANOSCRIPT_DOCS_V2` in `src/xanoscript.ts`.

## Content Organization

### TL;DR Header

Always include immediately after the title:

```markdown
> **TL;DR:** XanoScript uses `db.query` for filtered lists, `db.get` for single records,
> and `db.has` for existence checks. All operations return results via `as $variable`.
```

### Quick Reference Section

This section is extracted by `extractQuickReference()` when `mode="quick_reference"` is used. Make it self-contained and useful on its own.

Format as tables whenever possible:

```markdown
## Quick Reference

| Operation | Syntax | Returns |
|-----------|--------|---------|
| Query records | `db.query "table" { where = ... } as $results` | Array of records |
| Get single | `db.get "table" { field_name = "id", field_value = $id } as $record` | Single record or null |
```

### Section Progression

1. **Quick Reference** — compact lookup tables
2. **Basic Structure** — minimal working example
3. **Key Properties/Fields** — property reference tables
4. **Common Patterns** — real-world usage
5. **Advanced** — complex or less common patterns
6. **Common Mistakes** — anti-patterns with corrections
7. **Related Topics** — cross-references

## Code Examples

### Language Identifiers

- `xs` — XanoScript code (the primary language)
- `javascript` — Frontend/client code
- `json` — Data structures and configurations
- `bash` — Shell commands (rare)

### Comment Style

XanoScript only supports `//` comments:

```xs
// This is the only comment style
var $name { value = "hello" }  // Can be inline too
```

Never use `#`, `/* */`, or `<!-- -->` in XanoScript code blocks.

### Example Format

Show purpose, then code, then explanation if needed:

```markdown
### Paginated Query

```xs
db.query "product" {
  where = $db.product.is_active == true
  order = [{ field: created_at, direction: desc }]
  paging = { limit: 20, offset: 0 }
  return = { type: "list", paging: { page: 1, per_page: 25 } }
} as $products
```

Returns products with pagination metadata.
```

### Progressive Complexity

Start simple, build up:

```markdown
### Basic Query
```xs
db.query "user" {} as $users
```

### With Filtering
```xs
db.query "user" {
  where = $db.user.is_active == true
} as $users
```

### With Sorting and Pagination
```xs
db.query "user" {
  where = $db.user.is_active == true
  order = [{ field: created_at, direction: desc }]
  paging = { limit: 20, offset: 0 }
} as $users
```
```

## Tables and Quick References

Use markdown tables for structured data. Common formats:

### Property Tables

```markdown
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `where` | expression | No | Filter condition |
| `order` | array | No | Sort specification |
```

### Feature Comparison Tables

```markdown
| Feature | Example | Result |
|---------|---------|--------|
| `trim` | `"  hi  "\|trim` | `"hi"` |
| `to_lower` | `"HELLO"\|to_lower` | `"hello"` |
```

### Decision Tables

```markdown
| Need To... | Use | Example |
|-----------|-----|---------|
| Read single record | `db.get` | `db.get "user" { field_name = "id", field_value = 1 }` |
| Read filtered list | `db.query` | `db.query "user" { where = ... }` |
```

## Cross-Referencing

### To Other Topics

```markdown
For complete filter reference, see xanoscript_docs({ topic: "syntax" })
```

### To Sub-Topics

```markdown
For AWS S3 operations, see xanoscript_docs({ topic: "integrations/cloud-storage" })
```

### Related Topics Table

Always end docs with:

```markdown
## Related Topics

| Topic | Use For |
|-------|---------|
| [syntax](xanoscript_docs({ topic: "syntax" })) | Operators, filters, expressions |
| [database](xanoscript_docs({ topic: "database" })) | All db.* operations |
```

## Common Mistakes Sections

Use the ❌/✅ format consistently:

```markdown
## Common Mistakes

### 1. Using Wrong Type Names

❌ **Wrong:**
```xs
input {
  string name    // "string" is not a valid type
  integer age    // "integer" is not valid either
}
```

✅ **Correct:**
```xs
input {
  text name      // Use "text" not "string"
  int age        // Use "int" not "integer"
}
```

### 2. Using `else if` Instead of `elseif`

❌ **Wrong:**
```xs
conditional {
  if (`$x > 0`) { }
  else if (`$x < 0`) { }   // Two words - will fail
}
```

✅ **Correct:**
```xs
conditional {
  if (`$x > 0`) { }
  elseif (`$x < 0`) { }    // One word - correct
}
```
```

Always include a brief explanation of WHY it's wrong.

## Decision Trees

For choosing between multiple approaches, use ASCII tree format:

```markdown
Need to read data?
├── Single record by known field? → `db.get`
├── Check if record exists? → `db.has`
└── Filtered list of records? → `db.query`

Need to write data?
├── New record? → `db.add`
├── Update known fields? → `db.edit`
├── Update dynamic fields? → `db.patch`
└── Insert or update? → `db.add_or_edit`
```

## Callouts and Warnings

Use blockquote format:

```markdown
> **TL;DR:** Summary text here.

> **Important:** Critical information the reader must know.

> **Note:** Additional context or tips.

> **Warning:** Potential pitfalls or dangerous patterns.
```

## Voice and Tone

- **Professional but accessible** — assume technical knowledge but explain XanoScript-specific concepts
- **Pragmatic** — focus on "what works" with practical examples
- **Concise** — TL;DR headers, quick references, bullet lists over paragraphs
- **Code-first** — show code before explaining it
- **Pattern-focused** — emphasize reusable patterns over exhaustive API reference

### Word Choices

- Say "filter" (not "method" or "function" for pipe operations)
- Say "construct" (for top-level language features: table, function, query, etc.)
- Say "stack" (for the execution block inside constructs)
- Say "input block" (for parameter definitions)
- Say "canonical" (for unique identifier/path segment)
- Say "addon" (for reusable subqueries)

## Naming Conventions

### Files

- Lowercase with hyphens: `unit-testing.md`, `cloud-storage.md`, `mcp-servers.md`
- Integration sub-topics in `integrations/` subdirectory

### XanoScript Code in Examples

- Folders and files: `snake_case` — `user_profile.xs`, `get_all_users_get.xs`
- Variables: `$snake_case` — `$user_data`, `$api_response`
- One definition per file (never multiple tables/functions in one `.xs` file)

### Reserved Variable Names

These appear frequently in examples:
- `$input` — input parameters
- `$auth` — authenticated user context
- `$env` — environment variables
- `$db` — database field references (in queries)
- `$this` — current item in loops/maps
- `$result` — accumulator in reduce operations
- `$response` — endpoint response
- `$output` — function output
- `$index` - reserved

## Complete Topic Registry

All 34 topics registered in `XANOSCRIPT_DOCS_V2`:

| Key | File | ApplyTo Pattern | Category |
|-----|------|----------------|----------|
| `readme` | README.md | (none) | Overview |
| `cheatsheet` | cheatsheet.md | `**/*.xs` | Core |
| `syntax` | syntax.md | `**/*.xs` | Core |
| `quickstart` | quickstart.md | `**/*.xs` | Core |
| `types` | types.md | `functions/**`, `apis/**`, `tools/**`, `agents/**` | Core |
| `tables` | tables.md | `tables/*.xs` | Constructs |
| `functions` | functions.md | `functions/**/*.xs` | Constructs |
| `apis` | apis.md | `apis/**/*.xs` | Constructs |
| `tasks` | tasks.md | `tasks/*.xs` | Constructs |
| `triggers` | triggers.md | `triggers/**/*.xs` | Constructs |
| `database` | database.md | `functions/**`, `apis/**`, `tasks/*`, `tools/**` | Operations |
| `agents` | agents.md | `agents/**/*.xs` | AI |
| `tools` | tools.md | `tools/**/*.xs` | AI |
| `mcp-servers` | mcp-servers.md | `mcp_servers/**/*.xs` | AI |
| `unit-testing` | unit-testing.md | `functions/**`, `apis/**`, `middleware/**` | Testing |
| `workflow-tests` | workflow-tests.md | `workflow_test/**/*.xs` | Testing |
| `integrations` | integrations.md | `functions/**`, `apis/**`, `tasks/*` | Integrations |
| `integrations/cloud-storage` | integrations/cloud-storage.md | (none) | Integrations |
| `integrations/search` | integrations/search.md | (none) | Integrations |
| `integrations/redis` | integrations/redis.md | (none) | Integrations |
| `integrations/external-apis` | integrations/external-apis.md | (none) | Integrations |
| `integrations/utilities` | integrations/utilities.md | (none) | Integrations |
| `frontend` | frontend.md | `static/**/*` | Constructs |
| `run` | run.md | `run/**/*.xs` | Constructs |
| `addons` | addons.md | `addons/*.xs`, `functions/**`, `apis/**` | Constructs |
| `debugging` | debugging.md | `**/*.xs` | Operations |
| `performance` | performance.md | `functions/**`, `apis/**` | Best Practices |
| `realtime` | realtime.md | `functions/**`, `apis/**`, `triggers/**` | Operations |
| `schema` | schema.md | `functions/**`, `apis/**` | Operations |
| `security` | security.md | `functions/**`, `apis/**` | Best Practices |
| `streaming` | streaming.md | `functions/**`, `apis/**` | Operations |
| `middleware` | middleware.md | `middleware/**/*.xs` | Constructs |
| `branch` | branch.md | `branch.xs` | Config |
| `workspace` | workspace.md | `workspace.xs` | Config |
