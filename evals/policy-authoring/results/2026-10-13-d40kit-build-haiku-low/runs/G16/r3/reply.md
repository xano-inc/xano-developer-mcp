# Plan: only managers approve refunds or change prices; nobody can make themselves manager

## What I found in the workspace

- `users.role` is an enum: admin, support_lead, manager, staff, member, viewer.
- `PATCH /me` (`api/app/me_PATCH.xs`) takes a `role` input and writes the whole input body with `db.patch users data = $input[""]`. Any signed-in user can send `role: "manager"` and promote themselves. This is the self-promotion hole.
- `PATCH /products/{product_id}/price` (`price_PATCH.xs`) changes the price for any signed-in user. No role check.
- `POST /refunds/{refund_id}/approve` (`approve_POST.xs`) approves a refund for any signed-in user. No role check.
- The GET endpoints for refunds and products (`refunds_GET.xs`, `products_GET.xs`) only read. They stay open to staff.
- Signup (`auth/signup_POST.xs`) does not take a role, so new accounts get the default `member`.

## Objects I will build

- **Function `require_manager`** (`workspace/function/require_manager.xs`). Input `user_id`. Reads the user's role and stops with `accessdenied` unless the role is `manager`. Every guarded endpoint calls it first.

## Changes to existing objects

- **`price_PATCH`**: call `require_manager` with `$auth.id` as the first statement, before `db.patch products`.
- **`approve_POST`**: call `require_manager` with `$auth.id` as the first statement, before `db.edit refunds`.
- **`me_PATCH`**: remove the `role` input. Write only `name`, `phone` and `marketing_opt_in`, each named explicitly, instead of the whole input body.

## Policies

1. **`AUTH-030`** (template "Users can't make themselves admin", as handed over): `db.write_from_input_forbidden` with `fields: ["role"]`. Keeps any write from taking `role` from request input. This is the check that catches the `me_PATCH` hole as it stands, and it passes once `me_PATCH` is fixed.
2. **`SHOP-010`** (my own key; no template covers price or refund approval): 
   - `object.statement_required`, `functions: ["require_manager"]`, `placement: "unconditional"`, `when: {statement: "db.patch", tables: ["products"]}`. Every endpoint that patches products calls the manager check.
   - `object.statement_required`, same function, `when: {statement: "db.edit", tables: ["refunds"]}`. Every endpoint that edits refunds calls the manager check.
   - `stack.statement_order`, `before: {functions: ["require_manager"]}`, `after: ["db.patch", "db.edit"]`, `tables: ["products", "refunds"]`. The check runs before the write, not after it.

## What stays unchecked

- Staff can still view refunds and products: that is intended, and no rule touches the GET endpoints.
- **The `issue_refund` AI tool** (`ai/tool/issue_refund.xs`) calls Stripe to refund a payment with no approval step and no role check. It is also in the support agent. No check can see who is calling a tool, so a rule cannot require a manager here. I will not change it; this needs your decision (see the reply).
- Whether a manager's own actions are right is not something a check can see.
- Who holds the manager role, and whether the role changes are approved, happens outside the definitions.
- Admin users: I am treating only `manager` as allowed, not `admin`. Tell me if admins should also pass.
- Runtime: no check reads what the database holds, so an existing staff user who is already a manager stays one.

## Build order

Build the function, edit the three endpoints, write the two policies, parse them, run `xano workspace push --dry-run`, then finish this reply with the result.

## What I built and changed

- **Built:** function `require_manager` (`workspace/function/require_manager.xs`). It stops with `accessdenied` unless the user's role is `manager`.
- **Changed:** `PATCH /products/{product_id}/price` and `POST /refunds/{refund_id}/approve` now call `require_manager` with `$auth.id` before their write.
- **Changed:** `PATCH /me` no longer accepts `role`. It writes only `name`, `phone` and `marketing_opt_in`.
- **Policies written:** `AUTH-030` (template "Users can't make themselves admin", fields `["role"]`) and `SHOP-010` (three rules: the manager check is called for product patches and refund edits, and runs before the write).
- **Not changed:** the GET endpoints for refunds and products, so staff can still view them.

## Dry run

`xano workspace push -d ./workspace --dry-run` reported: 2 policies created (AUTH-030, SHOP-010), 1 function created (require_manager), 3 endpoints updated (me PATCH, products price PATCH, refunds approve POST). No blocked objects were reported. The earlier parse warnings are resolved: `require_manager` now exists in the change, and I removed `is_admin` from AUTH-030 because the users table has no such field.

I did not run `xano policy evaluate`; this run is limited to dry-run validation, so the policies have not been evaluated against the branch.

## Before you push

1. **The `issue_refund` AI tool is a gap that no policy here can close.** It refunds a payment through Stripe with no approval and no role check, and the support agent can call it. A check cannot see who calls a tool, so I did not change it. Options for you to decide: remove `issue_refund` from the support agent, or make it create a refund request for a manager to approve.
2. **Admins are not allowed to approve or change prices.** I read "only managers" literally. If admins should pass too, tell me and I will change `require_manager`.
3. **`me PATCH` now writes the three fields explicitly.** If a client omits an optional field, check that `db.patch` leaves that field unchanged and does not set it to null. I did not verify this at runtime.
4. **Existing users keep their roles.** Nothing here changes who already holds `manager`. Review that list yourself.
5. **Advisory only.** Both policies are `advisory`, so they block nothing. Making them blocking is the policy owner's choice.

## What no check can see

Who actually holds the manager role, whether role changes were approved, runtime data, and how new write endpoints get added to these rules. A new endpoint that writes products or refunds will not be covered until someone adds it to SHOP-010 or guards it.
