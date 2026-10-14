# Plan: naming convention policy (advisory)

## Objects to build
None. A naming policy only reads object names, so it needs no middleware, function, table or task.

## Changes to existing objects
None. Flagged names stay as they are; renaming changes API URLs and call sites, so that is your call.

## Policy
- **Key:** `CONV-100` (new policy, `active = true`, `enforcement = "advisory"`, severity low). No template fits: `CONV-010` through `CONV-013` use snake_case only, and `CONV-012` asks for kebab-case endpoint paths, which conflicts with your snake_case rule.
- **Rule 1, endpoints are lowercase snake_case:** `object.naming`, `name_kind: "endpoint_path"`, `case_style: "snake_case"`, scoped to endpoints.
- **Rule 2, tables are plural:** `object.naming`, `name_kind: "object"`, `object_kinds: ["table"]`, `suffixes: ["s"]`. This is a literal suffix check, so a table such as `invoice_item` or `payment_method` is flagged, while `orgs` passes.
- **Rule 3, functions start with the client prefix:** `object.naming`, `name_kind: "object"`, `object_kinds: ["function"]`, `prefixes: ["acme_"]`.

**Assumption:** I could not find the client prefix in the workspace. Five functions already start with `acme_`, so I used it. Replace it with the client's real prefix before pushing.

## What stays unchecked
- Field and input names, and the `allowed_names` exemptions. You did not ask for them.
- Whether a function's name matches its behaviour. The check reads the prefix only.
- The check only reports; no push is blocked (advisory).
- Renaming: the policy flags names but does not fix them.

---

# Result

## Built and changed
- **Policy file:** `workspace/policies/CONV-100.xs`, key `CONV-100`, advisory, active, low severity. Three `object.naming` rules, in the order of the plan above. I did not change any object.
- The file parses with `xano policy parse`.

## Dry run
`xano workspace push -d ./workspace --dry-run` reports one change and nothing blocked:

    policy   +1 created   CONV-100

I did not evaluate the policy. I'm not permitted to run `xano policy evaluate`, so the findings below come from reading the declared names. Push and run it to confirm.

## What the policy would flag (predicted from names)
- **Endpoint paths:** `bank-accounts/link` (hyphen). The other declared paths are lowercase snake_case with `{param}` segments.
- **Tables:** `invoice_item`, `payment_method`, `user_address`. Each lacks the plural `s`. `orgs` passes.
- **Functions:** `calculateLateFee` (camelCase, and no `acme_` prefix), `delete_user_account` and `summarize_ticket` (no prefix). The five `acme_*` functions pass.

## Before you push
1. **Check the prefix.** I used `acme_` because five functions already carry it. If that is not this client's prefix, change `prefixes` in rule 3 before pushing.
2. **One prefix per workspace.** Each client needs its own policy with its own prefix, so copy `CONV-100` into each client's workspace and change the prefix there. A prefix list would let any client's prefix pass.
3. **Advisory only.** Findings are visible and nothing is blocked. Making it blocking is the policy owner's decision, and it would then block any push that introduces a flagged name.
4. **Renaming is your call.** Renaming `bank-accounts` changes the URL callers use. Renaming a table or function changes every reference. Use `allowed_names` for names you keep on purpose.

## What no policy here can see or guarantee
- Names only. It does not check fields, inputs, or whether a name says what the object does.
- The file-name pattern: the pulled files are named differently from their declared names, for example `bank_accounts/link_POST.xs` declares `bank-accounts/link`. The policy reads the declared name.
- Names created outside this workspace or after the next push are judged only when they exist in it.
- Nothing stops a developer from renaming an object to pass or from skipping a naming convention in a branch.
