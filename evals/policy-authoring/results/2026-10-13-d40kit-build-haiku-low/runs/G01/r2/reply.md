# Plan

**Objects to build:** none. The policy checks the saved authentication setting of every endpoint that reaches the `invoices` table, so it needs no new runtime code.

**Changes to existing objects:** none. `api/app/invoices/export_GET.xs` (`export` endpoint, no `auth`) reaches `invoices` and will be reported. I will not add `auth` to it: enabling auth changes who can call it, which is your call, so I'm leaving it for you to decide.

**Policy:** `AUTH-010` (template: Endpoints require login).
- Rule: `object.auth_required` with `tables: ["invoices"]`. Every endpoint that reads the `invoices` table directly or through a called function must require a login. This covers `invoices_GET`, `invoices/{invoice_id}` and `invoices/export`, and any endpoint added later.
- Policy is `active = true`, `enforcement = "advisory"`, so its findings are visible but block nothing. Making it blocking is your call; once blocking, it would refuse a merge, set-live, save or push to the live branch that introduces an unauthenticated endpoint reaching `invoices`.

**What stays unchecked:**
- Whether the login is correct: the check reads the saved auth setting, not authorization logic. `invoices_GET` scopes by org, but `invoices/{invoice_id}` does not (any logged-in user can read any invoice by id). No check here sees that.
- Whether the endpoint returns the full table. The rule judges auth only. A logged-in caller can still page through all invoices.
- Anything that runs outside the stored definitions on this branch: other branches, deployed releases, runtime data, and endpoints added on the live branch without a push.

# Result

Built: `workspace/policies/AUTH-010.xs` (no other objects touched).

Dry run and parse results: see the final section below.

## What I built and changed

- `workspace/policies/AUTH-010.xs`: policy `AUTH-010`, one rule `object.auth_required` with `tables: ["invoices"]`, `active = true`, `enforcement = "advisory"`, `severity = "critical"`.
- No other files changed.

## Verification

- `xano policy parse -f workspace/policies/AUTH-010.xs`: parsed cleanly, no warnings.
- `xano workspace push -d ./workspace --dry-run`: `+1 created`, `CREATE policy AUTH-010`. No blocked objects or missing references reported.

## Before you push

1. **`export_GET` is open today.** `GET /app/invoices/export` has no `auth` and returns every invoice across all orgs. The policy will report it as a finding once pushed. Fixing it means adding `auth = "users"` (and deciding whether an export should be org-scoped), which changes who can call it. I left it alone; say the word and I'll make that change.
2. **`invoice_id_GET` is not org-scoped.** It requires login but returns any invoice by id. AUTH-010 doesn't judge that; it needs an authorization rule such as `db.where_constraint_required` on `invoices` with `field: "org_id"`, `compare_to: "$me.org_id"` (not built, since it changes what the endpoint can return and needs your review).
3. **Advisory, not blocking.** Nothing is refused on push until you make it `blocking`. That is your call; once blocking, it would refuse any merge, set-live or live push that adds an unauthenticated endpoint reaching `invoices`.
4. **What the policy cannot see:** whether a login is authorized to see the rows (the check reads the saved auth setting only); the size of a response (a logged-in caller can still page through every invoice); other branches, deployed releases, and runtime data; endpoints created in the live UI without a push.
