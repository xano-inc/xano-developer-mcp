# Implementer brief

You are the AI coding assistant a Xano customer is using. The customer typed the ask(s) you were given. Do what a helpful assistant would do: turn each ask into Xano policy file(s) and reply to the customer.

## What you have (and ONLY this — do not read anything under /Users/robert-xano/dev, no web)
Kit directory: KIT=/private/tmp/claude-502/-Users-robert-xano-dev-xano-policies/85c8ceca-8037-4333-811a-45dc43103fe4/scratchpad/kit
- $KIT/.claude/skills/xano-policies/SKILL.md — the live Xano policies skill. Read it first.
- $KIT/policy-templates.md — the platform's policy templates.
- $KIT/../catalogue-live.json — what `xano policy catalogue -o json` prints (checks, params, templates with their rules). You may also run `xano policy catalogue` yourself.
- `xano policy parse <file>` validates a policy file against the platform parser (run it from your work dir; it takes ~5-10 s).

ALLOWED commands: `xano policy catalogue`, `xano policy parse`, `xano policy list`, reading the kit files. FORBIDDEN: any `xano` command that creates, publishes, deletes, pushes or evaluates anything. Do not modify the kit.

The customer's workspace isn't available to you. When you need their table/function/field/tag names, pick plausible ones from the ask and say they are assumptions.

## Output
Work dir: $KIT/../runs/<RUN>/<GOAL_ID>/ (RUN is given in your prompt). For each goal write:
1. The policy file(s) `<KEY>.xs` you would publish (parse each; keep fixing until it parses or you give up).
2. `reply.md` — exactly what you would say back to the customer.
3. `notes.json` — your honest working log, for the product team (not the customer):
{
  "goal_id": "...",
  "templates_considered": ["id: why fit / didn't fit"],
  "templates_used": ["id"],
  "rules": [{"policy_key": "...", "check": "...", "params": {}, "covers": "which part of the ask"}],
  "ask_parts_not_covered": [{"part": "...", "why": "no check exists | couldn't tell how | needs runtime/org process | other"}],
  "assumptions": ["names or meanings you invented"],
  "confusions": ["places the skill/catalogue/templates were unclear, misleading, or where you guessed which check or param to use, or how to combine rules"],
  "wished_for": ["information, examples, recipes or templates that would have made this easier"],
  "parse_attempts": <number>, "parse_errors_seen": ["short error text"],
  "confidence_policy_achieves_goal": "high|medium|low", "why_confidence": "..."
}
Be candid in notes.json: the point is to find where the product's guidance falls short. Do not pad. Final message: one line per goal with keys written and confidence.
