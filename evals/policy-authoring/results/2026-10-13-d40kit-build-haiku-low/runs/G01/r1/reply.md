# Plan

**New objects:** none. The enforcement that matters already exists as the endpoint's `auth` setting, and the policy checks it.

**Changes to existing objects:** none. I found one endpoint that breaks the rule: `invoices/export` (`workspace/api/app/invoices/export_GET.xs`) has no `auth` and returns every row of `invoices`. Fixing it changes who can call it, so I will not change it without your yes (you name the auth table, probably `users` like its siblings).

**Policy:** `AUTH-010`, from the `endpoints_need_login` template (`object.auth_required`), scoped with `tables: ["invoices"]`. It is `active = true` and `enforcement = "advisory"`. It keeps true that every endpoint that reaches the `invoices` table (directly or through a function) requires a login. Any endpoint that touches invoices without auth is a finding. Advisory means it blocks nothing; making it blocking is your call.

**Not checked:**
- Whether an authenticated endpoint returns the whole table. Auth does not stop `invoices/export` once someone logs in, and `invoices_GET` is paged but `per_page` is not capped. A paging rule would be a separate policy.
- Whether a query filters by org. `db.where_constraint_required` cannot express `$me.org_id` (the org comes from a lookup, not `$auth`), so I did not add it.
- Who approved a change, whether the auth is correct for the caller, and runtime data. Policies read stored definitions only.

---

# Result

**Built:** `workspace/policies/AUTH-010.xs`.
**Changed:** nothing else.

**Parse:** `xano policy parse workspace/policies/AUTH-010.xs` exited 0 on the first attempt, with no warnings.

**Dry run:** `xano workspace push -d ./workspace --dry-run` reported one change and no blocked objects or missing references:

```
policy               +1 created
CREATE           policy             AUTH-010
```

**Before you push:**
- The policy is advisory, so it blocks nothing. Its findings are visible once it is evaluated. I have not run `xano policy evaluate` (outside this task's allowed commands), so I have not seen its findings.
- My prediction, not a result: `invoices/export` (`api/app/invoices/export_GET.xs`) will be reported, because it reaches `invoices` with no `auth`. Fixing it means choosing an auth table and changing who can call it, so that is your call. Tell me `users` (or the table you want) and I will make that one change.
- Auth stops anonymous callers. It does not stop a logged-in user from pulling the full table through `export`, and it does not check org scoping. Both need separate policies or code review.
- Enforcement is a scope and a check, not a guard in code. A new endpoint that touches invoices without auth shows up as a finding, and only blocks if you later set `enforcement = "blocking"`.
