# XanoScript AI Documentation v2 - Implementation Plan

## Design Principles

### AI-First Documentation Goals
1. **Scannable** - AI can quickly locate relevant syntax/patterns
2. **Self-contained** - Each doc has everything needed for its topic
3. **Pattern-consistent** - Identical structure across all docs
4. **Minimal but complete** - Not verbose, but covers all cases
5. **Examples inline** - Code immediately follows syntax it demonstrates

### Document Structure Template
Every doc follows this structure:
```
---
applyTo: "<glob pattern>"
---

# <Topic>

## Quick Reference
<Table or code block with syntax summary>

## Overview
<1-2 paragraph explanation>

## <Concept 1>
### Syntax
### Example
### Notes

## <Concept 2>
...

## Best Practices
<Bullet list>

## Common Patterns
<Real-world usage patterns>
```

---

## Proposed File Structure

### Core (Required for any XanoScript work)
| File | Purpose | Source Files |
|------|---------|--------------|
| `README.md` | Overview, workspace structure, getting started | README.md, workspace.md |
| `syntax.md` | Expressions, operators, filters | expression_guideline.md, query_filter.md |
| `types.md` | Data types, input blocks, validation | input_guideline.md, functions.md (input section) |

### Primary Constructs
| File | Purpose | Source Files |
|------|---------|--------------|
| `tables.md` | Database schemas, indexes, relationships | table_guideline.md, table_examples.md |
| `functions.md` | Reusable function stacks | function_guideline.md, function_examples.md |
| `apis.md` | HTTP API endpoints | api_query_guideline.md, api_query_examples.md |
| `tasks.md` | Scheduled jobs | task_guideline.md, task_examples.md |
| `database.md` | All db.* operations | db_query_guideline.md, functions.md (db section) |

### AI Integration
| File | Purpose | Source Files |
|------|---------|--------------|
| `agents.md` | AI agents, LLM providers | agent_guideline.md, agent_examples.md |
| `tools.md` | AI tools for agents/MCP | tool_guideline.md, tool_examples.md |
| `mcp-servers.md` | MCP server configuration | mcp_server_guideline.md, mcp_server_examples.md |

### Advanced Features
| File | Purpose | Source Files |
|------|---------|--------------|
| `testing.md` | Unit tests, mocks, assertions | unit_testing_guideline.md |
| `integrations.md` | Cloud, Redis, storage, security | functions.md (cloud/redis/security sections) |
| `frontend.md` | Static frontend, Lovable migration | frontend_guideline.md, build_from_lovable.md |
| `ephemeral.md` | Ephemeral services and jobs | ephemeral_environment_guideline.md |

### Reference (Optional)
| File | Purpose | Source Files |
|------|---------|--------------|
| `tips.md` | Tips, tricks, gotchas | tips_and_tricks.md |

---

## Content Reduction Strategy

### V1 Verbosity Issues
1. **Redundant examples** - Multiple examples showing same pattern
2. **Explanation repetition** - Same concept explained in guideline AND examples
3. **Over-commented code** - Examples have excessive inline comments
4. **Separate files** - guideline.md + examples.md = duplication

### V2 Approach
1. **One canonical example** per feature (not 3-5)
2. **Table-based syntax reference** - Quick scan, no prose
3. **Inline examples** - Example immediately after syntax
4. **Comments only for non-obvious** - Trust the reader

### Example Transformation

**V1 Style (verbose):**
```xs
// This function calculates the total cost
// by multiplying quantity by price per item
// and returns the result
function "maths/calculate_total" {
  description = "Calculate the total cost based on quantity and price per item"

  input {
    int quantity filters=min:0 {
      description = "Number of items"
    }

    decimal price_per_item filters=min:0.01 {
      description = "Price for each item"
    }
  }

  stack {
    var $total {
      value = 0
      description = "Initialize total"
    }

    math.add $total {
      value = $input.quantity * $input.price_per_item
      description = "Calculate total"
    }
  }

  response = $total
}
```

**V2 Style (minimal):**
```xs
function "calculate_total" {
  input {
    int quantity filters=min:0
    decimal price filters=min:0.01
  }
  stack {
    var $total { value = $input.quantity * $input.price }
  }
  response = $total
}
```

---

## Estimated Reduction

| Metric | V1 | V2 Target | Reduction |
|--------|-----|-----------|-----------|
| Files | 27 | 14 | ~48% |
| Total Lines | ~5000 | ~2000 | ~60% |
| Avg File Size | 185 lines | 140 lines | ~25% |

---

## Implementation Order

### Phase 1: Foundation
1. README.md - Workspace overview
2. syntax.md - All expressions and filters
3. types.md - Data types and inputs

### Phase 2: Core Constructs
4. tables.md - Database tables
5. functions.md - Functions
6. apis.md - API endpoints
7. tasks.md - Scheduled tasks
8. database.md - DB operations

### Phase 3: AI Features
9. agents.md - AI agents
10. tools.md - AI tools
11. mcp-servers.md - MCP servers

### Phase 4: Advanced
12. testing.md - Unit testing
13. integrations.md - Cloud/Redis/Security
14. frontend.md - Frontend + Lovable
15. ephemeral.md - Ephemeral environments

---

## Questions Resolved

- [x] Structure: Consolidated (single file per concept)
- [x] Examples: Minimal (just enough to demonstrate)
- [x] Quick Reference: Yes (syntax cheatsheets at top)
- [x] Scope: Complete coverage (all features)
