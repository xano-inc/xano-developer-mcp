I've written a policy that stops invoice data going out to anonymous callers. It's in `out/AUTH-010.xs` and has not been published, so nothing is enforced yet.

**What it does**

- Key `AUTH-010`, title "Endpoints that reach invoices require login", severity critical.
- One rule: `object.auth_required` scoped to the `invoices` table. Every endpoint that reads or writes `invoices` must require a login. This covers endpoints that reach the table through a function or addon too.
- It is `active = true` and `enforcement = "advisory"`. Advisory means its findings show up, but it blocks nothing. If you want it to block a merge, set-live or push, change `enforcement` to `"blocking"`. That is your call, and it would then refuse any change that introduces a finding.
- It has no exemption. I did not add an `except_tags` for public endpoints, because you did not ask for one. If you later want a deliberately public invoices endpoint, that's a separate decision.

**What it would find in your workspace today**

I read your workspace (read-only). Of the endpoints that touch `invoices`, these have `auth = "users"`: `invoices_GET` and `invoices/{invoice_id}` GET. The one that breaks your rule is:

- `invoices/export` GET (`workspace/api/app/invoices/export_GET.xs`). It has no `auth` line and runs `db.query invoices` with no `where` and no paging, so it returns the whole invoices table to anyone. Its own comment says it was added "temporarily". The policy would flag it. I have not changed it.

Fixing it means adding `auth = "users"` (or your auth table) and probably restricting it to the caller's org. That changes who can call the endpoint, so I need your go-ahead before editing it. Let me know if you want that.

**What the policy can't do**

- It checks the stored definitions only. It can't tell whether an endpoint is really protected at runtime, or what data it sends back.
- It doesn't cover the "full table" part directly. A paged list can still be big, and an unpaged read is not limited by this rule. If you want that caught too, I'd add a `statement.param_bound` rule on `db.query` `per_page` (PERF-001). I haven't added it because you asked about auth.
- It doesn't enforce the habit: a policy only runs when someone pushes or evaluates. Making it blocking is what stops a 2am push.

**Next steps**

1. Tell me whether to make the `invoices/export` fix (add auth and org scoping). I'll show the exact change first.
2. Decide whether this should be blocking. I'd recommend it, once the export endpoint is fixed.
3. I have not run `xano policy evaluate` or pushed anything; that needs your confirmation.
