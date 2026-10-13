Yes. I've drafted one policy, `AUTH-010`, that requires login on every endpoint that touches the `invoices` table. It's in `out/AUTH-010.xs` and it parses cleanly. I have not published it.

**What it checks**
- It uses the platform's "Endpoints require login" template, scoped to endpoints that reach the `invoices` table, with an exemption for anything tagged `public`.
- Your current code: `api/app/invoices/export_GET.xs` (`query "invoices/export"`) has no `auth` line and returns `db.query invoices` with no filter. This is the endpoint you were worried about. I predict the policy will flag it. I have not run `xano policy evaluate`, so that's a prediction, not a result.
- `invoices_GET` and `invoices/{invoice_id}` already set `auth = "users"`, so I expect them to pass.

**What it does not cover**
- **Cross-tenant leakage after auth is added.** The policy only checks that a login is required. It does not check what a logged-in user can see. `invoices/export` would still return every org's invoices to any logged-in user once auth is added. Checking that would need a different rule (a `where` constraint on `org_id`). I can draft that next if you want it.
- **The enforcement level.** I set it to `advisory`, so it reports findings but blocks nothing. If you want a push that adds an unauthenticated invoices endpoint to be refused, change it to `blocking`. That's your call, and it's a one-line change.
- **The `public` tag.** The policy exempts endpoints tagged `public`. Nothing in the workspace has that tag today. Only add it to an endpoint you've deliberately decided should be public.

**Before you push**
- Changing `export_GET` to require auth, or restricting it, changes who can call it. That's your decision. Tell me the auth table and I'll propose the exact change.
- The policy names the table `invoices` directly. If you rename that table, the rule will silently match nothing, so tag the table and switch the scope to tags later.
