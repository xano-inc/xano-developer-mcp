# Plan: naming-convention policy for policy-authoring-eval

Your ask: endpoints are lowercase snake_case, tables are plural, functions start with the client prefix. Flag, don't block.

## 1. Objects I will build

None. A naming convention is a check on what already exists, so it needs no runtime object. (The enforcement here is the policy itself: it reads every object definition on the branch.)

## 2. Changes to existing objects

None. I will not rename anything. Renaming breaks callers and function references, and the check's own fix hint says to ask before renaming. The policy will report what is off and leave the fixes to you.

## 3. The policy

Key: `NAMING-010`, file `workspace/policies/NAMING-010.xs`. Severity `medium`, `active = true`, `enforcement = "advisory"` (flags only, blocks nothing, as you asked).

| Rule | Check | What it keeps true |
|---|---|---|
| 1 | `object.naming`, `name_kind: "endpoint_path"`, `case_style: "snake_case"` | Every endpoint path segment is lowercase snake_case (for example `customers/{customer_id}` passes; `bank-accounts` and `getCustomerProfile` are reported). |
| 2 | `object.naming`, `name_kind: "object"`, `object_kinds: ["table"]`, `suffixes: ["s"]` | Every table name ends in `s` (for example `invoice_item` and `payment_method` are reported). |
| 3 | `object.naming`, `name_kind: "object"`, `object_kinds: ["function"]`, `prefixes: ["acme_"]` | Every function name starts with `acme_` (`calculateLateFee`, `delete_user_account`, `summarize_ticket` are reported). |

Assumption: the client prefix for this workspace is `acme_`, because five of its eight functions already use it. Each of your 12 client workspaces needs its own prefix, so this policy would be copied and edited per workspace.

## 4. What stays unchecked

- Plurals are checked by a trailing `s` only. Words such as `status` or `news` will be flagged, and irregular plurals such as `people` will be flagged too, unless you add exemptions.
- Naming of tables' fields, endpoint inputs, and function inputs is not in this ask, so it is not checked.
- Whether a function belongs to the right client, beyond its name, cannot be seen.
- Nothing is blocked. Findings appear on the policy run; the policy owner decides whether to make it blocking.
- Existing templates `CONV-010` (functions snake_case) and `CONV-012` (versioned kebab-case endpoint paths) do not match your ask: CONV-010 has no prefix rule, and CONV-012 requires kebab-case and a version segment, the opposite of snake_case.

## 5. What I built and changed

- Built: `workspace/policies/NAMING-010.xs`, one policy with the three rules above. It parses (`xano policy parse`, exit 0).
- Changed: nothing else.
- Dry run (`xano workspace push -d ./workspace --dry-run`, exit 0): `policy +1 created: NAMING-010`. No objects created, updated or deleted. The dry run does not evaluate the policy, so it reports no findings.

## 6. Before you push

- Pushing creates an active, advisory policy. It evaluates on the next run and reports findings, but blocks no merge, save or set-live.
- I have not run `xano policy evaluate`, so I cannot say which objects fail. From reading the workspace, I expect these to be reported (a prediction, not a result):
  - Endpoint paths: `bank-accounts/link` (hyphen) and `getCustomerProfile` (camelCase).
  - Tables: `invoice_item`, `payment_method`, `user_address` (no trailing `s`).
  - Functions: `calculateLateFee`, `delete_user_account`, `summarize_ticket` (no `acme_` prefix).
- Renaming any of these changes URLs callers use and references in other objects. I left them as they are.
- Blind spots: plurals are checked by trailing `s` only; irregular or uncountable names will be flagged. Field and input names are not in this policy. The `acme_` prefix is my assumption from this workspace, so it must be set per client workspace.
