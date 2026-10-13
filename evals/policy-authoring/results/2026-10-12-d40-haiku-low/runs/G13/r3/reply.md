I can't write a Xano policy that enforces this one. Xano policies only read how your workspace is built: tables, endpoints, functions, tags and so on. They can't see people, so they can't tell whether someone has finished security awareness training, and nothing in the policy catalogue checks that. A policy would therefore never stop someone from touching customer data who hasn't been trained, so I've written no policy file.

What I'd suggest instead:

- **Enforce training outside Xano.** Keep it in your identity or HR system: make training completion a condition of getting access to the workspace and to the customer-data systems, and review that list regularly. Xano can't prove this.
- **Related control I can write, if you want it.** Policies can check that endpoints which reach customer-data tables require a logged-in caller. Your workspace has tables such as `customers`, `payments`, `payment_method`, `patients`, `clinical_notes` and `invoices`, but none of them carry a tag yet. A policy that uses the table names would check this control, though it wouldn't prove anyone was trained. I haven't written it, because you asked about training. Tell me if you want it.
- **Limits of that control.** The workspace's table-level definitions can't show who is on the team or who has access, and a passing policy only means the stored definitions matched the rule when it ran. It is not a compliance certification.

If you want, I can draft that login-on-customer-data policy as an advisory policy for you to review before anything is published.
