# Policy for endpoints that expose invoices

## Plan (written before building)

**Objects to build:** none. A policy only reads stored definitions; nothing has to run at request time for these two rules to hold, so no middleware, function, table or task is needed.

**Changes to existing objects:** none. The endpoint that matters today, `api/app/invoices/export_GET.xs` (`GET invoices/export`), has no `auth` line and returns every row of `invoices` (`db.query invoices` with no `where`, no paging). Fixing it means deciding who may download the export, which is your call, so I have not edited it. The policies below will report it.

**Policies:**
- `AUTH-010` (template "Endpoints require login", critical): `object.auth_required` with `except_tags: ["public"]`. Every endpoint, including any that reads invoices, requires login unless tagged `public`.
- `PERF-001` (template "Endpoints never return every row", medium): `statement.param_bound` on `db.query` `per_page`, max 1000. A list read with paging off, such as the export, is reported as unbounded.

**Not checked:** see the gap section below.

## What was built

- `workspace/policies/AUTH-010.xs`
- `workspace/policies/PERF-001.xs`

Both parse. `xano workspace push --dry-run` reports `+2 created` (policy AUTH-010, policy PERF-001) and no blocked objects or missing references.

I did not run `xano policy evaluate` or a real push, so I have not seen the findings. From reading the workspace I expect:
- `AUTH-010` to report `invoices/export` (no auth). It may also report other endpoints without `public` (login, signup, health, webhooks, and similar); those are for you to decide.
- `PERF-001` to report `invoices/export` (no paging). It will also report `invoices` (`api/app/invoices_GET.xs`), because its `per_page` comes from request input with no max, and the check treats an input-sourced page size as unverifiable.

## Before you push

1. **Both policies are `advisory`.** Advisory findings are visible but do not block a merge, a save or a push. The skill I was given treats making them `blocking` as the owner's decision. If you want the 2am protection to be hard, set `enforcement = "blocking"` on AUTH-010 yourself. Be aware that an active blocking policy with findings will refuse pushes that introduce them, including the export endpoint as it stands today, until it is fixed.
2. **The export endpoint is the live problem.** Decide whether it should require login (and for whom), and whether it should be scoped to the caller's org. I left it alone.

## What no object or policy here can see

- **Cross-tenant data.** Login is not isolation. An endpoint that requires login but returns every org's invoices passes `AUTH-010`. The `own_records_only` template (AUTH-020) would cover this, but its `compare_to` expects `$auth.<field>`, and your org id is reached through the `users` row, not `$auth` directly. I did not build it, because I could not write a rule that matches your data model with confidence.
- **Who the public ones are.** `AUTH-010` trusts the `public` tag. Anyone who can add that tag to an endpoint or API group exempts it. Nothing checks that the tag was approved.
- **Runtime and deployed state.** Policies judge the stored definitions on the branch. A change made outside Xano, or a live endpoint that was never pushed, is not seen.
- **The 2am case specifically.** The policies run when someone evaluates or pushes. If someone pushes with the policy advisory, nothing stops the merge. If an endpoint is added without any login line and nobody evaluates, nothing alerts.
- **Auth quality.** Checks that an endpoint declares a login table, not that the login is correct or the token is valid.
