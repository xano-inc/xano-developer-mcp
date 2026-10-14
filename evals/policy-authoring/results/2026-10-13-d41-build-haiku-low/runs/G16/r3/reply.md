# Plan: only managers approve refunds and change prices; staff view only

## Objects to build
- **function `require_manager`** (`workspace/function/require_manager.xs`): takes `user_id`, loads that user from the `users` table, and stops with an access-denied error unless their stored `role` is `manager`. The role is read from the database, never from the token.

## Changes to existing objects
- **`refunds/{refund_id}/approve` (POST, `api/app/refunds/refund_id/approve_POST.xs`)**: call `require_manager` as the first statement, passing `$auth.id`.
- **`products/{product_id}/price` (PATCH, `api/app/products/product_id/price_PATCH.xs`)**: call `require_manager` as the first statement, passing `$auth.id`.
- **`me` (PATCH, `api/app/me_PATCH.xs`)**: remove the `role` input, and replace `data = $input[""]` (which writes the whole request body into `users`) with an explicit list of `name`, `phone`, `marketing_opt_in`. This closes the self-promotion path.

## Policy
- **`AUTH-030`** (template `no_self_promotion`, as written): `db.write_from_input_forbidden` with `fields: ["role"]`. Keeps request input from ever writing `role`, which covers `me` and any future endpoint.
- **`MGR-010`** (own policy): `object.statement_required` with `functions: ["require_manager"]`, `placement: "first"`, `must_reference: ["$auth"]`, scoped by `paths: ["refunds/*/approve", "products/*/price"]` and `object_kinds: ["query"]`. Keeps both gated endpoints calling the manager check first.

## Left unchecked
- Staff can still read refunds and products; nothing needs changing for that.
- The AI tool `issue_refund` pays out refunds through Stripe with no user context, so no check here stops an agent from refunding. Flagged for a decision, not changed.
- Whether a manager is appointed (who may set `role` to `manager`) is an admin process no policy sees.
- No policy checks that `require_manager`'s logic is correct, only that it is called first.

---

# Result

## Built
- `workspace/function/require_manager.xs`: function `require_manager`. Loads the user by id and stops with "Only managers can do this." unless `role == "manager"`.

## Changed
- `workspace/api/app/refunds/refund_id/approve_POST.xs`: calls `require_manager` first, with `$auth.id`.
- `workspace/api/app/products/product_id/price_PATCH.xs`: calls `require_manager` first, with `$auth.id`.
- `workspace/api/app/me_PATCH.xs`: `role` removed from the input. The write now sets only `name`, `phone` and `marketing_opt_in`, instead of `$input[""]`.

## Policies
- `workspace/policies/AUTH-030.xs` (template `no_self_promotion`): `db.write_from_input_forbidden`, `fields: ["role"]`.
- `workspace/policies/MGR-010.xs`: `object.statement_required`, `functions: ["require_manager"]`, `placement: "first"`, `must_reference: ["$auth"]`, scoped to `refunds/*/approve` and `products/*/price`.

Both parse. The `require_manager` warning from parse is expected, since the function is new in this change.

## Dry run
`xano workspace push -d ./workspace --dry-run`: 2 policies created, 1 function created, 3 endpoints updated. No blocked objects or missing references.

## Before you push
- **Admin is locked out too.** The check requires `role == "manager"` exactly, so an `admin` cannot approve refunds or change prices. If admins should pass, say so and I'll change the function.
- **The AI tool `issue_refund` is not gated.** It pays out refunds through Stripe with no user context, so an agent can still refund. No policy here can see that. You need to decide whether to remove it from the support agent or give it a manager-only path.
- **Role assignment is outside this change.** Who gets `manager` (an admin edit, a direct database change) is a process no object or policy sees.
- **The policies are advisory.** `enforcement = "advisory"` reports findings and does not block a push. The checks confirm the function is called first; they do not test that its logic is right.
- **No test covers the gate yet.** Add a test that a staff token gets an error from the approve and price endpoints.
