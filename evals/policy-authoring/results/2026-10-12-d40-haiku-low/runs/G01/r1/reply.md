I've written a policy that requires login on every endpoint that touches your `invoices` table. It's in `out/AUTH-010.xs`. It parses cleanly and the parser reported no warnings. I have not published it or evaluated it, so nothing is live yet.

**What the policy does**

- Key `AUTH-010`, based on the "Endpoints require login" template. It is `active = true` and `enforcement = "advisory"`.
- One rule: `object.auth_required` with `tables: ["invoices"]`. It judges every endpoint that reads or writes the `invoices` table, directly or through a function it calls.
- It has no `except_tags: ["public"]` exemption. The template includes one, but a public-tagged endpoint that returns invoices is exactly what you want caught, so I left it out. If you have a legitimately public endpoint that reaches invoices, the exemption is your call to add.

**Two things to decide**

1. **Advisory vs blocking.** As written, the policy reports findings but does not block anything, so it would not have stopped the 2am deploy. If you want it to block a merge or a push to live, change `enforcement` to `"blocking"`. Be aware that a blocking policy then holds every change that introduces a finding, including ones you're making in a hurry. I haven't made that change.
2. **Scope.** The rule matches endpoints that reach `invoices` by name. If you rename the table, or add a new table holding invoice data, the rule won't follow it. Tagging the table and scoping by tag would cover that, but it needs a tag your workspace doesn't have yet.

**What I found in your workspace (not changed)**

The policy will flag these when it runs, because neither endpoint sets `auth`:

- `GET /invoices/export` (`workspace/api/app/invoices/export_GET.xs`): returns every row of `invoices` with no login and no paging. This is the one that matches your description. The comment says it was added "temporarily".
- `GET /invoices/{invoice_id}` (`workspace/api/app/invoices/invoice_id_GET.xs`): returns one invoice with its line items, also with no login.

`GET /invoices` (`invoices_GET.xs`) does require login, so it is not flagged. I did not edit either endpoint. Adding auth changes who can call it, so that's your decision.

**Not covered by this policy**

- Unbounded reads. The export endpoint returns every row. The policy checks login only, not paging. A separate `PERF-001` rule could catch unpaged reads, but I haven't written it since you didn't ask.
- What a logged-in user is allowed to see. The check reads the saved auth setting, not your authorization logic.
- Whether someone has run the policy on a branch. Nothing is checked until `xano policy evaluate` or a push runs it.

**Next steps**

- Review `out/AUTH-010.xs`, then publish it when you're ready. I can run `xano policy evaluate` after you've published it.
- Decide whether to make it blocking.
- Fix or remove the two unauthenticated endpoints, then re-run the policy to confirm the findings clear.
