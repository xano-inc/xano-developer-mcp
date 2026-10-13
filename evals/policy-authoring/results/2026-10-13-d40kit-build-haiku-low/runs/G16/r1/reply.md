# Plan: only managers approve refunds or change prices; no one can make themselves manager

## What I found in the workspace

- `users.role` is an enum: `admin`, `support_lead`, `manager`, `staff`, `member`, `viewer` (default `member`).
- `POST refunds/{refund_id}/approve` (`api/app/refunds/refund_id/approve_POST.xs`) approves any signed-in user. No role check.
- `PATCH products/{product_id}/price` (`api/app/products/product_id/price_PATCH.xs`) changes a price for any signed-in user. No role check.
- `PATCH me` (`api/app/me_PATCH.xs`) accepts a `role` input and writes the whole request body into the user row (`data = $input[""]`). Any signed-in user can send `role: "manager"` and make themselves manager. This is the self-promotion hole.
- `GET refunds` (`api/app/refunds_GET.xs`) is a read for staff. It stays open to all signed-in users.
- Signup (`auth/signup_POST.xs`) does not take a role, so it cannot be used to self-promote.

## Objects I will build

| Kind | Name | File | What it does |
|---|---|---|---|
| function | `require_manager` | `workspace/function/require_manager.xs` | Takes the caller's user id, loads the user, and stops the request with `accessdenied` unless the user's role is `manager` or `admin`. |

## Changes to existing objects

| Object | File | Change |
|---|---|---|
| endpoint `refunds/{refund_id}/approve` (POST) | `workspace/api/app/refunds/refund_id/approve_POST.xs` | Add `function.run require_manager` as the first statement, passing `$auth.id`. |
| endpoint `products/{product_id}/price` (PATCH) | `workspace/api/app/products/product_id/price_PATCH.xs` | Same first-statement role check. |
| endpoint `me` (PATCH) | `workspace/api/app/me_PATCH.xs` | Remove the `role` input. Replace the whole-body write `$input[""]` with a pick of `name`, `phone`, `marketing_opt_in`. |

`GET refunds` and every other endpoint are not changed.

## Policies

**AUTH-002 `Admin endpoints check the caller's role`** (template; severity critical, `active = true`, `enforcement = "advisory"`). Two rules, one per protected endpoint:
1. `object.statement_required`, `functions: ["require_manager"]`, `placement: "first"`, `must_reference: ["$auth"]`, `paths: ["refunds/{refund_id}/approve"]`, `object_kinds: ["query"]`. Keeps the role check as the first statement of the refund approval endpoint.
2. Same check, `paths: ["products/{product_id}/price"]`. Keeps the role check as the first statement of the price endpoint.

**AUTH-030 `Users can't make themselves admin`** (template; severity high, `active = true`, `enforcement = "advisory"`). One rule:
1. `db.write_from_input_forbidden`, `fields: ["role"]`. Keeps request input from writing the `role` field, so `PATCH me` cannot set it.

## What stays unchecked

- Whether `require_manager` decides correctly. The check only confirms the call comes first.
- Any endpoint I do not name: other writes (customer edits, product edits other than price, notes) stay open to all signed-in users. The ask only names refunds and prices.
- Users created or edited through admin endpoints or the workspace, and anyone who sets a role directly in the database.
- Whether the role was granted properly, and who approves a manager grant. No check reads people or access reviews.
- Admin counts as manager in the function. Tell me if only `manager` should pass.

## Result

### Built
- `require_manager` function (`workspace/function/require_manager.xs`): loads the user by id and stops with `accessdenied` ("Only managers can do this.") unless role is `manager` or `admin`.

### Changed
- `refunds/{refund_id}/approve` POST: `function.run require_manager` is the first statement, passing `$auth.id`.
- `products/{product_id}/price` PATCH: same first-statement role check.
- `me` PATCH: `role` input removed. The write is now `$input|pick:["name","phone","marketing_opt_in"]` instead of the whole body.

### Policies written (both `active = true`, `enforcement = "advisory"`)
- `workspace/policies/AUTH-002.xs`: two `object.statement_required` rules. Each requires `require_manager` first, with `$auth` referenced, on one of the two endpoints above.
- `workspace/policies/AUTH-030.xs`: `db.write_from_input_forbidden` with `fields: ["role"]`.

### Checks run
- `xano policy parse` on both policy files: parsed. It reported `AUTH-002.R1` and `AUTH-002.R2`: "Function "require_manager" is not on this branch". This is expected, since the function is new in this change.
- `xano workspace push -d ./workspace --dry-run`: exit 0, no blocked objects or missing references. Preview: policy +2 created, function +1 created, API endpoints ~3 updated (`me PATCH`, `products/{product_id}/price PATCH`, `refunds/{refund_id}/approve POST`).
- I did not run `xano policy evaluate`, and I did not push. The push is yours.

### Before you push
- Admin also passes the role check. If only `manager` should approve and change prices, change the `precondition` in `require_manager.xs`.
- The `me` PATCH change means a client that sent `role` will now have it ignored. Clients that sent other fields are unaffected.
- Only the refund approval and price endpoints are covered. Other writes (customer edits, product edits other than price, notes) still open to any signed-in user.
- `GET refunds` stays open to all signed-in staff, as the ask says staff can view.

### What no object or policy here can see
- Whether `require_manager` decides correctly. The check only confirms the call is written first.
- Who holds the `manager` role. Granting it is outside the definitions: no check reads people or access reviews.
- Records already holding a wrong role, and roles set directly in the database or through admin endpoints. The policies read stored definitions only.
- Whether the `$input|pick` change matches how `db.patch` treats omitted fields at runtime. Test `PATCH me` with a partial body.
