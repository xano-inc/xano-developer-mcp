I've drafted three policies that cover the review comments you're tired of. Nothing is published yet; the files are in `out/` for you to look at first.

**What I found in the workspace:** `policy-authoring-eval` has no policies yet. It has 11 functions, 20+ tables, 3 tasks and a set of endpoints. I read the code but did not run any evaluation, so I can't tell you yet which objects fail.

**The three policies (all `active`, `advisory`, so they flag findings but block nothing):**

1. **`CHG-001`, Endpoints are tested.** Every endpoint must be called by a test, and that test must assert something. Protected endpoints also need a test that an anonymous call is rejected. This is the library's standard "endpoints are tested" policy.
2. **`LOG-010`, External calls handle their own failures.** Every `api.request` must sit inside a `try_catch`. This covers vendor calls only, not error handling in general.
3. **`REVIEW-001`, Functions stay small and are tested.** Functions may hold at most 30 statements and 3 levels of nesting, and each function must be called by a test. This is the closest match to your "200 line functions" complaint. It counts statements, not lines, and the 30 limit is my choice; tell me if you want a different number.

**What these don't catch:**
- **"Stop juniors breaking prod" as a whole.** No check measures that. It depends on how you deploy and review, which a policy can't see.
- **Missing error handling in general.** The check only looks at external calls. A function without a `try_catch` around its own logic is not flagged.
- **Tests that are weak.** The checks confirm a test exists and makes an assertion, not that the assertion is meaningful.

**Next steps:**
- Review the three files in `out/`. Once you're happy, they can be published with `xano workspace push --dry-run` first, so you can see what would change.
- Run `xano policy evaluate` after publishing to see which existing functions and endpoints already fail. I expect `REVIEW-001` to flag some of the longer functions, but I haven't checked.
- If you want any of these to block a push to live, switch `enforcement` to `blocking`. Do that after the advisory run, because blocking gates merges and set-live.
