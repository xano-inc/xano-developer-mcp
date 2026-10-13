I looked at your workspace and the policy checks available, and I can't write a policy that makes sure people have done security awareness training. I haven't created or changed anything in your workspace, and I haven't written a policy file.

**Why no policy fits**

- Policies only read what is stored in the workspace: tables, endpoints, functions, tags, and so on. Training records are kept somewhere else (your learning or HR system), and no check can look at them.
- The "team" isn't in the workspace either. The people who can edit this workspace aren't stored as objects that a policy could check. The `users` table holds your app's end users, not your staff.
- The workspace has no tags at all right now, so there is nothing to hang a "trained" marker on. A tag you add yourself would only say someone was trained if a person sets it correctly. That would be a self-attested label, not a check, so I don't recommend it.

**What I found that is related**

- Your customer data is in tables such as `customers`, `payment_method`, `customer_notes`, `orders`, `invoices`, `support_tickets`, `patients` and `clinical_notes`.
- None of these tables carry a tag. A policy can only restrict who reaches them through code, for example requiring a logged-in endpoint. That is an access-control rule, not a training rule, so I haven't written it. I can draft it if you want it.

**What would close the gap**

- Training: enforce it where the access is granted, in your identity or access management system or your learning platform. Most of these can block a user from getting access until a course is complete.
- Workspace access: review who holds workspace roles in Xano, and remove anyone who hasn't completed training.
- In Xano: if you want a rule that every endpoint touching customer tables requires login, tell me and I'll write that policy for you to review.
