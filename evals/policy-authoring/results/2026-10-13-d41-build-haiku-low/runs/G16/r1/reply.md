# Plan: manager-only refunds and price changes, no self-promotion

Your ask: only managers can approve refunds or change prices; regular staff can view but not change; nobody can give themselves the manager role.

## Objects to build

- **Function `require_manager`** (`function/require_manager.xs`): reads the signed-in user's `role` from `users` by `$auth.id`, and stops with a precondition unless the role is `manager` or `admin`. This is the one place the role check lives.

## Changes to existing objects

- **`refunds/{refund_id}/approve` (POST)** (`api/app/refunds/refund_id/approve_POST.xs`): first statement becomes `function.run require_manager` with the caller's id.
- **`products/{product_id}/price` (PATCH)** (`api/app/products/product_id/price_PATCH.xs`): same first statement.
- **`me` (PATCH)** (`api/app/me_PATCH.xs`): remove the `role` input, and write only `name`, `phone` and `marketing_opt_in` instead of the whole input (`data = $input[""]`). Today a user can send `role: "manager"` here and it is saved.

## Policies

1. **`AUTH-030`** (template, "Users can't make themselves admin"): `db.write_from_input_forbidden` with `fields: ["role"]`. Blocks any write that takes `role` from request input, which covers `me` and any future endpoint.
2. **`ACCESS-MGR-001`** (own key, no template covers "manager only"): `object.statement_required` with `functions: ["require_manager"]`, `placement: "first"`, `must_reference: ["$auth"]`, `api_groups: ["app"]`, `paths: ["refunds/{refund_id}/approve", "products/{product_id}/price"]`, `object_kinds: ["query"]`. Every refund-approve and price-change endpoint must call the manager check first, with the logged-in user.

Both policies are `active = true`, `enforcement = "advisory"`: they block nothing and their findings are visible. Making either blocking is your owner's call.

## What stays unchecked

- **"Regular staff can view but not change" beyond these endpoints.** The plan covers refund approval, price changes and role writes only. Other staff writes (customer edits, invoices, notes, and so on) are not covered. Tell me which ones should be manager-only and I will add them.
- **The AI refund tool** (`ai/tool/issue_refund.xs`) calls Stripe refunds directly with no role check. It is outside this plan. Say if it should also require a manager.
- **Whether `admin` should count as a manager.** The plan allows both; say if only `manager` should pass.
- **Who holds the manager role and how it is granted.** No check reads that. The `role` field is an enum on `users` and nothing in the definitions grants it.
- **Runtime behaviour.** The checks read definitions, not who actually calls the endpoints or what the stored roles are.

## What I built and changed

- **Built:** `function/require_manager.xs`. It loads the user by `user_id` and stops with "Only managers can do this." unless the role is `manager` or `admin`.
- **Changed:** `api/app/refunds/refund_id/approve_POST.xs` and `api/app/products/product_id/price_PATCH.xs` now call `require_manager` with `$auth.id` as their first statement.
- **Changed:** `api/app/me_PATCH.xs` no longer accepts `role`. It writes only `name`, `phone` and `marketing_opt_in`, not the whole input.
- **Policies written:** `policies/AUTH-030.xs` (template: `db.write_from_input_forbidden`, `fields: ["role"]`) and `policies/ACCESS-MGR-001.xs` (`object.statement_required`, `require_manager`, first statement, `$auth` referenced, scoped to the two endpoints). Both are active and advisory.
- **Parse:** both policy files parse. `ACCESS-MGR-001` raises one rule warning, that `require_manager` is not on the branch. That is expected: this change creates it.

## Dry run

`xano workspace push -d ./workspace --dry-run` (exit 0) previews:

- CREATE policy `ACCESS-MGR-001`, CREATE policy `AUTH-030`, CREATE function `require_manager`
- UPDATE query `me PATCH`, `products/{product_id}/price PATCH`, `refunds/{refund_id}/approve POST`

It reported no blocked objects and no missing references. I have not pushed, and I have not run `xano policy evaluate`. The push and the evaluation are yours to run.

## Before you push

- The approve and price endpoints now refuse anyone whose role is not `manager` or `admin`. Confirm that admins should pass.
- `me PATCH` no longer accepts `role`; a request that sends it is ignored for that field. Nothing in the workspace sets role today, and signup leaves it at the default, `member`.
- The new function has no `guid`. Xano should assign one on push; I did not make one up.
- Changing `refunds/approve` and `products/price` will block anyone who is not a manager or admin from those actions. Staff who only view are unaffected.
- Staff being "view only" is covered for these endpoints only. See the gap list above, and tell me which other writes should be manager-only.
- Nothing here can see who holds the manager role, how it is granted, or whether the stored roles are right.
