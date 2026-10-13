# Plan: managers only for refunds and prices; no self-promotion

Reading of the ask: "change prices" means the product price endpoint, and "approve refunds" means the refund approval endpoint. "Regular staff can view but not change" is enforced for those two actions. Staff keep their read endpoints (`refunds_GET`, `products_GET`) unchanged. I have not extended the staff restriction to every other write in the app (customer edits, payments, bank links); say if you want that too.

## Objects I will build

- **function `require_manager`** (`workspace/function/require_manager.xs`). Input: `user_id`. Reads that user's row from `users` and stops the call with `accessdenied` unless `role` is `manager`. Only `manager` passes, so `admin` does not; tell me if admins should also approve.

## Changes to existing objects

- **query `refunds/{refund_id}/approve` (POST)**, `workspace/api/app/refunds/refund_id/approve_POST.xs`: call `require_manager` with `$auth.id` before the `db.edit refunds`.
- **query `products/{product_id}/price` (PATCH)**, `workspace/api/app/products/product_id/price_PATCH.xs`: call `require_manager` with `$auth.id` before the `db.patch products`.
- **query `me` (PATCH)**, `workspace/api/app/me_PATCH.xs`: remove the `role` input and replace `data = $input[""]` (a whole-body write, which lets a caller send `role`) with explicit `name`, `phone` and `marketing_opt_in`. This is the self-promotion path today.

## Policies

- **Key `AUTH-002`** (template "Admin endpoints check the caller's role", severity critical, `active = true`, `advisory`). Rules, all `object.statement_required` with `functions: ["require_manager"]`, `placement: "unconditional"`:
  - R1: `when.statement = "db.edit"`, `tables: ["refunds"]`. Keeps every refund edit behind the manager check.
  - R2: `when.statement = "db.patch"`, `tables: ["refunds"]`.
  - R3: `when.statement = "db.edit"`, `tables: ["products"]`.
  - R4: `when.statement = "db.patch"`, `tables: ["products"]`.
- **Key `AUTH-030`** (template "Users can't make themselves admin", severity critical, `active = true`, `advisory`). One rule: `db.write_from_input_forbidden` with `fields: ["role"]`. Flags any write that takes `role` from request input or copies a whole request body into `users`.

## What stays unchecked

- Who may be made a manager. No check reads who set a role, only where it came from in a request. An internal tool writing `role = "manager"` from a fixed value is not seen.
- Writes that bypass these statements (for example a new `db.add_or_edit` on refunds or products). The rules name the write statements I can see; a check for "only this function writes these fields" would need a `table.write_location_restricted` rule and a single writer function, which I have not built.
- Whether a logged-in user's `role` in the database is correct at runtime. Policies read definitions only.
- Admin and staff membership decisions, and who signs off on a change.

## Result

What I built and changed matches the plan above:

- Built: `function require_manager` (`workspace/function/require_manager.xs`).
- Changed: `refunds/{refund_id}/approve` POST and `products/{product_id}/price` PATCH now call `require_manager` with `$auth.id` before their write. `me` PATCH no longer accepts `role`, and writes only `name`, `phone` and `marketing_opt_in`.
- Policies written, both `active = true`, `enforcement = "advisory"`:
  - `workspace/policies/AUTH-002.xs`: four `object.statement_required` rules, one each for `db.edit` and `db.patch` on `refunds` and on `products`, all requiring `require_manager`, unconditional.
  - `workspace/policies/AUTH-030.xs`: `db.write_from_input_forbidden` with `fields: ["role"]`.
- Both policy files parse. The parser warned that `require_manager` is not yet on the branch. That is expected, because the function is part of this unpushed change.

Dry run (`xano workspace push -d ./workspace --dry-run`, exit 0):

```
policy               +2 created
Functions            +1 created
API Endpoints        ~3 updated

CREATE policy AUTH-002
CREATE policy AUTH-030
CREATE function require_manager
UPDATE query me PATCH
UPDATE query products/{product_id}/price PATCH
UPDATE query refunds/{refund_id}/approve POST
```

I did not run `xano policy evaluate`, so I have no policy findings to report. The dry run does not print a policy check result.

## Before you push

- **Admins cannot approve refunds or change prices** under this change, because the check admits only `manager`. If admins should too, the function needs an extra role.
- **Changing `me` PATCH:** clients that sent `role` will now have it ignored. Its `name`, `phone` and `marketing_opt_in` are still written as before.
- **Staff restriction is limited to these two actions.** Other writes that staff can make (customer edits, payments, bank links) are not restricted.
- **What no object or policy here can see:**
  - Who is made a manager. `AUTH-030` stops role coming from request input. It cannot stop an internal tool from writing `role = "manager"` from a fixed value.
  - New writes elsewhere. The rules watch `db.edit` and `db.patch` on `refunds` and `products`. A new `db.add_or_edit`, `db.bulk.update` or similar write would not be caught. A stricter rule would need one writer function per table.
  - Runtime data. The policies read stored definitions, not the live `users.role` values, the requests callers send, or who approved a change.
  - People, access reviews and change sign-off.
- Both policies are advisory. They report findings but block nothing. Making them blocking is the policy owner's choice, and would stop a merge or push that introduces a finding.
