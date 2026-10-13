# Reply to the customer

Thanks for asking. I set up five policy files for review in `out/`. I have **not** published them to your workspace, and I have not run them against your workspace. Nothing in your workspace has changed.

## What a policy can and can't show

A Xano policy checks the saved definitions of your endpoints, tables and functions against a rule. A pass means "the saved definitions matched the rule when it ran". It is not proof that a person reviewed a change or that access was reviewed. SOC 2 is an audit of how your organisation works over time, so these policies are one input to your evidence, not the evidence itself.

## What the policies cover

- **AUTH-010, endpoints require login** (access). Every endpoint needs a logged-in user, except ones tagged `public`. Your sign-in, health check and newsletter signup are already tagged `public`.
- **AUTH-002, admin endpoints check the caller's role** (access). Every endpoint in the `admin` API group must run `check_admin_role` first.
- **AUTH-030, users can't change their own role** (access). Record writes don't take the `role` field from request input.
- **CHG-001, endpoints are tested** (change control). Each endpoint has a test, and the tests check something. This is weaker than an approval trail: it shows changes are tested, not that someone approved them.
- **RET-001, only the audit function writes the audit log** (change record). The `audit_log` table must exist, and only `record_audit_event` may write to it.

All five are `active` and `advisory`, so they flag things but block nothing.

## What no policy can cover

- **Access reviews** (someone checking every quarter that each person still has the right access, and signing it off). No Xano check does this. It needs a regular review process outside the product.
- **A record that each change was approved** before it went live. No check exists for this.
- **Removing access** when someone leaves or changes role. This is a process too.
- **Keeping the results** of the policy runs for the auditor over time. That needs your own process.

## Things to decide before you publish

1. The admin rule scopes to the `admin` API group, not a tag. The standard template uses a tag called `admin`, but your admin endpoints don't have that tag.
2. The `public` exemption is your call. Please confirm the three endpoints tagged `public` should stay public.
3. The SOC 2 criteria in the tags (CC6.1, CC6.2, CC6.3, CC7.2, CC8.1) are my mapping. Please check it with your auditor.

I haven't run the policies, so I can't yet tell you which endpoints would fail. Once you say yes, I can publish them and run an evaluation, and report exactly what it prints.
