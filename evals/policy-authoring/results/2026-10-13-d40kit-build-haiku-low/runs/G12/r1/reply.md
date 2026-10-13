# Production data and on-call access: what a policy can and cannot do

## Plan

I read the workspace (`policy_authoring_eval`, 74 files: tables, endpoints, functions, tasks, agents, tools) and the policy catalogue. The two halves of the ask map to different things:

1. **"Production data never ends up in staging."** This is about data copied between environments. The catalogue lists "runtime data and copies between environments" under *not checkable*: policies read stored object definitions, never table records or data moved between branches, environments or tenants. The workspace also has no environment object. `tenants` holds a `db_connection_string` per tenant, but nothing marks which tenant is production.
2. **"Devs can only get into prod through the on-call process."** This is about who can reach the workspace and who approved access. The catalogue lists "access reviews and change approvals" as *not checkable*. Developer access in Studio, roles, and on-call sign-off all happen outside the object definitions.

Objects I would build: none. Changes to existing objects: none. Policy: none.

The only partial enforcement I considered was a runtime gate: a function such as `require_oncall_grant` that every endpoint touching a prod-tagged table must call (`object.statement_required`). I did not build it. It would govern API callers, not developers. It would also need an on-call grant store that does not exist, so the function would either check nothing or invent a control the workspace doesn't have. A policy that reports a gate as present while the gate is empty would mislead your reviewers.

## What I built and changed

Nothing. The brief says to build no policy when no policy can do the ask, and that is the case for the two halves as stated. `./workspace` is a fresh pull and has no edits.

## Dry run

`xano workspace push -d ./workspace --dry-run` reports **"No changes to push."** That confirms the baseline is clean. It says nothing about the goal.

## Before you push or decide anything

- **Nothing here stops a copy of production data reaching staging.** Stopping that needs a control outside Xano: a data-movement process, a restore runbook, or separate workspaces or database connections per environment with credentials kept apart. If you add an environment marker (for example a tenant `env` field or a tag such as `prod-data` on tables), I can write policies that check the marker is present and that prod-tagged tables are reached only by logged-in endpoints (`table.tag_required`, and the existing `sensitive_tables_need_login` template, `CONF-010`). Those checks prove the tag is there, not that the data is separate.
- **Nothing here stops a developer reaching prod.** Access control for developers belongs to Xano workspace roles and your on-call tooling. Review those directly. A policy can't read them.
- If you want a runtime gate for API callers, tell me what the on-call grant is (a table of approvals with an expiry, or an external check) and which tables count as production. Then I can build the gate function and a policy that requires every endpoint touching those tables to call it.

## Confidence

High that no policy in the catalogue enforces either half as asked. I did not build anything, so there is nothing to push from this change.
