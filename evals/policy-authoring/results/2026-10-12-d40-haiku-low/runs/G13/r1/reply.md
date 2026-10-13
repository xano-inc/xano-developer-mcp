I looked at this, and I don't think a Xano policy can enforce it, so I haven't written one.

Xano policies only read the stored definitions of your workspace: tables, endpoints, functions, tasks and so on. They can't see who is on the team or whether they've finished security awareness training. Training records live with your HR or LMS system, so that check has to happen there.

Here is what the workspace does and doesn't have:

- The workspace has no policies yet (`xano policy list` returned none).
- Your tables (for example `customers`, `patients`, `payments`, `orders`, `invoices`, `clinical_notes`) carry no tags and no fields marked sensitive. A policy that targets customer data would have to name those tables by name.

The nearest thing a policy can check is that API endpoints which read customer tables require a login. That is an access control on the API, not a control on people. It wouldn't stop a team member from working with that data in Studio, the CLI, or a database export, so I'd be presenting it as a training control when it isn't one. I haven't written it for that reason.

If you'd still like that API-level control, tell me which tables count as customer data and I can draft an advisory policy for it. It would be a separate decision for you and the policy owner, and it wouldn't cover training.

For the training requirement itself, the practical options are:
1. Have your training system or HR process confirm completion before access is granted to the workspace or to the customer data.
2. Keep an access review or sign-off record for anyone who gets write access.
