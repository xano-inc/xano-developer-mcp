# Implementer brief

You are the AI coding assistant a Xano customer is using. The customer typed the ask below. Do what a helpful assistant would do: turn the ask into Xano policy file(s) where a policy can help, and reply to the customer.

**Customer:** {{PERSONA}}

> {{ASK}}

## What you have

Your working directory is the customer's project. Everything you need is in it:

- `.claude/skills/xano-policies/SKILL.md`: the Xano policies skill. Read it first.
- `kit/policy-templates.md`: the platform's policy templates.
- `kit/catalogue.json`: what `xano policy catalogue -o json` prints (checks, params, templates with their rules).
- The customer's Xano workspace, "{{WORKSPACE_NAME}}" (id {{WORKSPACE_ID}}). The `xano` CLI is already configured for it; do not pass `-p` or `-w`.

You may run these read-only commands as often as you like:

- `xano workspace pull -d ./workspace`: the workspace's tables, endpoints, functions, tasks, agents, tools and tests as XanoScript files. Use it to find the customer's real table, field, function, API group, tag and statement names instead of guessing them.
- `xano policy list`, `xano policy catalogue`, `xano policy catalogue -o json`.
- `xano policy parse <file>` (or `-o json`): validates a policy file against the platform parser and warns about names the workspace does not have.
- Reading and searching files inside your working directory, and ordinary shell tools on them.

FORBIDDEN: any `xano` command that creates, publishes, edits, deletes, pushes or evaluates anything (`xano policy create|publish|delete|evaluate`, `xano workspace push|create|edit|delete`, branch changes, `xano skills pull`, profile changes); changing the workspace in any way; reading anything outside your working directory; the web. Do not modify `kit/` or the skill. The customer's workspace stays as it is: if a policy needs something the workspace lacks (a tag on a table, an attribute on a field), say so in the reply rather than doing it.

## Output

Write everything to `./out/`:

1. The policy file(s) `out/<KEY>.xs` you would publish, one policy per file. Parse each; keep fixing until it parses or you give up. If no policy can do what the customer asks, write no `.xs` file and explain why in the reply.
2. `out/reply.md`: exactly what you would say back to the customer.
3. `out/notes.json`: your honest working log, for the product team (not the customer):

```json
{
  "goal_id": "{{GOAL_ID}}",
  "templates_considered": ["id: why fit / didn't fit"],
  "templates_used": ["id"],
  "rules": [{"policy_key": "...", "check": "...", "params": {}, "covers": "which part of the ask"}],
  "ask_parts_not_covered": [{"part": "...", "why": "no check exists | couldn't tell how | needs runtime/org process | other"}],
  "assumptions": ["names or meanings you assumed"],
  "workspace_names_used": ["real names you read from the workspace"],
  "confusions": ["places the skill/catalogue/templates were unclear, misleading, or where you guessed which check or param to use, or how to combine rules"],
  "wished_for": ["information, examples, recipes or templates that would have made this easier"],
  "parse_attempts": 0,
  "parse_errors_seen": ["short error text"],
  "confidence_policy_achieves_goal": "high|medium|low",
  "why_confidence": "..."
}
```

Be candid in notes.json: the point is to find where the product's guidance falls short. Do not pad. Final message: one line with the keys written and your confidence.
