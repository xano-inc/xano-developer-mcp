Yes, most of this is checkable. I wrote one policy, `AUTH-010`, and checked that it parses. I have not pushed or evaluated it, so nothing is enforced yet.

**What the policy does**

It takes the template "Endpoints require login" and scopes it to the `invoices` table: every endpoint that reads or writes `invoices`, directly or through a function it calls, must require login. The only exemption is the `public` tag, which you would have to add on purpose. Nothing in your workspace carries it on an invoices endpoint today.

**Something to fix now, before the policy runs**

`workspace/api/app/invoices/export_GET.xs` (`GET invoices/export`) has no `auth` line. It returns every row of `invoices` with no filter and no paging, and anyone can call it. This is the exact endpoint you described. I have not changed it. The fix is to add `auth = "users"` and restrict the query to the caller's org, as `invoices_GET` does. Changing auth changes who can call the endpoint, so I need your yes first. Tell me which auth table to use (`users` is the one the other invoice endpoints use) and whether the accountant export should stay public.

**What the policy does not cover**

- "Returns the full invoices table" is not something any check measures. The checks look at auth, fields, and inputs, not how many rows a query returns. Even an authenticated endpoint could still dump every invoice in the table, and no policy here stops that. A code review or a test is the way to catch it.
- The policy is advisory. It reports the finding but does not block a push. If you want it to stop a push to the live branch, set `enforcement = "blocking"`. Say so and I will make that change. Blocking gates pushes, so it's your call.
- The policy scopes by table name, `invoices`. The table has no tag, so a rename would make the rule silently match nothing. If you want it to survive a rename, add an `invoices` tag to the table. That is a change to your table, so I have not made it.

**Once you say yes**

I'll make the `export_GET` change, then run `xano policy evaluate` and report what it prints. My prediction is one finding, on `invoices/export`. The other two `invoices` endpoints already require login.
