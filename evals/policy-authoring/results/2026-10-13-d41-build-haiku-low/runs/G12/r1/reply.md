# Policy request: keep production data out of staging, and gate prod access behind on-call

## Plan

I checked the request against what a policy can read. Policies read stored object definitions in the workspace (tables, endpoints, functions, tasks, middleware, tags, settings). They do not read the records in tables, what a request sent or stored, or data copied between branches, environments or tenants. The catalogue says this directly (topic "Runtime data and copies between environments"). Who may reach production, and whether an on-call process approved a change, is a separate topic the catalogue also excludes ("Access reviews and change approvals": a blocking policy can hold a merge but cannot see who signed it off).

So the two halves of the ask fall outside what a policy can do:

1. **Production data never ends up in staging.** Copying data between environments is a runtime action. No check reads it. The closest checks (the `tables_classified` template, `table.write_location_restricted`, `table.coverage_required`) describe definitions, not copies, so a policy written on them would pass while a data copy happened.
2. **Developers reach prod only through on-call.** Approval and access are people-and-process controls. Policies cannot see who approved a change or who holds access.

**Objects to build:** none.
**Existing objects to change:** none.
**Policy:** none. Writing one would give a false sense of coverage, so I have not written a partial policy.

## What I did

- Pulled the workspace into `./workspace` and read the catalogue, templates and recipes.
- Built no objects, changed no existing objects, and wrote no policy file. The brief says to build nothing when no policy can do the ask, and that is the case here.
- Ran no push, including no dry run, because there is nothing to push.

## What no policy here can see or guarantee

- Whether any data is copied from production to staging, by export, backup restore, script or manual step.
- Who holds production access, and whether a developer used the on-call process to get it.
- Whether a change to production was approved by on-call. A blocking policy can hold a merge, but it cannot tell who signed it off.

## What would close the gap

These controls need to live outside Xano:

- Branch and environment access controls in your Xano workspace settings and your identity provider, restricting prod to on-call roles.
- A documented on-call approval step (ticket or change record) required before prod changes, enforced in your change tooling.
- A data-handling rule in your runbooks or a DLP/backup control that blocks prod-to-staging copies, plus an audit of restore and export actions.

If you want, I can write an advisory policy for a narrower, checkable part, such as requiring `tables_classified` on every table so data sensitivity is at least recorded in definitions. I have not built it, because it does not address the two things you asked for.

## Dry run

Not run. Nothing was built or changed, so there was nothing to validate. The `xano workspace push --dry-run` step applies once you choose a narrower policy to add.

## Before you push

Nothing to push from this change.
