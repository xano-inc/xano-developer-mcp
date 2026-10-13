I looked at your workspace and the policy platform, and I can't write a policy that makes sure everyone has finished security awareness training before touching customer data. I've written no policy file.

**Why:** Xano policies only check the stored definitions of the workspace: tables, fields, tags, endpoints, functions and their settings. None of them can see whether a person has completed training. Training records live in your HR or LMS system, so this needs a process outside Xano. Nothing in the workspace records training either.

**What I found:**
- Your customer data sits in tables such as `customers`, `customer_notes`, `payment_method`, `invoices` and `support_tickets`.
- None of those tables carry a classification tag I could see, so a policy can't yet tell which tables hold customer data.

**What a policy can do, if you want it:**
- Access control on customer data: a policy can require that endpoints reaching tables tagged as sensitive also require a login (`CONF-010`, "Sensitive tables are only reached by logged-in endpoints"). This limits who can reach the data. It does not prove anyone was trained, so please don't treat it as covering the training requirement.
- Tagging: a policy can require that confidential tables carry a tag (`CONF-012`), which would make the customer-data tables visible to other policies. Adding tags is a change to your workspace, so that's your decision.

**What you would still need outside Xano:** a training-completion check in your identity or HR system, and a rule (or a sign-off step) that stops staff without it getting access to the workspace. If you want, I can draft the list of tables to tag, but I won't change anything without your go-ahead.
