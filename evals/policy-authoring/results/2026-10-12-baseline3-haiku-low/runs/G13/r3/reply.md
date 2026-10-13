I looked at this, and I can't write a policy that enforces it. I have not created anything in your workspace.

**Why:** Xano policies check what is stored in the workspace: tables, endpoints, functions, tags and similar objects. None of the available checks can see whether a person has completed security awareness training. That record lives in your training or HR system, outside Xano, so no rule could tell whether someone is trained before they work with customer data.

**What I checked:** I read your workspace (71 documents: tables, endpoints, functions, tasks and tests). Your tables have no tags, and the only tags in the code are `public` and `smoke`. So even the "customer data" side has no marker a rule could use yet. I found no policy in the workspace already.

**What could be done, if you want it:**
1. **Mark the tables that hold customer data** (for example `customers`, `patients`, `clinical_notes`, `payment_method`) with a tag such as `customer-data`. This is a change to your tables, so it's your team's call, and I would not make it for you. Once the tag exists, a policy could require that those tables are only reached by logged-in endpoints. That is an access-control check, not a training check.
2. **Keep the training requirement in your process.** Training completion can be enforced in your identity provider or access-management tool, where access to Xano is granted. Xano can't read that record.

If you want, I can draft option 1 once you confirm the tag name and which tables it should cover.
