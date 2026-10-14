# Security training before touching customer data: no policy can enforce this

I did not build anything and did not write a policy. Xano policies can't see whether a person has completed security awareness training, so there is no rule that can make this requirement true.

## Plan (decided before any build)

- **Objects to build:** none.
- **Existing objects to change:** none.
- **Policy:** none. A policy here would only check objects in the workspace definitions, and training records are not among them.
- **Left unchecked:** everything in the ask. Training completion is about people, and the catalogue lists "People and training" among the things no rule can see. Policies read stored object definitions only.

## Why no policy fits

- The ask has two parts: (1) each team member has completed training, and (2) they can't touch customer data until they have. Part 1 is a fact about people, and no check reads it.
- Part 2 could in principle be built as a runtime gate: a training-records table plus a middleware that rejects callers without a recent completion row, attached to customer-data endpoints. I did not build this. The gate would only be as true as the rows someone types into the table, and nothing in Xano verifies them. A policy could then only confirm the gate is attached, which says nothing about whether anyone trained. You would be paying for a control whose truth still depends on a manual process, and I did not want to present that as a policy-enforced guarantee.
- The "access reviews and approvals" area is also out of reach. A blocking policy can hold a merge but cannot see who signed off on it.

## What the customer should do instead

1. **Track training outside the workspace.** Use your LMS or HR system to record completion. Keep proof of completion there, not in a Xano table.
2. **Limit who can change the workspace.** Restrict workspace access to people who have completed training, using your identity provider or Xano team roles. This is a process and access control, not a policy.
3. **Use policies for what they can see.** For customer-data objects, the existing checks can keep them from being exposed (for example login requirements, no personal data in responses, sensitive fields marked). Those are not a training control, but they reduce the chance that an untrained person's change exposes data.

## What no object or policy here can see

- Whether any person has completed security awareness training, or when.
- Who approved a change, or who holds access to the workspace.
- Live customer data, or what anyone did with it at runtime.

## Dry run

Not run. Nothing was built or changed, so there was nothing new to validate. The workspace was pulled into `./workspace` for reading only.
