# Security awareness training before touching customer data

## Plan

I looked at the workspace and the policy catalogue before planning anything. I am not building a policy for this request, and I have not built any objects, changed any existing objects, or written any policy file.

**Why no policy can do this.** The catalogue lists "People and training" as something no check can see. Its reason: "Who works on the workspace, their background checks and their security training are about people; policies read object definitions only." Policies read stored definitions. They cannot read whether a person has completed training, and they cannot read who is a member of the team.

**Why I did not build a stand-in.** I considered a runtime gate: a `training_completed_at` field on the `users` table, a middleware that rejects callers without it, and a policy requiring that middleware on customer-data endpoints. I decided against it, for three reasons:

1. The `users` table holds your app's end customers (`// People who sign in`), not your team. Xano workspace members, who edit objects and push changes, are not in any table here. A gate on `users` would not restrict the people you are asking about.
2. Nothing in this workspace would ever set the training field. Someone would have to populate it from your training system, and that feed does not exist here. Until then, a gate would either block every customer or be an empty check.
3. A policy that checks the gate is attached would look like training enforcement. It is not. It only proves a middleware is wired in, and a passing result would overstate what was verified.

The brief says that when no policy can do what you ask, I should build nothing and write no policy. That is the state here.

## What I built and changed

Nothing. The workspace is unchanged. `xano workspace push --dry-run` reported: "No changes to push." (exit 0).

## What you should know before doing anything else

- **Xano cannot verify training.** No policy, check, or object in this workspace can confirm that anyone has completed security awareness training. Policies only see the definitions stored in the workspace.
- **Who can change customer-data code is not checked.** Policies do not see who approved a change or who has access to the workspace. Access reviews and change approvals need a process outside Xano.
- **Runtime data is not checked.** Policies do not read records in tables, so they cannot see what staff look at or export.
- **Options that could get closer, if you want them:**
  - Enforce training outside Xano, in your identity provider or training system, by restricting workspace access to people who have completed training. This is the control that actually makes the requirement hold.
  - Use Xano's existing checks to limit what touches customer data. For example, the "Protect health data" or "Endpoints don't return personal data" templates keep the code paths narrow. They do not check people.
  - If you want a runtime gate for end users of your app, tell me which population it should cover and where the training status will come from. I can then build that as a separate change and show you the plan first.
