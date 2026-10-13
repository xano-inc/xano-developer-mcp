I've written a policy that would flag any endpoint reading the `invoices` table without a login. It's in `out/AUTH-010.xs`. I have not published it or run it against your workspace.

**What it checks**

- It uses the platform's "Endpoints require login" check (`object.auth_required`), limited to endpoints that reach your `invoices` table. You don't have an `invoices` tag, so I scoped it by table name. If you rename that table, the rule will silently match nothing, so tell me if you'd rather add a tag.
- An endpoint tagged `public` is exempt. That's the platform's standard exemption for things like login or webhooks, and it's your call whether to keep it.
- Severity is critical. The policy is active and set to advisory, so it reports findings but doesn't block anything yet.

**What I expect it to catch in your code (predicted, not run)**

- `GET /invoices/export` (`api/app/invoices/export_GET.xs`) has no `auth` setting and returns every row in `invoices` across all orgs. This is the endpoint you described, and the policy should flag it.
- `GET /invoices` and `GET /invoices/{invoice_id}` both require `users` auth and should pass.
- `POST /payments/charge` also requires `users` auth and should pass.

**What it doesn't cover**

- **"Full table even when logged in."** `/invoices/export` returns all invoices for every org. Even with a login added, a logged-in user from one org could download every org's invoices. The login check won't catch that. Fixing it means filtering by `org_id`, and I can't write that as a policy check that works for you yet. I can propose a separate rule for it.
- **Blocking vs advisory.** "Nobody ships it, including me at 2am" suggests you want this to block. Advisory only reports. Switching to blocking would stop a merge or a save that adds the finding. Do you want that? I haven't changed it.

**Next steps (need your go-ahead)**

1. Confirm the table-name scope, or ask me to add an `invoices` tag instead.
2. Decide between advisory and blocking.
3. Decide whether to keep the `public` exemption.

Once you say yes, I can push the policy and run `xano policy evaluate` to confirm the predicted match. I haven't pushed anything yet.
