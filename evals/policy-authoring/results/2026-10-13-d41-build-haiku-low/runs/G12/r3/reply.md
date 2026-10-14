# Plan and result: production/staging separation and on-call-only prod access

## Plan

I checked the workspace (74 documents pulled, no policies yet) and the policy catalogue. Neither of your two requirements can be enforced by a policy in this workspace, so the plan is to build nothing.

**Objects I will build:** none.

**Changes to existing objects:** none.

**Policy:** none. No check reads the things your two requirements are about:

1. **"Production data never ends up in staging."** This is a statement about records and copies between environments. Policies read stored object definitions only, never table records, what a request sent or stored, or data copied between branches, environments or tenants. The catalogue lists this as `runtime_data`.
2. **"Devs can only get into prod through the on-call process."** This is about who can reach the production environment and who approved their access. Access reviews and change approvals happen outside the definitions. The catalogue lists these as `access_reviews_and_approvals` and `people_and_training`. A blocking policy can hold a merge, but it cannot see who signed it off.

I also looked for a partial version of each:

- The `tenants` table has a `region` and `status`, but nothing in it marks an environment as production or staging. Without that, a rule has no object to select.
- None of the 37 checks restricts which environment a database read or an external call points at. The closest checks (`outbound.vendor_allowlist`, `table.write_location_restricted`) would approve or restrict hosts or writers. Neither would stop production records being copied to staging, so using them would check something other than what you asked for.
- The admin-role templates (`AUTH-002`, `AUTH-030`) cover who can call admin endpoints of the app. They do not cover developer access to the production environment, so they do not fit.

I did not write a policy that only looks adjacent to your goal, because it would show a green result that did not mean your requirements were met.

## Result

- Built: nothing.
- Changed: nothing.
- Policy files written: none.
- Dry run: not run. There was nothing to push, and the brief says to run it only after building.
- No `xano` command that creates, publishes, edits, deletes or evaluates was run.

## What you should know before you act on this

Both requirements have to be enforced outside Xano, or with inputs Xano does not have yet:

- **Production data stays out of staging:** keep production and staging on separate workspaces, or branches with separate databases and credentials, and restrict who can copy or export data between them. A review of your export and backup process is the control to check. A policy cannot verify it.
- **Developers reach production only through on-call:** this is an access control in your identity provider or Xano's workspace membership, plus a change approval step. Review who holds production access each cycle, and make the on-call path the only grant that leads there. Policies do not see either.

What would make a partial policy possible later:

- A field or tag that marks each environment and its tables as production or non-production. With that, a rule could at least require that objects reaching production tables are tagged accordingly and that staging objects do not reach them. That still would not show that data was not copied.
- A check that reads which environment or database a statement connects to. Today there is none.

If you want, I can add the environment tags and the tag rules once you decide how production should be marked. That would be a new change for your review, not something I have built here.
