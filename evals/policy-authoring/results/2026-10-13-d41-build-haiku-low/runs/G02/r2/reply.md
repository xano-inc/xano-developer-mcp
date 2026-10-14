# Plan: naming policy for client workspaces

## Objects to build
None. A naming policy is a check that reads object definitions. Nothing needs to run for it to work, so there is no middleware, function, table or task to add.

## Changes to existing objects
None.

## Policy
Key `NAMING-001`, `active = true`, `enforcement = "advisory"`, so it flags findings and never blocks a push or merge. Three rules, all `object.naming`:

1. **R1, endpoint paths are snake_case.** `name_kind: "endpoint_path"`, `case_style: "snake_case"`. Covers "endpoints are always lowercase snake_case". `{param}` segments are skipped.
2. **R2, table names are plural.** `name_kind: "object"`, `object_kinds: ["table"]`, `suffixes: ["s"]`. Covers "tables are plural". The suffix check is literal, so a table such as `people` would need an `allowed_names` entry.
3. **R3, function names start with the client prefix.** `name_kind: "object"`, `object_kinds: ["function"]`, `prefixes: ["acme_"]`. Covers "functions start with the client prefix". The prefix is an assumption (see below).

No template fits all three. CONV-010 covers function snake_case, but CONV-012 would require versioned kebab-case paths, which conflicts with the snake_case ask. So the key is my own, not a template key.

## What stays unchecked
- **The client prefix.** Each client workspace needs its own prefix. This workspace has `acme_` functions, so I used `acme_`. Change `prefixes` for each of the other eleven clients.
- **Naming in the 12 clients' workspaces.** This policy lives in one workspace. It has to be pushed to each one.
- **Anything a name does not show**: whether a dev picked the right word, whether a name is accurate, and whether an endpoint's URL is also used by a caller that was not updated.
- **Existing names.** Current objects that break a rule will be flagged. Renaming them changes URLs and `function.run` calls, so the policy flags them and does not fix them.

---

# Result

## Built
- `workspace/policies/NAMING-001.xs`: policy `NAMING-001`, `active = true`, `enforcement = "advisory"`, severity `low`, with three `object.naming` rules:
  - R1: endpoint paths are `snake_case`
  - R2: tables end in `s`
  - R3: functions start with `acme_`

## Changed
Nothing. No existing object was edited.

## Dry run
`xano workspace push -d ./workspace --dry-run` reported one change and no warnings:

    policy   +1 created
    CREATE   policy   NAMING-001

The policy file parsed on the first attempt with no errors.

The dry run only validates. It does not evaluate the policy, so I have not yet seen which existing objects break these rules. Expect findings on existing functions without the `acme_` prefix (for example `calculate_late_fee`, `summarize_ticket`, `delete_user_account`) and on tables that are not plural (for example `invoice_item`, `payment_method`, `user_address`). Evaluate after the push to see the full list.

## Before you push
- **Prefix.** `acme_` is an assumption based on the `acme_` functions in this workspace. Set the correct prefix for this client, and use a separate copy of the policy with that prefix for each of the other eleven workspaces.
- **Existing names.** Renaming changes endpoint URLs that callers use and `function.run` calls. The policy only flags these, so ask before renaming anything.
- **Advisory only.** The policy flags and blocks nothing. Making it blocking is the policy owner's decision, and it would then refuse merges and pushes that add a finding.
- **Not covered by this policy:**
  - whether a name is meaningful, not just well-formed
  - whether a client's own callers use the URL
  - renames made in other workspaces
  - tables that are plural but still wrong, such as `people`, which needs an `allowed_names` entry
  - names in code paths outside the object definitions, such as a string passed to `function.run` or a URL in a client app

**Confidence:** medium. The rules match what was asked, and the file validates. The prefix is an assumption, and no evaluation has run.
