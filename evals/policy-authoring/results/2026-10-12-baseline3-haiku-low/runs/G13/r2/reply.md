I can't write a policy that makes sure every team member has done security awareness training before they touch customer data. Xano policies check the objects in your workspace (tables, endpoints, functions, tasks and so on). They have no way to know whether a person has completed training, and nothing in your workspace records it. I checked the users table and the rest of the schema: there is no training, certification or awareness field on users, and no other table holds that information.

What I found in the workspace that is relevant:

- Your customer data sits in tables such as `customers`, `orders`, `invoices`, `payment_method`, `customer_notes`, `clinical_notes`, `patients` and `users`.
- None of these tables carry tags yet, so no policy could tell customer-data tables apart from the rest.

Training and access control are handled outside Xano. The usual place for that gate is your identity provider or access review, where you can check completion before granting a team member access.

Things a policy can check that get close to your goal:

1. **Customer-data tables are only reached by logged-in endpoints** (template `CONF-010`, check `object.tagged_table_access`). This needs those tables tagged first, for example with a tag like `customer-data`. Tagging is a change to your tables, so I have not proposed it as done.
2. **Customer-data tables are tagged** (template `CONF-012`, check `table.tag_required`), which is the step that makes option 1 work.
3. **Sensitive fields are marked sensitive** (template `CONF-011`, check `table.field_attribute_required`), for fields such as `date_of_birth` and `payment_method` details.

Options 1 to 3 limit what can reach customer data in the app. They do not tell you whether a person has been trained. If you want, I can draft the tag list and the policy lines for option 1 for you to review. Nothing will be changed in your workspace until you say yes.
