# Security training gate for customer-data access: no policy, nothing built

## Plan

I checked whether any policy can enforce this and concluded it cannot, so the plan is to build nothing.

**Why.** The requirement is that every person on the team has completed security awareness training before they touch customer data. Policies read only the stored definitions of workspace objects (tables, endpoints, functions, tasks, middleware, tags). They cannot see:

- who is on the team,
- whether anyone has completed training,
- or anything about the people who make changes.

The platform classes this as "People and training", which no check can see. Building a training table and a middleware to simulate the check would mean inventing a training process and gating production endpoints on records that no one maintains. That would look like enforcement without being any. It would also change how your live endpoints behave, which you did not ask for.

**Objects I would build:** none.
**Changes to existing objects:** none.
**Policy:** none written.

## Result

- Pulled the workspace (74 documents). No object references training, awareness or employees. No policies exist in the workspace (`xano policy list`: "No policies found.").
- Nothing was written to `./workspace` and no policy file was created.
- No dry run was needed because nothing changed.

## What a policy can still do

These are adjacent controls that a policy can check. They do not verify training.

1. **Gate customer-data endpoints with a training-check middleware.** You would first need to decide what the gate reads: a training-records table, a sign-off flag, or an external system. A policy (`object.middleware_required`) could then confirm that every endpoint reaching your customer-data tables runs that middleware. This checks that the gate is wired in, not that anyone was trained.
2. **Tag customer-data tables and restrict who can write to them.** `table.write_location_restricted` can limit writes to approved functions, and `object.tagged_table_access` can require login on endpoints that reach tagged tables. Together these narrow who can reach customer data at runtime. They do not check whether those people have been trained.

Both options need a decision from you first (which table or system holds training status, which tables count as customer data, and which tag marks them). I have not applied either.

## What no check can see

- Whether each person has completed security awareness training, when, or whether it is current.
- Who is on the team and who has access to the Xano workspace outside its definitions (access reviews and approvals).
- Runtime data, copies between environments, and what people do with exported data.
- Infrastructure and network controls, such as hosting, encryption at rest, backups and penetration tests.

Training completion has to be enforced through a process or an identity system (for example, your SSO or LMS), with evidence kept outside Xano. A policy here would not be that evidence.

## What the customer should know before pushing

- There is nothing to push from this change. No file under `./workspace` was created or changed.
- If you choose option 1 or 2 above, tell me the training data source and the customer-data tables, and I will build it as a separate change.
