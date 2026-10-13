# Plan and result: production data out of staging, prod access only via on-call

## Plan

I read the policy skill, the template kit, the catalogue, and the workspace (74 documents pulled to `./workspace`). I looked for a way to express both parts of your ask as policy rules:

1. **"Production data never ends up in staging."** No check can see this. The catalogue's own `not_checkable` list names "Runtime data and copies between environments" as out of reach: policies read stored object definitions, never table records, and never data copied between branches, environments or tenants. Nothing in the 36 checks reads which branch or environment a table or object belongs to.
2. **"Devs can only get into prod through the on-call process."** No check can see this either. "Access reviews and change approvals" is also on the not-checkable list: a blocking policy can hold a merge, but cannot see who approved it or who has access to prod. On-call rotation and access grants live outside the workspace definitions.

Because no policy can express either part of the ask, I have built nothing. Per the brief, that means no objects, no changes to existing objects, and no policy file.

## Built and changed

- **Objects built:** none.
- **Existing objects changed:** none.
- **Policies written:** none. `./workspace/policies/` was not created.
- **Dry run:** not run. There is nothing to validate.

## What you could do instead (not built, your call)

Policies that exist today cover adjacent, narrower things. None of them enforce your ask, and I have not built any of them:

- **Tag prod-bound tables and require login plus an access record on anything reaching them** (`object.tagged_table_access`). This makes access to tagged tables auditable inside the workspace. It does not stop a developer from reading prod through another route, and tags are set by the same people the policy is meant to constrain.
- **Restrict writes to tagged tables to approved functions** (`table.write_location_restricted`). This limits who can change those tables in code. It does not limit who can read them or copy them.

If you want either, tell me which tables and approved functions to use and I will write the plan for it.

## What the customer should know before pushing

- Nothing pushed, so there is nothing to review in this change.
- Enforcing "no prod data in staging" and "prod access only via on-call" needs controls outside Xano policies: branch and environment access settings in Xano, your on-call and access-review process, and your data-handling procedures. Those are the places to enforce this. A policy can record evidence in the workspace; it cannot prevent these events.
- Blocking enforcement of any future policy is a separate decision for its owner.
