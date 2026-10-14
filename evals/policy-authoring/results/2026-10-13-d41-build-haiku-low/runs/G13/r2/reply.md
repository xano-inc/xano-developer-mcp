# Security awareness training before touching customer data

## Plan

I checked whether a Xano policy can enforce this. It cannot, so my plan is to build nothing.

**Why no policy can do it:** Xano policies read the workspace's stored object definitions (tables, endpoints, functions, tasks, middleware, tags). They do not read people, accounts or HR records. "Everyone on the team has completed security awareness training" is a fact about people, and the catalogue lists "People and training" as a topic no check can see. Nothing in the workspace records who is on the team or whether they have trained, so there is no object for a rule to point at.

**Objects I would build:** none.
**Existing objects I would change:** none.
**Policy:** none.

**What stays unchecked:** all of the ask. Training completion, who counts as "the team", and whether anyone is allowed to touch customer data in practice are all outside Xano.

**A partial option, if you want one:** I could build a training gate: a table recording each team member's training status and a middleware that blocks the customer-data endpoints (patients, customers, payments, clinical notes, invoices) unless that member's record shows completed training. A policy could then confirm the gate is attached to those endpoints, using the `protected_endpoints_run_middleware` template or an `object.middleware_required` rule. This would not prove training happened. Someone or some process would still have to set the status flag, and the flag would be only as accurate as that process. It also adds runtime behaviour to your app, so I have not built it without your go-ahead.

## Result

- Built: nothing. No files under `workspace/` were created or changed.
- Policies written: none.
- Dry run (`xano workspace push -d ./workspace --dry-run`): "No changes to push." The workspace matches what was pulled.

## Before you push

Nothing needs pushing for this request. If you choose the partial option above, the training record and the gate would need your review, and the training status would need an owner who keeps it current. Training completion itself should be tracked in your LMS or HR system and checked by your access-review process, not in Xano.

**Confidence that a policy achieves the goal:** low. No policy can see training, so none can achieve it.
