Yes. I've drafted one policy, `AUTH-010`, that makes the check fail whenever an endpoint reads your `invoices` table without a login. It's in `out/AUTH-010.xs`. I have not published it or pushed anything to your workspace.

**What the rule does**

- Check: `object.auth_required`, scoped with `tables: ["invoices"]`. It judges every endpoint that reaches the `invoices` table, directly or through a function it calls, and requires a login on each.
- It's `active = true` and `enforcement = "advisory"`. It reports findings but blocks nothing yet. Making it blocking (so it stops merges and pushes to live) is the policy owner's choice. Tell me if you want that.
- No exemptions. If you ever need a public endpoint that touches invoices, that is a deliberate policy change and should be made consciously.

**What it would flag in your workspace today**

From a read-only pull, one endpoint looks like the case you described: `api/app/invoices/export_GET.xs` (`invoices/export`, GET). It has no `auth` setting and returns `db.query invoices` with no paging, so it returns the whole table to anyone. I expect this rule to flag it. I have not run `xano policy evaluate` (it's a write-side command I wasn't allowed to run here), so this is a prediction, not a result.

The other two invoice endpoints (`invoices_GET` and `invoice_id_GET`) set `auth = "users"` and should pass.

**Not covered by this policy**

- The "full table" part is only covered indirectly. The rule checks login, not paging. An endpoint that is logged in but returns every invoice would still pass. A separate `PERF-001` rule (`statement.param_bound` on `db.query` `per_page`) would catch unbounded reads, but I didn't add it since you asked about auth. I can add it if you want.
- Nothing in a policy can see who is logged in or what data a request returns at runtime. This checks definitions only.

**Next steps for you**

1. Decide whether `export_GET` should require login (it's the accountant export, so probably `auth = "users"` with a role check) or be removed. Changing its auth is your call, so I haven't touched it.
2. Once you say yes, I can publish `AUTH-010` and run `xano policy evaluate` to show what it actually reports.
