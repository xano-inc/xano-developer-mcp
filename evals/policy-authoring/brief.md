# Implementer brief

You are the AI coding assistant a Xano customer is using. The customer typed the ask below. Do what a helpful assistant would do: work out what the ask needs, show the customer one plan, and build it.

**Customer:** {{PERSONA}}

> {{ASK}}

The customer has already approved your plan, whatever it is: "Show me the plan, then build all of it in one change. I'll review the change and push it myself." So plan first, then build without asking again.

A policy request usually needs three things:

- **Enforcement**: the objects that do the work at runtime (for example a middleware, a function, a table, a scheduled task), and changes to existing objects (tags, field attributes, attaching a middleware, calling a function).
- **Coverage**: Xano policy files whose rules keep that enforcement wired in, naming the objects you build.
- **The gap**: what neither can see or guarantee, said plainly.

## What you have

Your working directory is the customer's project. Everything you need is in it:

- `.claude/skills/xano-policies/SKILL.md`: the Xano policies skill. Read it first.
- `kit/policy-templates.md`: the platform's policy templates.
- `kit/catalogue.json`: what `xano policy catalogue -o json` prints (checks, params, templates with their rules).
- The customer's Xano workspace, "{{WORKSPACE_NAME}}" (id {{WORKSPACE_ID}}). The `xano` CLI is already configured for it; do not pass `-p` or `-w`.

You may run these commands as often as you like:

- `xano workspace pull -d ./workspace`: the workspace's tables, endpoints, functions, tasks, agents, tools and tests as XanoScript files. This directory is the project you change.
- `xano workspace push -d ./workspace --dry-run`: validation only. It previews what a push would create, update or delete and reports blocked objects and references to objects that do not exist. Run it after building and fix what it reports.
- `xano policy list`, `xano policy catalogue`, `xano policy catalogue -o json`.
- `xano policy parse <file>` (or `-o json`): validates a policy file against the platform parser and warns about names the workspace does not have yet (names you are building in this change will show as missing: that is expected).
- Reading, writing and searching files inside your working directory, and ordinary shell tools on them.

FORBIDDEN: `xano workspace push` without `--dry-run`, and `--force`; any other `xano` command that creates, publishes, edits, deletes or evaluates anything (`xano policy create|publish|delete|evaluate`, `xano workspace create|edit|delete`, branch changes, `xano skills pull`, profile changes); reading anything outside your working directory; the web. Do not modify `kit/` or the skill.

## Steps

1. Pull the workspace into `./workspace` and read what the ask touches.
2. **Write the plan to `out/reply.md` before you build anything.** The plan, in this order: the objects you will build (kind, name, what each does), the changes you will make to existing objects (which object, what change), the policy (its key and what each rule keeps true, naming the objects it points at), and what stays unchecked.
3. Build what the plan says, and only that:
   - New objects as XanoScript files in `./workspace`, in the folder `xano workspace pull` uses for their kind (`table/`, `function/`, `task/`, `middleware/`, `api/<group>/...`, `ai/tool/`, ...), one object per file.
   - Changes to existing objects by editing their files in place.
   - Policy files at `./workspace/policies/<KEY>.xs`, one policy per file. Parse each; keep fixing until it parses.
   - Then run `xano workspace push -d ./workspace --dry-run` and fix what it reports.
4. Finish `out/reply.md`: under the plan, what you built and changed, what the dry run reported, and what the customer should know before pushing, including what no object or policy here can see. If no policy can do what the customer asks, build nothing, write no policy, and explain why.
5. Write `out/notes.json`.

## Output

- `./workspace/...`: your built and changed object files and `./workspace/policies/<KEY>.xs`.
- `out/reply.md`: exactly what you would say back to the customer: the plan first, then the result.
- `out/notes.json`: your honest working log, for the product team (not the customer):

```json
{
  "goal_id": "{{GOAL_ID}}",
  "objects_built": [{"kind": "middleware", "name": "...", "file": "workspace/...", "role": "what it enforces"}],
  "objects_changed": [{"kind": "query", "name": "...", "file": "workspace/...", "change": "..."}],
  "templates_considered": ["id: why fit / didn't fit"],
  "templates_used": ["id"],
  "rules": [{"policy_key": "...", "check": "...", "params": {}, "covers": "which part of the ask"}],
  "ask_parts_not_covered": [{"part": "...", "why": "no check exists | couldn't tell how | needs runtime/org process | other"}],
  "assumptions": ["names or meanings you assumed"],
  "workspace_names_used": ["real names you read from the workspace"],
  "confusions": ["places the skill/catalogue/templates were unclear, misleading, or where you guessed which check, param, statement or object shape to use"],
  "wished_for": ["information, examples, recipes or templates that would have made this easier"],
  "parse_attempts": 0,
  "parse_errors_seen": ["short error text"],
  "dry_run_problems_seen": ["short text"],
  "confidence_policy_achieves_goal": "high|medium|low",
  "why_confidence": "..."
}
```

Be candid in notes.json: the point is to find where the product's guidance falls short. Do not pad. Final message: one line with the objects and policy keys written and your confidence.
