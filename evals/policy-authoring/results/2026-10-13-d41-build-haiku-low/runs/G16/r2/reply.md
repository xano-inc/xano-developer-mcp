# Plan: managers approve refunds and change prices; staff view only

## Objects to build

- **function `require_manager`** (`workspace/function/require_manager.xs`): loads the logged-in user (`db.get users` by `$auth.id`) and stops with `accessdenied` unless their role is `manager` (or `admin`). This is the one place the role check lives.

## Changes to existing objects

- **`me_PATCH`** (`workspace/api/app/me_PATCH.xs`): remove `role` from the input, so a signed-in user cannot send a role. Replace the whole-input write `data = $input[""]` with an explicit list of the three editable fields (name, phone, marketing_opt_in), so no other field can be written from input either.
- **`refunds/{refund_id}/approve` POST** (`workspace/api/app/refunds/refund_id/approve_POST.xs`): tag `manager-only`; call `require_manager` as the first statement.
- **`products/{product_id}/price` PATCH** (`workspace/api/app/products/product_id/price_PATCH.xs`): tag `manager-only`; call `require_manager` as the first statement.

Nothing else changes. `refunds` GET and `products` GET already serve staff read-only; no change is needed for "staff can view".

## Policies

Each policy is `active = true` and `enforcement = "advisory"`, so nothing is blocked on push.

1. **`AUTH-030`** (template `no_self_promotion`, unchanged): record writes never take `role` or `is_admin` from request input. This is what keeps `me_PATCH` from being a route to manager.
2. **`ROLE-010`** (custom, "Refund approvals and price changes need a manager"):
   - `rules[0]`: `stack.statement_order`. Every object that writes `refunds` or `products` (`db.edit`, `db.patch`, `db.add`, `db.del`) must call `require_manager` before the write. Catches any new endpoint that reaches those tables.
   - `rules[1]`: `object.statement_required` with `placement = "first"`, scoped to tag `manager-only`. Both price and refund endpoints must call `require_manager` as their first statement.

## What stays unchecked

- **The `issue_refund` AI tool** (`workspace/ai/tool/issue_refund.xs`) calls Stripe directly and refunds a payment with no role check. A tool has no `$auth`, so `require_manager` cannot run inside it. I am not changing it: the fix is a product decision (remove the tool, or require an approval step first). The policy does not cover it.
- **Who holds the manager role**: how users are granted or revoked the role is outside the workspace. Nothing in the definitions says who should be a manager.
- **Staff view**: no check confirms that staff can read `refunds` and `products`.
- **Other staff writes** outside refunds, products and `role` (customer edits, etc.) are not in this ask and are not checked.
- **Runtime behaviour**: the policies read stored definitions only, so they cannot see a request at run time or a manager's real access.
- **`admin` role**: included in the allow list by assumption; the ask says "managers" only. Remove it from `require_manager` if admins should not approve.

## Result

### Built and changed

- Built: `require_manager` function (`workspace/function/require_manager.xs`).
- Changed: `me_PATCH` (role removed from input; explicit field list), `approve_POST` and `price_PATCH` (tag `manager-only`; `require_manager` first).
- Policies written: `workspace/policies/AUTH-030.xs` (template `no_self_promotion`, field `role`) and `workspace/policies/ROLE-010.xs` (custom).

### Checks run

- `xano policy parse` passes on both policy files. The only warnings are names this change creates (`require_manager`, `manager-only`), which show as missing until the push lands.
- `xano workspace push -d ./workspace --dry-run`: policy +2, function +1, API endpoints ~3 updated. It reports no blocked objects and no missing references.

### Before you push

- Review the change on the `me_PATCH` endpoint: the `role` input is gone, so any client that still sends it will be ignored.
- `issue_refund` (AI tool) is **not** protected. It refunds through Stripe with no login context. Decide whether to remove the tool or require approval before agents can use it.
- Confirm that `admin` should be allowed to approve refunds and change prices (it is included by assumption).
- Confirm who gets the `manager` role. Nothing in the workspace grants it.
- Policies are advisory: they report findings but do not block a merge or push until someone makes them blocking.

### What no object or policy here can see

- Who is given or removed the manager role, and whether that is right.
- Whether a staff member can read refunds and products (no check confirms this).
- Run-time behaviour: the policies read definitions only, not requests or real records.
- Other writes by staff outside refunds, products and role.
