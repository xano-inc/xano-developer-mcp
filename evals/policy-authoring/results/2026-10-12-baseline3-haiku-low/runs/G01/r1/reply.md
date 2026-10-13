I've written a policy that flags any endpoint without login, and it would have caught the invoice leak you're worried about.

**What I found in your workspace**

- `GET invoices/export` (api group `app`) has no `auth` line, so it is public. It runs `db.query invoices` with no filter and no paging, so it returns every invoice across every org. That is the "full invoices table without auth" case, and it is live in the code I pulled.
- `invoices_GET` and `invoices/{invoice_id}` both require `auth = "users"`.
- Public endpoints in your workspace already carry the `public` tag: `health_GET`, `auth/login_POST` and `newsletter/subscribe_POST`.

**The policy: `AUTH-010` ("Endpoints require login")**

I wrote it as `out/AUTH-010.xs`. It is the platform's standard template, with no changes:

- One rule, `object.auth_required`, with `except_tags: ["public"]`, so your login, health and newsletter endpoints stay exempt.
- Severity critical, `active = true`, `enforcement = "advisory"`.
- It parses cleanly with `xano policy parse`.

I have not published it. Nothing in the workspace has been changed or evaluated.

**Things to decide**

1. **Advisory or blocking.** Right now it only reports findings. You said "nobody ships" this, so you probably want `enforcement = "blocking"`. A blocking policy stops a save or push to the live branch that would add a finding, and a tenant deploy of a release that has one. I kept advisory because that's the default for a new policy. Say the word and I'll switch it.
2. **The `invoices/export` endpoint.** Once the policy is published, it will report this endpoint. The fix is to add `auth = "users"` and scope the query to the caller's org. Adding auth changes who can call it, so I'd want your OK on exactly which auth table to use before I edit it.
3. **The "full table" part.** AUTH-010 only checks login. It does not check that a logged-in user only sees their own org's rows. That is a separate concern, and the policy template for it (AUTH-020) would need its `compare_to` aimed at `$me.org_id` rather than `$auth.id` in your code. I didn't add it because you asked about auth specifically.

**Next step:** publish it with `xano policy create` (or push), and I'll run `xano policy evaluate` to see the findings. I expect one finding, on `invoices/export`, and no others, but I haven't run that yet.
