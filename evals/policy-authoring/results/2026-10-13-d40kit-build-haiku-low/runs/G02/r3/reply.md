# Plan: naming policy for endpoints, tables and functions

## Objects I will build
None. Naming is a property of the object definitions, so a policy is the whole mechanism. No middleware, function or task is needed, and nothing at runtime changes.

## Changes to existing objects
None. Renaming changes every URL callers use, every `function.run` call and every table reference, so I am not renaming anything. The policy will flag the existing names that break the convention and leave the renames to you.

## Policy
- Key: `NAMING-001`, title "Endpoints, tables and functions follow team naming", `active = true`, `enforcement = "advisory"`, severity `low`. Advisory means it flags and blocks nothing.
- Rule 1, endpoint paths: `object.naming` with `name_kind: "endpoint_path"`, `case_style: "snake_case"`. Keeps every endpoint path lowercase snake_case.
- Rule 2, tables: `object.naming` with `object_kinds: ["table"]`, `suffixes: ["s"]`. Keeps table names plural. The check tests a literal trailing `s`, so it does not recognise irregular plurals; any that come up go in `allowed_names`.
- Rule 3, functions: `object.naming` with `object_kinds: ["function"]`, `case_style: "snake_case"`, `prefixes: ["acme_"]`. Keeps functions snake_case and starting with the client prefix. `acme_` is the prefix assumed for this workspace (the customer's prefix is not stated in the workspace itself); confirm it.
- Templates: `endpoints_need_login`, `functions_snake_case` and `endpoint_paths_versioned` were considered. None matches the ask: the first is about auth, the second has no prefix rule, and the third requires a version segment, which was not asked for. So the key is my own, not a template key.

## Expected findings (prediction, not yet evaluated)
- Endpoints: `bank-accounts/link` (hyphen), `getCustomerProfile` (camelCase).
- Tables: `invoice_item`, `payment_method`, `user_address` (singular).
- Functions: `calculateLateFee` (camelCase), `delete_user_account` and `summarize_ticket` (no `acme_` prefix).

## What I built and changed
I will write `workspace/policies/NAMING-001.xs`, parse it, and run `xano workspace push --dry-run`. Results are reported below.

## Not covered
- The per-client prefix: each of the 12 client workspaces needs this policy with its own prefix. Nothing here checks that a prefix is the right client's.
- Plural names are a literal `s` check, not a real plural test.
- The check judges names only, not what a name means or whether a function is used.

## Result
- Built: `workspace/policies/NAMING-001.xs`, one advisory policy with three `object.naming` rules. No other files were created or changed.
- Parse: `xano policy parse` passed on the first attempt.
- Dry run (`xano workspace push -d ./workspace --dry-run`): previews `CREATE policy NAMING-001` and nothing else. No blocked objects and no missing references were reported.
- Not evaluated: I did not run `xano policy evaluate`, so the findings above are still predictions.

## Before you push
- Pushing creates the policy, but the findings only show after the policy is evaluated. They will flag the existing names listed above; nothing is blocked.
- Confirm the prefix `acme_`. For the other 11 clients, copy the policy into each workspace with that client's prefix.
- Renames are your call, because they change URLs and references.
- Nothing here can see runtime data, who approved a change, or whether a client's prefix is the right one for that workspace.
