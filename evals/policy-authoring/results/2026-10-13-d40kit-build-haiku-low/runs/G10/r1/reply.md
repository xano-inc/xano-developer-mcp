# Plan

## Objects to build

- **table `pending_actions`** (`workspace/table/pending_actions.xs`): a queue of actions an agent wants to take that a person must approve. Fields: `action` (text), `payload` (json), `status` (text, default `pending`), `created_at`.

## Changes to existing objects

- **tool `delete_customer_note`** (`workspace/ai/tool/delete_customer_note.xs`): replace the direct `db.del customer_notes` with a `db.add pending_actions` row for `delete_customer_note` with the note id. The note is not deleted by the agent. Its instructions say a person must approve the deletion.
- **tool `send_customer_email`** (`workspace/ai/tool/send_customer_email.xs`): replace the direct `util.send_email` with a `db.add pending_actions` row for `send_customer_email` with to, subject and body. No email leaves from the agent. Its instructions say the email waits for approval.
- **agent `Support Agent`**: no change. Its tool list already names only the four tools you gave it.

## Policy

- **key `AGENT-SAFE-001`**, active, advisory, severity high. Its statement says AI tools never delete records or send email directly; both wait in `pending_actions` for a person.
  - Rule 1: `stack.statement_forbidden`, statements `db.del`, `db.bulk.delete`, `db.truncate`, `object_kinds: ["tool"]`. Keeps every AI tool free of deletes, including deletes inside functions a tool calls.
  - Rule 2: `stack.statement_forbidden`, statement `util.send_email`, `object_kinds: ["tool"]`. Keeps every AI tool from sending email, including email sent from a function a tool calls.

## What stays unchecked

- **Agent tool allowlist.** No check limits which tools an agent may call. The agent's `tools` list is explicit today, but nothing will stop a future change from adding a tool, and no policy can confirm the runtime only calls listed tools.
- **The approval itself.** The policy keeps deletes and emails out of tools. It does not build the approve step: nothing yet reads `pending_actions` and carries out an approved action. That step needs a person-facing endpoint with auth decisions you should make.
- **`issue_refund`**: not in your ask, but it moves money from an agent with no approval. Not changed; flagged for you.
- **Runtime behaviour**: policies read stored definitions only. They cannot see what an agent actually says or calls.

## Result

### Built
- `workspace/table/pending_actions.xs`: new table, the approval queue.
- `workspace/policies/AGENT-SAFE-001.xs`: new policy, active, advisory, severity high.

### Changed
- `workspace/ai/tool/delete_customer_note.xs`: no longer runs `db.del`. It queues a `delete_customer_note` row in `pending_actions` and returns `{queued: true}`. Instructions updated.
- `workspace/ai/tool/send_customer_email.xs`: no longer calls `util.send_email`. It queues a `send_customer_email` row (to, subject, body) and returns `{queued: true}`. Instructions updated.

### Policy rules
- Rule 1, `stack.statement_forbidden` on tools: `db.del`, `db.bulk.delete`, `db.truncate`. Covers functions a tool calls.
- Rule 2, `stack.statement_forbidden` on tools: `util.send_email`. Covers functions a tool calls.

### Dry run
`xano workspace push -d ./workspace --dry-run` reported:

```
policy   +1 created   (AGENT-SAFE-001)
Tables   +1 created   (pending_actions)
Tools    ~2 updated   (delete_customer_note, send_customer_email)
```

No blocked objects or missing references were reported. `xano policy parse` on the policy file exited 0. I did not run `xano policy evaluate` (not permitted in this run), so no finding has been observed.

### Before you push
- **Nothing executes approved actions yet.** Queued deletes and emails stay `pending` until something acts on them. Building that approve step (an endpoint or admin screen, with its auth) is a separate decision for you.
- **Tool allowlist is not enforced by any policy.** The agent's `tools` list is explicit, but no check can stop a future change from adding a tool.
- **`issue_refund` is unchanged.** It calls Stripe directly with no approval. Your ask did not cover refunds, but it is the riskiest tool left. Say if you want it queued too.
- **Advisory, not blocking.** The policy's findings are visible, but nothing is blocked. Making it blocking is your choice; it would refuse a push that adds a delete or email to a tool.
- **Runtime is not visible.** Policies read stored definitions only. They cannot see what an agent actually calls or sends.
