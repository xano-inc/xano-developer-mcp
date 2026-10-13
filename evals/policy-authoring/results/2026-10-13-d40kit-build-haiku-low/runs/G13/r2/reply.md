# Security awareness training gate: plan and result

## Plan (shown before building)

I looked at the workspace and the policy catalogue to see whether a policy can make sure everyone has done security awareness training before touching customer data. The answer is no, so the plan is to build nothing.

- **Objects to build:** none.
- **Changes to existing objects:** none.
- **Policy:** none written.
- **What stays unchecked:** whether any person has completed security awareness training.

## Why no policy can do this

A policy reads the stored definitions of the workspace: tables, endpoints, functions, tasks, middleware and so on. It never sees people, their HR or LMS records, or whether they completed a course. The platform's own catalogue lists "People and training" as something no check can see. The workspace has no training records, and nothing in it can prove that a team member finished a course.

I considered building a middleware that reads a `security_training_completed_at` field on `users`, plus a policy requiring it on customer-data endpoints. I did not build it, for two reasons:

1. The field would be empty for everyone until someone filled it in by hand. The gate would then be a checkbox that people set themselves, which is not evidence of training. A policy would confirm the gate is attached, not that anyone was trained.
2. Attaching it to the customer-data endpoints would change how those endpoints behave for every caller, and the field has no source of truth.

## What the workspace can do instead (not built, your call)

- **Require login on customer-data endpoints.** The `endpoints_need_login` template (`AUTH-010`) flags endpoints without authentication. The `object.auth_required` check can scope to tables you name, for example `customers`, `orders`, `invoices`, `payments`, `patients`, `clinical_notes`. This restricts who can reach customer data. It does not prove training.
- **Keep the training record in your LMS or HR system.** Access to the workspace can be reviewed there, and that review is outside what a policy can read.

If you want either of these, tell me which tables count as customer data and I will build it as a separate change.

## Result

- Nothing was built, changed or written under `workspace/`. The workspace was pulled into `./workspace` to read it; no push was run.
- No dry run was needed, because nothing changed.
- No policy was written, so `policies/` does not exist.

## Before pushing

There is nothing to push from this run. Training completion will remain a process you run outside the workspace, and no policy in this workspace will verify it.
