I can't write a policy that checks whether someone has completed security awareness training. Xano policies only read the stored definitions of your workspace objects (tables, endpoints, functions, tasks and so on). Who is on the team and what training they have done sits outside that, so no policy can see it or block someone on it.

What I can do with policies is limit how the customer-data tables are reached, which is a related but different control. I have not written one yet, because it changes who can call your endpoints and you should decide that first. The options I found in your workspace:

1. **Endpoints that reach customer-data tables require login** (`object.auth_required`, scoped by table name). Your workspace has tables such as `customers`, `invoices`, `payments`, `payment_method`, `patients`, `clinical_notes`, `orders` and `support_tickets`. Scoping by these names would show which endpoints reach them without a login. Some endpoints, such as `health_GET` and `newsletter/subscribe_POST`, look deliberately public, so they would need exempting by the policy owner.
2. **Tag the customer-data tables** (for example `pii`) so that later policies can apply to them. None of your tables carry a tag today. Adding one changes the table, so I would propose it separately rather than do it.

Neither option confirms that a person has been trained. Training would still need an organisational process, such as a training record kept outside Xano and checked before someone is given workspace access. A policy also cannot show that a logged-in user is trained.

Tell me which of these you want. I will write the policy and run `xano policy parse` on it. I will not publish or push anything without your go-ahead.
