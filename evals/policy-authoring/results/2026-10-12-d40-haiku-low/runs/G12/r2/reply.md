Hi, thanks for the question. I looked through the workspace and the policy catalogue, and I don't think a Xano policy can enforce either half of what you asked. I've written no policy file, so nothing is set up that would change how your workspace is evaluated.

**Why no policy fits**

- **"Production data never ends up in staging."** Policies read stored object definitions on a branch: endpoints, functions, tables, tasks and so on. They never read the records in tables, and they can't see data copied between environments or tenants. Nothing in the workspace definitions marks a table as production data or a branch as staging, so there is nothing a check could key on. The closest things are `table.tag_required` and `object.tagged_table_access`, but they only act on tags you add, and tagging does not stop a copy from happening.
- **"Devs only get into prod through the on-call process."** Who can reach production, and whether a change went through on-call, lives in your access controls and approval process, not in the definitions. A policy can see a blocking gate on a merge or a set-live, but it can't see who approved it. The approval table in your workspace (`approval_requests`) is for agent-proposed actions, so it isn't an on-call record either.

**What would help**

- Enforce the data rule where it actually happens: keep production credentials and connection settings out of the staging environment, and keep environment variables separate per environment. The `literal.credential_shape` check (SEC-012) can help keep secrets out of definitions, but it doesn't handle this.
- Enforce the access rule in your identity provider and on-call tooling. Use Xano's own access and branch permissions to limit who can publish to the live branch.
- If you later tag production tables (for example `prod-data`) and an environment marker exists, we can revisit a rule that requires those tables to be tagged and to be reached only by approved endpoints. That would be a partial check, not a guarantee.

I'm not able to say what your organization's on-call process is, so the process half needs an owner who can confirm it.
