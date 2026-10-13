I've written a policy that catches endpoints reaching the invoices table without login. It's in `out/AUTH-010.xs`. I have not published it, so nothing is live yet.

**What it checks:** it uses the platform's "Endpoints require login" template (AUTH-010), narrowed to endpoints that reach the `invoices` table. I checked your workspace and found this endpoint already in violation:

- `api/app/invoices/export_GET.xs` (`invoices/export`, GET). It has no `auth` line and runs `db.query invoices` with no filter and no paging, so it returns every invoice to anyone. This is the "almost done it twice" one. Fixing it means adding `auth = "users"` and scoping the query to the caller's org, which is a change to who can call it, so I have not made it. Tell me the auth table to use (I'd guess `users`, as in `invoices_GET.xs`) and whether the export should still return all invoices for the caller's org.

Other invoice endpoints, `invoices_GET` and `invoices/{invoice_id}`, already require `users`, so they pass.

**Settings I chose:**
- Severity critical, `active = true`, `enforcement = "advisory"`. That's the default for a new policy, so it flags findings but blocks nothing. You said "nobody ever ships", which suggests blocking. Switching to `enforcement = "blocking"` would make a push that introduces a finding fail (exit code 2). Tell me if you want that.
- Exemption: `except_tags: ["public"]`. An endpoint that should be public (login, signup, webhook) gets that tag. Tagging it is your decision.

**What the policy does not cover:** it cannot tell whether an endpoint returns the whole table. No check looks at unpaginated reads. The `export` endpoint is caught because it has no auth, not because it returns everything. A logged-in endpoint that dumps all invoices would pass. For that you'd need a separate check, and none exists in the catalogue.

I haven't run `xano policy evaluate` against the live workspace, so I don't know what it reports there yet. The file parses cleanly with `xano policy parse`.
