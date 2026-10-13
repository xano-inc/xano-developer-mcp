I've drafted two policies for your admin API. They are not published yet, and I have not run them against your workspace.

**1. `AUTH-002`: Admin endpoints check the caller's role** (critical, advisory)
Every endpoint in the `admin` API group must call `check_admin_role` as its first statement, passing the logged-in user. That function stops the request unless the user's role is `admin` or `support_lead`. The policy confirms the call comes first. It does not read the role test itself, which is in `check_admin_role`.

**2. `ADMIN-020`: Tenant reads and writes filter by org_id** (high, advisory)
Every read and write of the `tenants` table must filter on `org_id`, wherever it happens. I did not set the filter to equal the caller's org, because your request doesn't say what it should match.

Things to know before you publish:

- **"Under /admin" means the `admin` API group.** The policy can't select endpoints by URL path. `admin/stats` lives in the `app` API group, so it is not covered.
- **Some existing endpoints will be flagged when I predict the policies against your workspace.** I expect `admin/tenants_GET` (no role check, unfiltered query on `tenants`) and `admin/tenants/{tenant_id}` PATCH (reads by `id` before the role check and writes without an `org_id` filter) to be reported. `orgs/{org_id}/tenants_GET` and `users_GET` look compliant. These are predictions, not evaluation results.
- **Blocking is your call.** Both are advisory, so they block nothing. Making either blocking is the policy owner's decision, and it would refuse merges or pushes that introduce a finding.
- **Some parts of your request no check covers:** that the role must be exactly `admin` or `support_lead` (only the function's code holds that), and whether any staff action must reach `tenants` across orgs. If cross-org access is needed, that needs an exemption decision from the policy owner.

Shall I evaluate these once they're published, or do you want changes first?
