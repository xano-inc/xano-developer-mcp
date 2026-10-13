# Plan: naming policy for endpoints, tables and functions

## What I found in the workspace (policy-authoring-eval, id 9040)

- Functions: `acme_` prefix on 5 of 8 (`acme_calculate_tax`, `acme_get_tracking`, `acme_notify_sms`, `acme_send_invoice_email`, `acme_sync_shipping_rates`). Not prefixed: `calculateLateFee`, `delete_user_account`, `summarize_ticket`.
- Tables: 26 of 29 plural. Singular: `payment_method`, `invoice_item`, `user_address`.
- Endpoint paths: 31 queries. Not snake_case: `bank-accounts/link`, `getCustomerProfile` (name not in path form). Path params like `{customer_id}` are kept as written.

## Objects I will build

None. A naming policy is the enforcement itself: nothing runs at request time, so no middleware, function or task is needed.

## Changes to existing objects

None. The policy only flags. I will not rename any endpoint, table or function, because renames break callers, `function.run` calls and queries (per the naming check's fix note).

## The policy

Key `NAMING-001`, title "Names follow the workspace naming convention", `active = true`, `enforcement = "advisory"` (flags, never blocks, as asked). Three rules, each one check:

1. `object.naming` with `name_kind: "endpoint_path"`, `case_style: "snake_case"`. Endpoint paths are snake_case. Judges every endpoint in the workspace.
2. `object.naming` with `name_kind: "object"`, `object_kinds: ["table"]`, `suffixes: ["s"]`. Table names end in `s` (plural). `suffixes` is a literal text check, so irregular plurals would need an `allowed_names` entry; none exist in this workspace.
3. `object.naming` with `name_kind: "object"`, `object_kinds: ["function"]`, `prefixes: ["acme_"]`. Functions start with this workspace's client prefix, `acme_`.

Not a template: CONV-012 requires kebab-case endpoint paths, which contradicts the snake_case ask. CONV-010 and the other CONV templates do not cover a client prefix or plural tables. So I use my own key, not a template key.

## What the policy cannot see

- Which client a workspace belongs to. The prefix `acme_` is this workspace's; the other 11 client workspaces each need their own policy with their own prefix. One policy cannot cover all 12 with a single prefix.
- Renames, and whether a name is used by a caller. The policy reports; it does not fix.
- Names of API groups, middleware, tools, agents and triggers. The rules are scoped to endpoints, tables and functions only.
- Field and input names, which are not in the ask.

## Predicted findings (not yet run: I cannot run `policy evaluate` here)

- NAMING-001.R1 (endpoint paths): `bank-accounts/link`; `getCustomerProfile` only if its path derives from the name.
- NAMING-001.R2 (tables): `payment_method`, `invoice_item`, `user_address`.
- NAMING-001.R3 (functions): `calculateLateFee`, `delete_user_account`, `summarize_ticket`.

---

# Result

## Built

- `workspace/policies/NAMING-001.xs`: one policy, three `object.naming` rules. Parses with no warnings (`xano policy parse`).

## Changed

Nothing else. No objects were created or edited.

## Dry run

`xano workspace push -d ./workspace --dry-run` (exit 0):

```
policy               +1 created
CREATE           policy             NAMING-001
```

Nothing was pushed. The dry run does not evaluate findings, so the list above is still a prediction.

## Before you push

- Push is yours to run. Review `NAMING-001.xs` first.
- The `acme_` prefix is this workspace's. Each of the other client workspaces needs its own policy with its own prefix.
- The endpoint rule judges the path as declared. Endpoints with no explicit path (for example the query `getCustomerProfile`) are judged by whatever path Xano derives; I did not confirm that from the definitions.
- The policy reports only. Renaming is a separate decision, because renames change URLs and `function.run` calls. Names you want to keep go in `allowed_names`, which is the policy owner's call.
- No check sees which client a workspace belongs to, who approved a name, or what callers send.
