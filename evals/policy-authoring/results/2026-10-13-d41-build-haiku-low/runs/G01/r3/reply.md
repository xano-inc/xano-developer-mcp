# Plan

Nothing to build as an object. The rule reads each endpoint's saved auth setting, so one policy is enough.

- **New objects:** none.
- **Changes to existing objects:** none. The one endpoint that breaks the rule, `invoices/export` (`workspace/api/app/invoices/export_GET.xs`), has no `auth` line and returns every invoice. I am not changing it: turning on login changes who can call it, so that is your call.
- **Policy `AUTH-010` (from the "Endpoints require login" template), active, advisory, severity high.** One rule: `object.auth_required` with `tables: ["invoices"]`. Every endpoint that reaches the `invoices` table, directly or through a function it calls, must require login. This also covers new endpoints, so nobody has to remember to add the policy to each one.
- **Not checked:** whether an endpoint returns the whole table (paging is `PERF-001`, not asked for here); who the login admits and whether rows are scoped to the caller (`AUTH-020`); runtime behaviour, environments and copies of data. The check reads only the saved `auth` setting.

# Result

Built: `workspace/policies/AUTH-010.xs`. It parses, and the push dry run reports one change: `CREATE policy AUTH-010`. It reported no blocked objects and no missing references.

I did not run `xano policy evaluate`, and I did not push.

## Before you push

- **The policy will report `invoices/export` as a finding** once it is pushed. That is the endpoint you were worried about. Adding `auth = "users"` clears it, but only you can decide whether that endpoint should stay open.
- **It is advisory.** A finding does not block a merge, set-live or save. If you want it to block, that is a separate change to `enforcement` in the policy file, and blocking would refuse a set-live or save that introduces a finding.
- **It is not a guarantee.** The check cannot see who a login admits, whether a query filters by the caller's org, how many rows a page returns, or what happens at runtime.
