# Plan (not yet built)

## What the workspace has today
- `invoices` table (`workspace/table/invoices.xs`), tagged nothing, `auth = false`.
- `api/app/invoices_GET.xs`: login required (`auth = "users"`), paged list. Fine.
- `api/app/invoices/invoice_id_GET.xs`: login required (`auth = "users"`). Fine.
- `api/app/invoices/export_GET.xs` (`GET invoices/export`): **no `auth`**, reads all of `invoices` with `db.query` and no paging. This is the endpoint the ask is about. It already fails the rules below.

## Objects I will build
- None. The check reads what Xano already knows (auth and the tables an endpoint reaches), so no middleware, function or table is needed.

## Changes to existing objects
- None. I will not add `auth` to `export_GET`: enabling auth changes who can call the endpoint, so that is your call. The policy will report it until you decide.

## Policy
- Key `INVOICES-AUTH`, `active = true`, `enforcement = "advisory"` (new policies start advisory; making it blocking is your choice, and it would then refuse a merge, set-live, save or push to live that introduces a finding).
  1. `object.auth_required` with `tables: ["invoices"]`: every endpoint that reaches the `invoices` table must require login. Covers "without auth". Currently flags `export_GET`.
  2. `statement.param_bound` on `db.query` `per_page`, `max: 100`, `object_kinds: ["query"]`, `tables: ["invoices"]`: a read of invoices must set a page size of at most 100, so no endpoint returns the whole table. Covers "full invoices table". Currently flags `export_GET`, which has no paging.

## What stays unchecked
- Whether a login is the right kind of login, or whether a query filters to the caller's own org (needs `db.where_constraint_required`; not asked for here, can add).
- Runtime: what a request actually returns, and data copied between branches or environments.
- Whether `export_GET` is ever reachable from outside the app (infrastructure and network).
- Who can edit or override this policy, and whether anyone reviews a change.
- A blocking policy, or a deliberate exemption: both are the policy owner's decision.

---

# What I built and changed
- Built: `workspace/policies/INVOICES-AUTH.xs` (one policy, two rules). No objects built, no existing objects changed.
- `xano policy parse` on the file: passed, exit 0.
- `xano workspace push -d ./workspace --dry-run`: `policy +1 created: INVOICES-AUTH`. No other changes. Exit 0. No blocked objects or missing references reported.
- I did not run `xano policy evaluate` (not permitted in this run), so the findings below are a prediction, not an observed result.

## Predicted findings once pushed (not verified)
- `GET invoices/export` (`api/app/invoices/export_GET.xs`) fails rule 1 (no `auth`) and rule 2 (`db.query` on invoices has no `per_page`, so it is unbounded).
- The other two invoice endpoints should pass both rules.

## Before you push
- The policy is advisory. It will report findings but block nothing. Making it blocking is your decision; if you do, it refuses any merge, set-live, save or live push that introduces a finding, so `export_GET` would block until fixed.
- Fixing `export_GET` is your call: it needs a login (`auth = "users"`, which user table to use) and a page size or an explicit way to export. I did not change it.
- The policy checks definitions only. It cannot see what a request returns at runtime, whether a login rule is the right one, or whether an org filter exists (`db.where_constraint_required` would cover that if you want it).
- Nothing stops a future change from editing or removing this policy; the 2am risk is covered only if the file stays in place and is active.
