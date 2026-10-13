Here's a set of six policies that cover the things you're tired of reviewing. None of them stop anything by themselves yet, and I've kept them advisory on purpose; see the end.

**What's in the set**

| Policy | What it checks | Your point it covers |
| --- | --- | --- |
| `LOG-010` External calls handle their own failures | Every `api.request` sits inside a `try` block | Missing error handling |
| `CHG-001` Endpoints are tested | Every endpoint is called by a test that asserts something, and protected endpoints have a test that an anonymous call is rejected | No tests |
| `CONV-040` Endpoints and functions stay short | At most 30 statements and 3 levels of nesting per endpoint or function | Giant functions |
| `CONV-050` No leftover code | No disabled statements, unused inputs or unused variables | Leftover code |
| `PERF-001` Endpoints never return every row | List reads are paged, at most 1000 rows | Unbounded reads |
| `REVIEW-010` Functions say what they do | Every function has a description of at least 20 characters | Functions nobody can read |

`LOG-010`, `CHG-001`, `CONV-040`, `CONV-050` and `PERF-001` are the standard policies for this kind of review. `REVIEW-010` is one extra rule I added, not a standard policy.

**What these will and won't catch**

- **Error handling:** `LOG-010` checks that a `try` block wraps each `api.request`. It doesn't check that the catch does anything useful. It also only covers `api.request`, not the other outbound calls.
- **Tests:** `CHG-001` checks that a test exists and asserts something. It doesn't check that the test passes or tests the right thing.
- **"200 line functions":** `CONV-040` counts statements and nesting, not lines. The 30-statement limit is the template's default, and you can change it.
- **Breaking prod:** the policies look at stored definitions. They can't see runtime data, what gets deployed, or who approved a change.

**What I saw in your workspace (predictions, not run)**

I couldn't run `xano policy evaluate` here, so these are my reading of the code, not findings:

- `payments/charge` (POST) calls Stripe with no `try` around it, so `LOG-010` should flag it. `acme_get_tracking` already wraps its call, so it should pass.
- `acme_sync_shipping_rates` has a long, deeply nested stack, so `CONV-040` should flag it.
- The workspace has only two workflow tests, so `CHG-001` will probably flag most of your endpoints until they have tests.

**Blocking**

These are advisory. An advisory finding is visible but doesn't block a merge, a save or a push to the live branch. Making any of them blocking is the policy owner's decision. If you set one to blocking, it would refuse any change that introduces a finding of that policy.

**One thing to decide**

Your legacy endpoints and functions will break `CONV-040` on day one. The usual fix is to tag them `legacy` and exempt that tag. Your workspace has no `legacy` tag, so I haven't added an exemption. If you want one, create the tag on those objects first, then tell me and I'll add it to `CONV-040`.

The six policy files are in `out/` (`LOG-010.xs`, `CHG-001.xs`, `CONV-040.xs`, `CONV-050.xs`, `PERF-001.xs`, `REVIEW-010.xs`). None of them is published. All six parse.
