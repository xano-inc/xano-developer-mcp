Thanks for the request. I looked at your workspace and the policy checks, and I can't write a policy that enforces either half of this today. I haven't written any policy file, so nothing is changed in your workspace.

**1. "Production data never ends up in staging"**
No check reads what is copied between environments or what sits in a table's records. Policies read stored object definitions only (tables, endpoints, functions, tasks, tags), so they can't see a prod-to-staging data copy. This needs a control outside Xano: a restricted export/import process, or a data-masking step in your copy job, with the copy jobs reviewed by your team.

What I can do that is related: policies can check that personal-data fields are marked sensitive (CONF-011), that tables holding them are tagged (CONF-012), and that sensitive data is not returned from endpoints (DATA-010). That makes sure data is classified before anyone moves it, but it does not stop a copy. Your workspace has no table tags today, so these would flag most tables until you tag them.

**2. "Devs can only get into prod through the on-call process"**
Who may access production is an access-control and approval question. Policies can't see user access, who approved a change, or on-call rotas. The closest checks are change-related rules, such as keeping audit-log writes in one function (RET-001), but they don't stop a developer from making a change, and they don't check approvals.

**What would help**
- Your access controls for production (role membership, SSO groups, or Xano's workspace permissions) and your on-call approval flow, enforced in your identity provider or change tool.
- If you later want an in-repo signal, a tag such as `on-call-approved` on each change, combined with a process that enforces it, would need your team to define how the tag is applied. A policy can only check that the tag exists, not who applied it.

I'd suggest starting with the classification policies (CONF-011, CONF-012, DATA-010) if you want something in Xano now. Tell me if you'd like me to draft those for review. I'd name the personal-data fields and the tags you use, since I don't have a list of them.
