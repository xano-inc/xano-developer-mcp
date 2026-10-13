Hi, I looked at what Xano's policies can check, and I'm not going to write a policy for either half of this request, because neither is something policies can see.

**1. "Production data never ends up in staging."** Policies read stored object definitions only: tables, endpoints, functions, tags, and so on. They never read the records in a table, and they can't see data copied between branches, environments or tenants. No check in the catalogue covers that. A policy would look like it enforces this and wouldn't.

**2. "Devs can only get into prod through the on-call process."** Who may access production, and whether an on-call process approved it, is an access-control and change-approval question. Policies can't see people, access reviews or sign-offs. A blocking policy can hold a merge or a set-live, but it can't tell whether a person was on call or approved.

What I'd suggest instead:

- Enforce both in your Xano environment setup and your access process: separate workspaces or branches for prod and staging, role-based access to prod, and an on-call approval step outside the code.
- Use policies for the related things they can check. For example, tag the tables that hold personal or confidential data (`CONF-012`) and make sure sensitive fields are marked (`CONF-011`). Your workspace has `patients`, `tenants` and `clinical_notes`, so this is a sensible place to start. Those controls reduce the impact of a data leak. They don't prevent a copy from prod to staging.

If you want, I can write one of those tagging or sensitive-field policies next. I haven't created or changed anything in your workspace.
