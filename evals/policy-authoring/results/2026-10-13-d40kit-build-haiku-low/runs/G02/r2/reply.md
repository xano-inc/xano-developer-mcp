# Plan: naming policy for this workspace (flag only, nothing blocked)

## Objects I will build
None. A naming convention is checked on the stored definitions of existing objects, so no middleware, function, table or task is needed to enforce it.

## Changes to existing objects
None. Flagging does not rename anything. Renaming endpoints, tables or functions would change URLs, `function.run` calls and table references, so that stays with you.

## Policy
- **Key:** `NAMING-001`, `active = true`, `enforcement = "advisory"`, `severity = "low"`. Advisory means its findings show up but nothing is blocked. Making it blocking is your decision.
- **Rule 1, endpoint paths are lowercase snake_case:** `object.naming`, `name_kind: "endpoint_path"`, `case_style: "snake_case"`. Covers every endpoint path in the workspace, `{param}` segments skipped. This is the snake_case version of `CONV-012`, which uses kebab-case and so does not fit.
- **Rule 2, endpoint names are lowercase snake_case:** `object.naming`, `name_kind: "object"`, `object_kinds: ["query"]`, `case_style: "snake_case"`. Covers the endpoint names themselves (for example `getCustomerProfile`).
- **Rule 3, table names are plural:** `object.naming`, `name_kind: "object"`, `object_kinds: ["table"]`, `suffixes: ["s"]`. Matches the `s` suffix, which is literal, so irregular plurals would need an `allowed_names` entry.
- **Rule 4, functions start with the client prefix:** `object.naming`, `name_kind: "object"`, `object_kinds: ["function"]`, `prefixes: ["acme_"]`. The prefix is my assumption, taken from the existing `acme_*` functions in this workspace. Confirm it.

## What stays unchecked
- Function and table names in a different workspace (each client is probably its own workspace, so one policy here covers one client).
- Input names, field names and tag names (not requested).
- Names referenced by strings or inside code. The check only reads declared names.
- Whether a name is "right" beyond its pattern. The check cannot judge meaning.
- Anything at runtime. The policy only reads stored definitions.

## Verification I will run
`xano policy parse` on the policy file, then `xano workspace push --dry-run`. The dry run is validation only. I will not push, evaluate, or publish anything.

## What I built and changed
- Built: `workspace/policies/NAMING-001.xs`, one advisory policy with three rules. Nothing else was built.
- Changed: no existing objects.
- Rule 2 from the plan (endpoint names, `object.naming` on `query`) was dropped. `object.naming` does not inspect queries, so the rule would select nothing. Endpoint paths are covered by Rule 1 instead.

## Dry run
`xano workspace push -d ./workspace --dry-run` exits 0. It reports one change: `CREATE policy NAMING-001`. It reports no blocked objects and no missing references. `xano policy parse` on the file reports no warnings.

## Before you push
- **Expect findings on existing objects.** I did not run `evaluate`, so these are estimates from the file names, not a result. Likely flags:
  - Tables: `invoice_item`, `payment_method`, `user_address` (not plural).
  - Functions: `calculateLateFee`, `delete_user_account`, `summarize_ticket` (no `acme_` prefix).
  - Endpoint paths were not checked by hand; the policy will judge them.
- **The prefix `acme_` is my assumption.** I took it from the existing `acme_*` functions in this workspace. If each client has a different prefix, this policy only fits this one workspace. Each client would need its own copy with its own prefix.
- **Findings do not rename anything.** Renames change URLs, `function.run` calls and table references. Those are your call.
- **Queries (endpoint names) are not covered.** No naming check reads query names, so `getCustomerProfile`-style names stay unchecked.
- **Not covered at all:** input names, field names, tag names, names used inside code strings, and whether a name means the right thing.
- **Runtime is out of scope.** The policy reads stored definitions only.
- **Advisory means no blocking.** Making it blocking is the policy owner's choice, and it would then block any push that introduces a finding.
