# Plan: stop endpoints returning the invoices table without login

## What I found

- `api/app/invoices/export_GET.xs` (`GET invoices/export`, API group `app`) has **no `auth`** and runs `db.query invoices` with no paging, then returns the whole list. This is the endpoint you have nearly shipped twice. It is already in the workspace, so the policy will flag it on the next evaluate.
- `api/app/invoices_GET.xs` and `api/app/invoices/invoice_id_GET.xs` require login (`auth = "users"`). `invoices_GET` pages its results.
- No policies exist in this workspace yet (`xano policy list` returned none).

## Objects I will build

None. The policy only needs checks the workspace already supports, and nothing at run time has to be added to make it work.

## Changes to existing objects

None. Fixing `export_GET` means turning on auth for it, which changes who can call it (and the accountant may depend on it being open). That is your decision, so I will not make it. The policy will report it until you decide.

## Policy: `INVOICES-001` ("Invoices are only served to logged-in callers, and never as an unbounded list")

Severity `critical`, `active = true`, `enforcement = "advisory"`. It is advisory, so it blocks nothing and its findings are visible. Making it blocking is the policy owner's choice, and blocking would refuse any merge, set-live or push to the live branch that introduces a finding.

- Rule 1: `object.auth_required` with `tables: ["invoices"]`. Every endpoint that reaches the `invoices` table must require login. This covers `invoices/export` today and any new endpoint that touches invoices.
- Rule 2: `statement.param_bound` on `db.query` `per_page`, `max: 1000`, `unit: "rows"`, `object_kinds: ["query"]`, `tables: ["invoices"]`. A list read of invoices with paging off is reported as unbounded, so the full table cannot come back in one response.

No existing template matches "invoices" specifically, so I am using my own key (`INVOICES-001`), not a template key. The template `AUTH-010` would cover every endpoint in the workspace, including login, signup and health, which is too broad for this ask.

## What stays unchecked

- Whether a login is the right login: the check confirms an endpoint requires authentication, not which auth table or which role.
- Whether the query filters by the caller's org. `invoices_GET` filters by `org_id`, but no rule here checks that. (`db.where_constraint_required` could, but it is not in this change; say if you want it.)
- Runtime data, and copies of data between branches or environments.
- Whether `per_page` really stays under 1000 at run time, since an input value cannot be verified statically.
- Infrastructure, backups and who holds the workspace.

## Result

## What I built and changed

- Built: nothing. No new objects were needed.
- Changed: no existing objects. `api/app/invoices/export_GET.xs` is unchanged.
- Policy written: `workspace/policies/INVOICES-001.xs`, active, advisory, severity critical. It parses cleanly (`xano policy parse` exit 0, no warnings).
  - Rule 1: `object.auth_required`, `tables: ["invoices"]`.
  - Rule 2: `statement.param_bound`, `db.query` `per_page` max 1000 rows, `tables: ["invoices"]`, query objects.

## Dry run

`xano workspace push -d ./workspace --dry-run` (exit 0):

```
policy               +1 created
CREATE           policy             INVOICES-001
```

The dry run does not evaluate the policy, so I have **not** seen which endpoints it flags. My prediction, not yet run:
- Rule 1 flags `invoices/export` (`GET /api/app/invoices/export`), which has no `auth`. `invoices_GET` and `invoices/{invoice_id}` already require login and should pass.
- Rule 2 flags `invoices/export`, which lists invoices with paging off. `invoices_GET` takes `per_page` from input, so the check may not be able to verify its value. That is a possible extra finding on `invoices_GET`.

## Before you push

- Pushing creates the policy only. It does not change `invoices/export`, so after the push the policy will report that endpoint until you decide how to fix it. Turning on auth for it changes who can call it, so that is your call, and the accountant may rely on it being open.
- The policy is advisory. It blocks nothing. If you want it to block merges and pushes to live, that is a separate change to `enforcement`.
- It does not check which login table or role is used, whether the query filters by the caller's org, runtime data, or infrastructure. See the list in the plan above.
